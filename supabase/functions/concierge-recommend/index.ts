import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { address } = await req.json();
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) throw new Error("MINIMAX_API_KEY not configured");
    if (!address || address.length < 10) throw new Error("Endereço muito curto");

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
