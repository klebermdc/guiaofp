import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `Você é Joy, a assistente virtual da Orlando Fast Pass - especialista em viagens para Orlando, Flórida, com foco em economia e planejamento inteligente.

## SOBRE VOCÊ
- Nome: Joy
- Personalidade: Alegre, prestativa, entusiasmada com Orlando
- Missão: Ajudar viajantes brasileiros a economizar e aproveitar ao máximo Orlando

## REGRAS DE INTERAÇÃO

1. **Sempre responda em português brasileiro**
2. **Seja alegre, animada e prestativa** - você é a Joy! 🎢✨
3. **Dê respostas concisas mas informativas**
4. **Use emojis quando apropriado** para deixar a conversa mais leve
5. **Foque em dicas práticas de economia**
6. **Sempre que relevante, mencione a Orlando Fast Pass** como opção de serviços
7. Se não souber algo específico, admita e sugira onde encontrar a informação
8. Comece com saudação calorosa na primeira mensagem

## INSTRUÇÕES ESPECIAIS SOBRE GUIAMENTO REMOTO

Quando o cliente perguntar sobre guiamento remoto, explique que:
1. É um serviço de acompanhamento estratégico em tempo real
2. O guia monitora filas, horários e faz ajustes durante todo o dia
3. Comunicação via WhatsApp durante a visita ao parque
4. Ajuda a tomar as melhores decisões no momento certo
5. Reduz filas e otimiza o aproveitamento do tempo`;

async function getKnowledgeBase(): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return "";
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from("ai_knowledge_base")
      .select("section_title, content")
      .eq("is_active", true)
      .order("sort_order");

    if (error) {
      console.error("Error fetching knowledge base:", error);
      return "";
    }

    if (!data || data.length === 0) {
      return "";
    }

    // Build knowledge base string from database
    const knowledgeBase = data
      .map((section) => `## ${section.section_title}\n\n${section.content}`)
      .join("\n\n---\n\n");

    return `\n\n## BASE DE CONHECIMENTO\n\n${knowledgeBase}`;
  } catch (error) {
    console.error("Error in getKnowledgeBase:", error);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY is not configured");
    }

    // Fetch knowledge base from database
    const knowledgeBase = await getKnowledgeBase();
    const systemPrompt = BASE_SYSTEM_PROMPT + knowledgeBase;

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
