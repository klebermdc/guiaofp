import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_DAYS = 30;
const TOP_PER_CATEGORY = 8;

// Bounding box restrita à Grande Orlando
const ORLANDO_BBOX = {
  minLat: 28.10,
  maxLat: 28.95,
  minLng: -81.85,
  maxLng: -81.05,
};
const PROXIMITY = "-81.4711,28.4717"; // I-Drive / Universal area

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

interface AutocompleteSuggestion {
  type: "place" | "address";
  label: string;
  sublabel: string;
  lat: number;
  lng: number;
  mapbox_id?: string; // necessário para retrieve da Search Box API
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

function isInsideOrlando(lat: number, lng: number): boolean {
  return (
    lat >= ORLANDO_BBOX.minLat &&
    lat <= ORLANDO_BBOX.maxLat &&
    lng >= ORLANDO_BBOX.minLng &&
    lng <= ORLANDO_BBOX.maxLng
  );
}

function isValidCoord(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Geocoding via Search Box API (suggest + retrieve) — cobertura completa de POIs.
 * Fallback: Geocoding v5 legacy (apenas endereços).
 */
async function geocodeWithMapbox(
  address: string,
  token: string,
): Promise<{ lat: number; lng: number } | null> {
  // 1) Tentar Search Box API (suggest + retrieve)
  try {
    const sessionToken = crypto.randomUUID();
    const bbox = `${ORLANDO_BBOX.minLng},${ORLANDO_BBOX.minLat},${ORLANDO_BBOX.maxLng},${ORLANDO_BBOX.maxLat}`;
    const suggestUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(address)}&country=us&bbox=${bbox}&proximity=${PROXIMITY}&limit=1&session_token=${sessionToken}&access_token=${token}`;
    const sRes = await fetch(suggestUrl);
    if (sRes.ok) {
      const sData = await sRes.json();
      const sug = sData?.suggestions?.[0];
      if (sug?.mapbox_id) {
        const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${sug.mapbox_id}?session_token=${sessionToken}&access_token=${token}`;
        const rRes = await fetch(retrieveUrl);
        if (rRes.ok) {
          const rData = await rRes.json();
          const coords = rData?.features?.[0]?.geometry?.coordinates;
          if (Array.isArray(coords) && coords.length === 2) {
            const [lng, lat] = coords as [number, number];
            if (isInsideOrlando(lat, lng)) return { lat, lng };
          }
        }
      }
    } else {
      console.warn("Search Box suggest failed:", sRes.status);
    }
  } catch (e) {
    console.warn("Search Box error, falling back to legacy:", e);
  }

  // 2) Fallback: Geocoding v5 legacy
  const bbox = `${ORLANDO_BBOX.minLng},${ORLANDO_BBOX.minLat},${ORLANDO_BBOX.maxLng},${ORLANDO_BBOX.maxLat}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=us&bbox=${bbox}&limit=1&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox legacy geocoding failed:", res.status);
    return null;
  }
  const data = await res.json();
  const feat = data.features?.[0];
  if (!feat?.center || feat.center.length !== 2) return null;
  const [lng, lat] = feat.center as [number, number];
  if (!isInsideOrlando(lat, lng)) return null;
  return { lat, lng };
}

/**
 * Autocomplete via Search Box API (cobertura completa: hotéis, marcos, ruas, etc.)
 */
async function autocompleteWithMapbox(
  query: string,
  token: string,
): Promise<AutocompleteSuggestion[]> {
  const sessionToken = crypto.randomUUID();
  const bbox = `${ORLANDO_BBOX.minLng},${ORLANDO_BBOX.minLat},${ORLANDO_BBOX.maxLng},${ORLANDO_BBOX.maxLat}`;
  const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&country=us&bbox=${bbox}&proximity=${PROXIMITY}&limit=8&session_token=${sessionToken}&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox Search Box suggest failed:", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  const sugs = (data?.suggestions ?? []) as Array<{
    mapbox_id?: string;
    name?: string;
    name_preferred?: string;
    feature_type?: string; // poi, address, street, place, etc.
    place_formatted?: string;
    full_address?: string;
    address?: string;
    context?: { region?: { name?: string }; place?: { name?: string }; postcode?: { name?: string } };
  }>;

  const isPoi = (ft?: string) => ft === "poi" || ft === "category" || ft === "brand";
  const out: AutocompleteSuggestion[] = [];
  for (const s of sugs) {
    if (!s.name) continue;
    const label = s.name;
    const sublabel = s.place_formatted || s.full_address || s.address || "";
    out.push({
      type: isPoi(s.feature_type) ? "place" : "address",
      label,
      sublabel,
      // coordenadas só vêm via /retrieve — preencheremos no momento da seleção
      lat: 0,
      lng: 0,
      mapbox_id: s.mapbox_id,
    });
  }

  // POIs primeiro
  out.sort((a, b) => (a.type === "place" ? -1 : 1) - (b.type === "place" ? -1 : 1));
  return out;
}

/** Retrieve coordinates for a previously suggested mapbox_id */
async function retrieveSuggestionCoords(
  mapboxId: string,
  token: string,
): Promise<{ lat: number; lng: number } | null> {
  const sessionToken = crypto.randomUUID();
  const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}?session_token=${sessionToken}&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Mapbox retrieve failed:", res.status);
    return null;
  }
  const data = await res.json();
  const coords = data?.features?.[0]?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lng, lat] = coords as [number, number];
  if (!isInsideOrlando(lat, lng)) return null;
  return { lat, lng };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN");

    // === Modo autocomplete ===
    if (body?.mode === "autocomplete") {
      const q: string = typeof body?.query === "string" ? body.query.trim() : "";
      if (q.length < 3 || !MAPBOX_TOKEN) {
        return new Response(JSON.stringify({ suggestions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const suggestions = await autocompleteWithMapbox(q, MAPBOX_TOKEN);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Modo retrieve (resolver mapbox_id em coordenadas) ===
    if (body?.mode === "retrieve") {
      const id: string = typeof body?.mapbox_id === "string" ? body.mapbox_id : "";
      if (!id || !MAPBOX_TOKEN) {
        return new Response(JSON.stringify({ error: "mapbox_id obrigatório" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const coords = await retrieveSuggestionCoords(id, MAPBOX_TOKEN);
      if (!coords) {
        return new Response(JSON.stringify({ error: "Não foi possível obter as coordenadas." }), {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(coords), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === Modo recomendação ===
    const address: string = typeof body?.address === "string" ? body.address : "";
    const providedLat = body?.lat;
    const providedLng = body?.lng;
    const hasCoords = isValidCoord(providedLat) && isValidCoord(providedLng);

    if (!hasCoords && (!address || address.length < 10)) {
      return new Response(
        JSON.stringify({ error: "Informe um endereço completo ou sua localização atual." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cacheKey = address
      ? normalizeAddress(address)
      : `coords:${Math.round((providedLat as number) * 10000) / 10000},${Math.round((providedLng as number) * 10000) / 10000}`;

    const { data: cached } = await supabase
      .from("concierge_cache")
      .select("id, recommendations")
      .eq("address_normalized", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.recommendations) {
      console.log("Cache HIT for concierge:", cacheKey);
      return new Response(JSON.stringify(cached.recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let origin: { lat: number; lng: number } | null = null;
    if (hasCoords) {
      if (!isInsideOrlando(providedLat as number, providedLng as number)) {
        return new Response(
          JSON.stringify({ error: "Sua localização atual parece estar fora de Orlando. O Concierge só funciona dentro da região." }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      origin = { lat: providedLat as number, lng: providedLng as number };
    } else {
      if (!MAPBOX_TOKEN) {
        console.error("MAPBOX_ACCESS_TOKEN secret not set");
        return new Response(
          JSON.stringify({ error: "Servidor não configurado (contato suporte)" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      origin = await geocodeWithMapbox(address, MAPBOX_TOKEN);
      if (!origin) {
        return new Response(
          JSON.stringify({ error: "Não conseguimos localizar esse endereço em Orlando. Verifique se o endereço está completo (rua, número, cidade, FL)." }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
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
          address_normalized: cacheKey,
          address_original: address || `${origin.lat},${origin.lng}`,
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
