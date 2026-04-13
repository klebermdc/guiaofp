import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_HOURS = 24;

const SYSTEM_PROMPT = `Você é um concierge de viagens especializado em Orlando, Florida.
O usuário vai informar o endereço do hotel onde está hospedado.
Retorne APENAS JSON válido (sem markdown, sem preamble, sem explicação).

Retorne recomendações em EXATAMENTE 9 categorias, cada uma com 3-5 locais ordenados do mais próximo ao mais distante.

JSON Schema:
{
  "categories": [
    {
      "id": "string",
      "icon": "string (emoji)",
      "label": "string",
      "places": [
        {
          "name": "string",
          "address": "string (endereço completo americano)",
          "distance_km": number,
          "time_min": "string (ex: 10-15 min)",
          "summary": "string (máx 1 linha, estilo guia turístico)",
          "gmaps": "string (https://www.google.com/maps/search/?api=1&query=Endereco+Com+Plus)",
          "waze": "string (https://waze.com/ul?q=Endereco%20Com%20Percent20)"
        }
      ]
    }
  ]
}

As 9 categorias obrigatórias:
1. parques 🎢 Parques Temáticos
2. compras 🛍️ Compras & Outlets
3. lojas 🏷️ Lojas Baratas
4. passeios 🌴 Passeios & Turismo
5. cafes ☕ Cafés & Café da Manhã
6. fastfood 🍔 Fast Food
7. restaurantes 🍽️ Restaurantes
8. mercados 🛒 Supermercados & Farmácias
9. brasileiros 🇧🇷 Restaurantes Brasileiros

Regras:
- Mínimo 3, máximo 5 locais por categoria
- Ordenar do mais próximo ao mais distante
- Nunca repetir locais entre categorias
- Distâncias e tempos realistas baseados no endereço fornecido
- Links Google Maps: query com + no lugar de espaços
- Links Waze: query com %20 no lugar de espaços
- Endereços completos nos links`;

function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,#]/g, '');
}

function makeCacheKey(address: string): string {
  return `concierge:${normalizeAddress(address)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address || address.length < 10) throw new Error("Endereço muito curto");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cacheKey = makeCacheKey(address);

    // Check cache
    const { data: cached } = await supabase
      .from("cache_entries")
      .select("data")
      .eq("key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.data) {
      console.log("Cache HIT for concierge:", cacheKey);
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache miss — call AI
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY not configured");

    const response = await fetch("https://api.minimaxi.chat/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${MINIMAX_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Meu hotel fica em: ${address}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response");
    const result = JSON.parse(jsonMatch[0]);

    // Store in cache (fire-and-forget)
    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    supabase
      .from("cache_entries")
      .upsert({ key: cacheKey, data: result, expires_at: expiresAt, hit_count: 0 }, { onConflict: "key" })
      .then(({ error }) => { if (error) console.error("Cache write error:", error); });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
