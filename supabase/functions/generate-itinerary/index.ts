import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AttractionInput {
  parkName: string;
  attractionName: string;
  notes?: string;
}

interface ItineraryRequest {
  attractions: AttractionInput[];
  parkDate?: string;
  parkName: string;
  groupSize?: number;
  hasGuide: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { attractions, parkDate, parkName, groupSize, hasGuide }: ItineraryRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const attractionsList = attractions
      .filter(a => a.parkName === parkName)
      .map(a => `- ${a.attractionName}${a.notes ? ` (Nota: ${a.notes})` : ''}`)
      .join('\n');

    if (!attractionsList) {
      return new Response(
        JSON.stringify({ 
          error: "Nenhuma atração selecionada para este parque" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Diferentes prompts baseado no plano
    let systemPrompt: string;
    let userPrompt: string;

    if (hasGuide) {
      // Roteiro COMPLETO para quem tem guia
      systemPrompt = `Você é um especialista em parques temáticos de Orlando com anos de experiência.
Sua tarefa é criar um roteiro OTIMIZADO e DETALHADO para o parque, considerando:
- Fluxo de multidão típico
- Localização das atrações no parque
- Tempo de espera estimado
- Melhor sequência para minimizar caminhadas e filas

Responda em português do Brasil.
Formate a resposta em markdown com emojis.`;

      userPrompt = `Crie um roteiro otimizado para o ${parkName}.

Data da visita: ${parkDate || 'Não especificada'}
Tamanho do grupo: ${groupSize || 'Não especificado'} pessoas

Atrações desejadas:
${attractionsList}

Forneça:
1. ⏰ **Horário ideal de chegada** com justificativa
2. 🗺️ **Sequência otimizada** das atrações com horários estimados
3. 🍽️ **Janelas de descanso/alimentação** recomendadas
4. ⚡ **Dicas de ajuste** caso algo saia do controle
5. 🎯 **Prioridades** - quais atrações fazer primeiro se o tempo for curto`;

    } else {
      // Roteiro GENÉRICO para quem NÃO tem guia
      systemPrompt = `Você é um assistente de viagem para parques de Orlando.
Forneça dicas gerais e um roteiro básico, mas NÃO dê a sequência otimizada completa.
Responda em português do Brasil.
Formate a resposta em markdown com emojis.`;

      userPrompt = `Dê dicas gerais para visitar o ${parkName}.

O visitante deseja fazer estas atrações:
${attractionsList}

Forneça APENAS:
1. ⏰ **Dica geral de horário** - manhã, tarde ou noite
2. 📍 **Áreas do parque** onde ficam essas atrações (sem ordem específica)
3. 💡 **Dicas gerais** de como aproveitar melhor o dia

NÃO forneça:
- Sequência exata de atrações
- Horários específicos
- Roteiro passo-a-passo otimizado

Finalize dizendo que para um roteiro personalizado e otimizado em tempo real, é necessário contratar um guia.`;
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Contate o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar roteiro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const itinerary = data.choices?.[0]?.message?.content || "Não foi possível gerar o roteiro.";

    return new Response(
      JSON.stringify({ 
        itinerary,
        hasGuide,
        parkName 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating itinerary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
