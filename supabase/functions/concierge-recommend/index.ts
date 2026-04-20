import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_DAYS = 30;
const TOP_PER_CATEGORY = 8;

interface DBPlace {
  id: string;
  category_id: string;
  category_label: string;
  category_icon: string;
  category_order: number;
  name: string;
  brand: string | null;
  address: string;
  lat: number;
  lng: number;
  summary: string;
  display_order: number;
}

interface ResponsePlace {
  name: string;
  address: string;
  distance_km: number;
  time_min: string;
  summary: string;
  gmaps: string;
  waze: string;
}

interface ResponseCategory {
  id: string;
  icon: string;
  label: string;
  places: ResponsePlace[];
}

function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,#]/g, "");
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDriveTime(km: number): string {
  // ~1.5 min/km em área urbana de Orlando
  const minutes = Math.max(2, Math.round(km * 1.5));
  const lower = Math.max(2, minutes - 3);
  const upper = minutes + 5;
  return `${lower}-${upper} min`;
}

function buildGmapsUrl(lat: number, lng: number, name: string): string {
  const q = encodeURIComponent(`${name} @${lat},${lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function buildWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

async function geocodeWithMapbox(
  address: string,
  token: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${token}&country=US&proximity=-81.379,28.538&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox geocoding failed:", res.status);
    return null;
  }
  const data = await res.json();
  const feature = data?.features?.[0];
  if (!feature?.center || feature.center.length < 2) return null;
  const [lng, lat] = feature.center;
  // Garantir que é na área de Orlando (raio amplo ~150km)
  const orlandoDist = haversineKm(28.5384, -81.3789, lat, lng);
  if (orlandoDist > 150) return null;
  return { lat, lng };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address || typeof address !== "string" || address.length < 10) {
      return new Response(JSON.stringify({ error: "Endereço muito curto" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalized = normalizeAddress(address);

    // Cache check
    const { data: cached } = await supabase
      .from("concierge_cache")
      .select("recommendations")
      .eq("address_normalized", normalized)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.recommendations) {
      console.log("Cache HIT:", normalized);
      return new Response(JSON.stringify(cached.recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Cache MISS:", normalized);

    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN");
    if (!MAPBOX_TOKEN) {
      console.error("MAPBOX_ACCESS_TOKEN secret not set");
      return new Response(
        JSON.stringify({ error: "Servidor não configurado (contate o suporte)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const origin = await geocodeWithMapbox(address, MAPBOX_TOKEN);
    if (!origin) {
      return new Response(
        JSON.stringify({
          error:
            "Não conseguimos localizar esse endereço em Orlando. Verifique se o endereço está completo (rua, número, cidade, FL).",
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: places, error: placesError } = await supabase
      .from("concierge_places")
      .select(
        "id, category_id, category_label, category_icon, category_order, name, brand, address, lat, lng, summary, display_order",
      )
      .eq("active", true);

    if (placesError || !places?.length) {
      console.error("Failed to load places:", placesError);
      return new Response(
        JSON.stringify({ error: "Base de locais temporariamente indisponível" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    type EnrichedPlace = DBPlace & { distance_km: number };
    const byCategory = new Map<
      string,
      { meta: { icon: string; label: string; order: number }; items: EnrichedPlace[] }
    >();

    for (const p of places as DBPlace[]) {
      const distance_km = haversineKm(origin.lat, origin.lng, p.lat, p.lng);
      const bucket = byCategory.get(p.category_id);
      if (!bucket) {
        byCategory.set(p.category_id, {
          meta: { icon: p.category_icon, label: p.category_label, order: p.category_order },
          items: [{ ...p, distance_km }],
        });
      } else {
        bucket.items.push({ ...p, distance_km });
      }
    }

    const categories: ResponseCategory[] = Array.from(byCategory.entries())
      .sort(([, a], [, b]) => a.meta.order - b.meta.order)
      .map(([id, { meta, items }]) => {
        items.sort((a, b) => a.distance_km - b.distance_km);
        const top = items.slice(0, TOP_PER_CATEGORY);
        return {
          id,
          icon: meta.icon,
          label: meta.label,
          places: top.map<ResponsePlace>((p) => ({
            name: p.name,
            address: p.address,
            distance_km: Math.round(p.distance_km * 10) / 10,
            time_min: estimateDriveTime(p.distance_km),
            summary: p.summary,
            gmaps: buildGmapsUrl(p.lat, p.lng, p.name),
            waze: buildWazeUrl(p.lat, p.lng),
          })),
        };
      });

    const result = { categories };

    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("concierge_cache")
      .upsert(
        {
          address_normalized: normalized,
          address_original: address,
          recommendations: result,
          expires_at: expiresAt,
          hit_count: 0,
        },
        { onConflict: "address_normalized" },
      )
      .then(({ error }) => {
        if (error) console.error("Cache write error:", error);
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("concierge-recommend fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
