import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_DAYS = 30;

const SYSTEM_PROMPT = `Você é um concierge de viagens especializado em Orlando, Florida.
O usuário vai informar o endereço do hotel onde está hospedado.
Retorne APENAS JSON válido (sem markdown, sem preamble, sem explicação).

REGRAS PRINCIPAIS:
- Use TODOS os locais da lista abaixo (lista completa obrigatória)
- Ordene cada categoria do mais próximo para o mais distante baseado no endereço do usuário
- Nunca remova nenhum item
- Nunca adicione novos locais
- Sempre busque o endereço mais próximo da rede (ex: Walmart mais próximo daquele endereço)
- Distâncias e tempos devem ser realistas
- Links devem funcionar corretamente
- Não use abreviações no endereço
- Não repita locais

BASE FIXA DE LOCAIS:

PARQUES (id: "parques", icon: "🎢", label: "Parques Temáticos"):
Magic Kingdom, Epcot, Hollywood Studios, Animal Kingdom, Universal Studios Florida, Islands of Adventure, Epic Universe, SeaWorld Orlando

COMPRAS (id: "compras", icon: "🛍️", label: "Compras & Outlets"):
Disney Springs, Orlando Vineland Premium Outlets, Orlando International Premium Outlets, The Florida Mall, Mall at Millenia, The Loop, Marketplace at Dr Phillips, Lake Buena Vista Factory Stores, Best Buy

LOJAS BARATAS (id: "lojas", icon: "🏷️", label: "Lojas Baratas"):
Ross Dress for Less, Marshalls, Burlington, Dollar Tree, Five Below

PASSEIOS (id: "passeios", icon: "🌴", label: "Passeios & Turismo"):
International Drive, ICON Park, Lake Eola Park, Old Town Kissimmee, Celebration, CityWalk Orlando, Kennedy Space Center, Gatorland, Winter Park

CAFÉS (id: "cafes", icon: "☕", label: "Cafés & Café da Manhã"):
IHOP, Keke's Breakfast Cafe, Starbucks, Dunkin', Krispy Kreme, Panera Bread

FAST FOOD (id: "fastfood", icon: "🍔", label: "Fast Food"):
McDonald's, Chick-fil-A, Chipotle, Panda Express, Domino's Pizza, Shake Shack, Earl of Sandwich

RESTAURANTES (id: "restaurantes", icon: "🍽️", label: "Restaurantes"):
Olive Garden, Outback Steakhouse, LongHorn Steakhouse, Miller's Ale House, Red Lobster, Bubba Gump Shrimp Co., Planet Hollywood, Hard Rock Cafe

SUPERMERCADOS (id: "mercados", icon: "🛒", label: "Supermercados & Farmácias"):
Walmart, Target, Publix, CVS Pharmacy, Walgreens, Costco

BRASILEIROS (id: "brasileiros", icon: "🇧🇷", label: "Restaurantes Brasileiros"):
Camila's Restaurant, Café Mineiro, Fogo de Chão, Texas de Brazil, Boi Brazil Churrascaria, Mrs Potato, Pão Gostoso Bakery, Boteco do Manolo, Eskina Restaurant & Bar, Gilson's Restaurant, Tony's Brazilian Grill

PARA CADA LOCAL, GERE:
- name: nome exato do local (como na lista acima)
- address: endereço completo real (formato americano) da unidade mais próxima do hotel
- distance_km: distância em quilômetros (número)
- time_min: tempo estimado de carro (ex: "10-15 min")
- summary: resumo curto (máximo 1 linha, direto e útil para turista)
- gmaps: https://www.google.com/maps/search/?api=1&query=ENDERECO+COM+PLUS
- waze: https://waze.com/ul?q=ENDERECO%20COM%20PERCENT20

JSON Schema:
{
  "categories": [
    {
      "id": "string",
      "icon": "string",
      "label": "string",
      "places": [
        {
          "name": "string",
          "address": "string",
          "distance_km": number,
          "time_min": "string",
          "summary": "string",
          "gmaps": "string",
          "waze": "string"
        }
      ]
    }
  ]
}`;

function normalizeAddress(addr: string): string {
  return addr.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,#]/g, '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    if (!address || address.length < 10) throw new Error("Endereço muito curto");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalized = normalizeAddress(address);

    // Check dedicated cache table
    const { data: cached } = await supabase
      .from("concierge_cache")
      .select("id, recommendations")
      .eq("address_normalized", normalized)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached?.recommendations) {
      console.log("Cache HIT for concierge:", normalized);

      return new Response(JSON.stringify(cached.recommendations), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cache miss — call AI
    console.log("Cache MISS for concierge:", normalized);
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
        temperature: 0.2,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response");
    const result = JSON.parse(jsonMatch[0]);

    // Store in dedicated cache table (fire-and-forget)
    const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    supabase
      .from("concierge_cache")
      .upsert({
        address_normalized: normalized,
        address_original: address,
        recommendations: result,
        expires_at: expiresAt,
        hit_count: 0,
      }, { onConflict: "address_normalized" })
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
