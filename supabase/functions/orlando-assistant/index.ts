import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é um assistente especialista em Orlando, Flórida, especialmente nos parques temáticos da Disney World e Universal Orlando Resort.

Suas áreas de expertise incluem:
- **Parques Disney**: Magic Kingdom, EPCOT, Hollywood Studios e Animal Kingdom
- **Parques Universal**: Universal Studios Florida, Islands of Adventure e Epic Universe
- **Atrações**: Conhece todas as atrações, horários, dicas de fila única, Lightning Lane/Express Pass
- **Restaurantes**: Recomendações de restaurantes nos parques e em Orlando
- **Hospedagem**: Hotéis dentro e fora dos complexos
- **Transporte**: Como se locomover entre parques e pela cidade
- **Clima**: Melhor época para visitar, como lidar com o calor e chuvas
- **Compras**: Outlets, Disney Springs, CityWalk
- **Dicas práticas**: O que levar na mochila, roupas confortáveis, hidratação

Regras:
1. Sempre responda em português brasileiro
2. Seja amigável, animado e prestativo
3. Dê respostas concisas mas informativas
4. Use emojis quando apropriado para deixar a conversa mais leve
5. Se não souber algo, admita e sugira onde o cliente pode encontrar a informação
6. Foque em dicas práticas que realmente ajudem na experiência do visitante

Comece sempre com uma saudação calorosa se for a primeira mensagem da conversa.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o assistente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Orlando assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
