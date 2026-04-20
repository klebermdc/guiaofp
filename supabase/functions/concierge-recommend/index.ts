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
 * Geocoding: 1) tenta match exato em hotéis populares; 2) Mapbox legacy v5.
 */
async function geocodeWithMapbox(
  address: string,
  token: string,
): Promise<{ lat: number; lng: number } | null> {
  // 1) Match local com lista curada (definida abaixo)
  const popular = searchPopularPlaces(address);
  if (popular.length > 0) {
    return { lat: popular[0].lat, lng: popular[0].lng };
  }

  // 2) Geocoding v5 legacy
  const bbox = `${ORLANDO_BBOX.minLng},${ORLANDO_BBOX.minLat},${ORLANDO_BBOX.maxLng},${ORLANDO_BBOX.maxLat}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=us&bbox=${bbox}&proximity=${PROXIMITY}&limit=1&access_token=${token}`;
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

// Lista curada de hotéis e marcos populares de Orlando para autocomplete instantâneo.
// Match por substring case-insensitive. Coordenadas precisas evitam round-trip ao Mapbox.
const POPULAR_PLACES: Array<{ name: string; address: string; lat: number; lng: number }> = [
  // Rosen
  { name: "Rosen Plaza Hotel", address: "9700 International Dr, Orlando, FL 32819", lat: 28.4248, lng: -81.4663 },
  { name: "Rosen Centre Hotel", address: "9840 International Dr, Orlando, FL 32819", lat: 28.4233, lng: -81.4670 },
  { name: "Rosen Shingle Creek", address: "9939 Universal Blvd, Orlando, FL 32819", lat: 28.4316, lng: -81.4543 },
  { name: "Rosen Inn International", address: "7600 International Dr, Orlando, FL 32819", lat: 28.4459, lng: -81.4707 },
  { name: "Rosen Inn Pointe Orlando", address: "9000 International Dr, Orlando, FL 32819", lat: 28.4338, lng: -81.4694 },
  { name: "Rosen Inn at Universal", address: "6327 International Dr, Orlando, FL 32819", lat: 28.4570, lng: -81.4690 },
  // Universal
  { name: "Universal's Cabana Bay Beach Resort", address: "6550 Adventure Way, Orlando, FL 32819", lat: 28.4670, lng: -81.4720 },
  { name: "Universal's Endless Summer Resort - Surfside Inn", address: "7000 Universal Blvd, Orlando, FL 32819", lat: 28.4548, lng: -81.4667 },
  { name: "Universal's Endless Summer Resort - Dockside Inn", address: "7125 Universal Blvd, Orlando, FL 32819", lat: 28.4533, lng: -81.4661 },
  { name: "Loews Royal Pacific Resort", address: "6300 Hollywood Way, Orlando, FL 32819", lat: 28.4663, lng: -81.4729 },
  { name: "Loews Sapphire Falls Resort", address: "6601 Adventure Way, Orlando, FL 32819", lat: 28.4655, lng: -81.4683 },
  { name: "Loews Portofino Bay Hotel", address: "5601 Universal Blvd, Orlando, FL 32819", lat: 28.4727, lng: -81.4661 },
  { name: "Hard Rock Hotel Orlando", address: "5800 Universal Blvd, Orlando, FL 32819", lat: 28.4708, lng: -81.4683 },
  // Disney Resorts
  { name: "Disney's Grand Floridian Resort & Spa", address: "4401 Floridian Way, Lake Buena Vista, FL 32830", lat: 28.4117, lng: -81.5829 },
  { name: "Disney's Polynesian Village Resort", address: "1600 Seven Seas Dr, Lake Buena Vista, FL 32830", lat: 28.4080, lng: -81.5849 },
  { name: "Disney's Contemporary Resort", address: "4600 N World Dr, Lake Buena Vista, FL 32830", lat: 28.4150, lng: -81.5742 },
  { name: "Disney's Animal Kingdom Lodge", address: "2901 Osceola Pkwy, Bay Lake, FL 32830", lat: 28.3553, lng: -81.6037 },
  { name: "Disney's Beach Club Resort", address: "1800 Epcot Resorts Blvd, Lake Buena Vista, FL 32830", lat: 28.3722, lng: -81.5586 },
  { name: "Disney's Yacht Club Resort", address: "1700 Epcot Resorts Blvd, Lake Buena Vista, FL 32830", lat: 28.3735, lng: -81.5577 },
  { name: "Disney's BoardWalk Inn", address: "2101 Epcot Resorts Blvd, Lake Buena Vista, FL 32830", lat: 28.3702, lng: -81.5556 },
  { name: "Disney's Caribbean Beach Resort", address: "900 Cayman Way, Orlando, FL 32830", lat: 28.3886, lng: -81.5697 },
  { name: "Disney's Coronado Springs Resort", address: "1000 W Buena Vista Dr, Lake Buena Vista, FL 32830", lat: 28.3661, lng: -81.5798 },
  { name: "Disney's Port Orleans Resort - French Quarter", address: "2201 Orleans Dr, Lake Buena Vista, FL 32830", lat: 28.3892, lng: -81.5448 },
  { name: "Disney's Port Orleans Resort - Riverside", address: "1251 Riverside Dr, Lake Buena Vista, FL 32830", lat: 28.3866, lng: -81.5407 },
  { name: "Disney's Pop Century Resort", address: "1050 Century Dr, Lake Buena Vista, FL 32830", lat: 28.3853, lng: -81.5511 },
  { name: "Disney's Art of Animation Resort", address: "1850 Animation Way, Lake Buena Vista, FL 32830", lat: 28.3837, lng: -81.5509 },
  { name: "Disney's All-Star Movies Resort", address: "1991 W Buena Vista Dr, Lake Buena Vista, FL 32830", lat: 28.3439, lng: -81.5784 },
  { name: "Disney's All-Star Music Resort", address: "1801 W Buena Vista Dr, Lake Buena Vista, FL 32830", lat: 28.3454, lng: -81.5755 },
  { name: "Disney's All-Star Sports Resort", address: "1701 W Buena Vista Dr, Lake Buena Vista, FL 32830", lat: 28.3470, lng: -81.5739 },
  { name: "Disney's Wilderness Lodge", address: "901 Timberline Dr, Lake Buena Vista, FL 32830", lat: 28.4267, lng: -81.5719 },
  { name: "Disney's Old Key West Resort", address: "1510 N Cove Rd, Lake Buena Vista, FL 32830", lat: 28.3788, lng: -81.5298 },
  { name: "Disney's Saratoga Springs Resort & Spa", address: "1960 Broadway, Lake Buena Vista, FL 32830", lat: 28.3710, lng: -81.5283 },
  { name: "Disney's Riviera Resort", address: "1080 Esplanade Ave, Lake Buena Vista, FL 32830", lat: 28.3783, lng: -81.5635 },
  // Marriott / I-Drive
  { name: "Orlando World Center Marriott", address: "8701 World Center Dr, Orlando, FL 32821", lat: 28.3814, lng: -81.5208 },
  { name: "Hilton Orlando", address: "6001 Destination Pkwy, Orlando, FL 32819", lat: 28.4254, lng: -81.4612 },
  { name: "Hyatt Regency Orlando", address: "9801 International Dr, Orlando, FL 32819", lat: 28.4234, lng: -81.4691 },
  { name: "JW Marriott Orlando Grande Lakes", address: "4040 Central Florida Pkwy, Orlando, FL 32837", lat: 28.4031, lng: -81.4456 },
  { name: "Ritz-Carlton Orlando, Grande Lakes", address: "4012 Central Florida Pkwy, Orlando, FL 32837", lat: 28.4046, lng: -81.4423 },
  { name: "Caribe Royale Orlando", address: "8101 World Center Dr, Orlando, FL 32821", lat: 28.3779, lng: -81.5273 },
  { name: "Hilton Bonnet Creek", address: "14100 Bonnet Creek Resort Ln, Orlando, FL 32821", lat: 28.3755, lng: -81.5455 },
  { name: "Waldorf Astoria Orlando", address: "14200 Bonnet Creek Resort Ln, Orlando, FL 32821", lat: 28.3756, lng: -81.5478 },
  { name: "Wyndham Grand Orlando Resort Bonnet Creek", address: "14651 Chelonia Pkwy, Orlando, FL 32821", lat: 28.3691, lng: -81.5431 },
  { name: "Gaylord Palms Resort", address: "6000 W Osceola Pkwy, Kissimmee, FL 34746", lat: 28.3614, lng: -81.4944 },
  { name: "Westgate Lakes Resort & Spa", address: "9500 Turkey Lake Rd, Orlando, FL 32819", lat: 28.4247, lng: -81.4872 },
  { name: "Westgate Vacation Villas", address: "7700 Westgate Blvd, Kissimmee, FL 34747", lat: 28.3372, lng: -81.6107 },
  // Outros populares
  { name: "DoubleTree by Hilton at the Entrance to Universal", address: "5780 Major Blvd, Orlando, FL 32819", lat: 28.4717, lng: -81.4622 },
  { name: "Holiday Inn Resort Orlando Suites - Waterpark", address: "14500 Continental Gateway, Orlando, FL 32821", lat: 28.3748, lng: -81.5333 },
  { name: "Embassy Suites by Hilton Orlando International Drive", address: "8978 International Dr, Orlando, FL 32819", lat: 28.4361, lng: -81.4699 },
  { name: "Hilton Grand Vacations Tuscany Village", address: "8122 Arrezzo Way, Orlando, FL 32821", lat: 28.4034, lng: -81.4823 },
  { name: "Sheraton Vistana Resort Villas", address: "8800 Vistana Centre Dr, Orlando, FL 32821", lat: 28.3873, lng: -81.5230 },
  { name: "Sheraton Vistana Villages Resort Villas", address: "12401 International Dr, Orlando, FL 32821", lat: 28.3949, lng: -81.4789 },
  { name: "Renaissance Orlando at SeaWorld", address: "6677 Sea Harbor Dr, Orlando, FL 32821", lat: 28.4181, lng: -81.4651 },
];

function searchPopularPlaces(query: string): AutocompleteSuggestion[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  // Match: cada palavra da query deve aparecer em sequência ou dispersa no nome.
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: Array<{ p: typeof POPULAR_PLACES[number]; score: number }> = [];
  for (const p of POPULAR_PLACES) {
    const lower = p.name.toLowerCase();
    let score = 0;
    let allMatch = true;
    for (const t of tokens) {
      if (!lower.includes(t)) { allMatch = false; break; }
      // bônus se token aparece no início
      if (lower.startsWith(t)) score += 10;
      score += 1;
    }
    if (allMatch) {
      // bônus se query inteira for substring
      if (lower.includes(q)) score += 5;
      scored.push({ p, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 6).map(({ p }) => ({
    type: "place",
    label: p.name,
    sublabel: p.address,
    lat: p.lat,
    lng: p.lng,
  }));
}

/**
 * Autocomplete: 1) busca curada local de hotéis populares (instant) +
 *               2) Mapbox legacy v5 para endereços (ruas).
 */
async function autocompleteWithMapbox(
  query: string,
  token: string,
): Promise<AutocompleteSuggestion[]> {
  const popular = searchPopularPlaces(query);

  // Pegar até 4 endereços via Mapbox para complementar
  const bbox = `${ORLANDO_BBOX.minLng},${ORLANDO_BBOX.minLat},${ORLANDO_BBOX.maxLng},${ORLANDO_BBOX.maxLat}`;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=us&bbox=${bbox}&proximity=${PROXIMITY}&limit=4&types=address&access_token=${token}`;

  let addresses: AutocompleteSuggestion[] = [];
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const feats = (data.features ?? []) as Array<{
        text?: string;
        place_name?: string;
        center?: [number, number];
      }>;
      for (const f of feats) {
        if (!f.center || f.center.length !== 2) continue;
        const [lng, lat] = f.center;
        if (!isInsideOrlando(lat, lng)) continue;
        const placeName = f.place_name ?? f.text ?? "";
        const label = f.text ?? placeName;
        const sublabel = placeName.replace(label, "").replace(/^,\s*/, "");
        addresses.push({ type: "address", label, sublabel, lat, lng });
      }
    }
  } catch (e) {
    console.warn("Mapbox address autocomplete failed:", e);
  }

  // Hotéis primeiro, endereços depois, máximo 8
  return [...popular, ...addresses].slice(0, 8);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const MAPBOX_TOKEN = Deno.env.get("MAPBOX_ACCESS_TOKEN");

    // === Modo autocomplete ===
    if (body?.mode === "autocomplete") {
      const q: string = typeof body?.query === "string" ? body.query.trim() : "";
      if (q.length < 2 || !MAPBOX_TOKEN) {
        return new Response(JSON.stringify({ suggestions: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const suggestions = await autocompleteWithMapbox(q, MAPBOX_TOKEN);
      return new Response(JSON.stringify({ suggestions }), {
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
