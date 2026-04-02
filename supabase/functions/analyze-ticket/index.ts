import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    if (!documentId) {
      return new Response(JSON.stringify({ error: "documentId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const minimaxApiKey = Deno.env.get("MINIMAX_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch the document
    const { data: doc, error: docError } = await supabase
      .from("user_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fetch user profile for travel dates
    const { data: profile } = await supabase
      .from("profiles")
      .select("arrival_date, departure_date, park_dates, parks, responsible_name")
      .eq("user_id", doc.user_id)
      .single();

    const arrivalDate = profile?.arrival_date || null;
    const departureDate = profile?.departure_date || null;
    const parkDates = profile?.park_dates || null;

    // 3. Build the AI prompt
    const profileContext = arrivalDate && departureDate
      ? `O viajante estará em Orlando de ${arrivalDate} até ${departureDate}.`
      : "O viajante ainda não preencheu as datas de viagem no perfil.";

    const parkDatesContext = parkDates
      ? `Datas específicas por parque: ${JSON.stringify(parkDates)}`
      : "";

    const fileUrl = doc.file_url;
    const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

    // For PDFs we can't send as image, so we ask AI to analyze based on name
    const messages: any[] = [
      {
        role: "system",
        content: `Você é um assistente especializado em análise de ingressos de parques temáticos de Orlando (Disney, Universal, SeaWorld, etc).

Sua tarefa:
1. Analisar o documento/ingresso fornecido
2. Extrair todas as datas relevantes (data de uso, validade, período de uso)
3. Comparar com as datas de viagem do perfil do usuário
4. Identificar se há algum problema de compatibilidade

${profileContext}
${parkDatesContext}

Responda SEMPRE em formato JSON válido com esta estrutura:
{
  "status": "valid" | "warning" | "error",
  "extracted_dates": {
    "valid_from": "YYYY-MM-DD ou null",
    "valid_until": "YYYY-MM-DD ou null",
    "specific_dates": ["YYYY-MM-DD"] ou [],
    "park_name": "nome do parque ou null",
    "ticket_type": "tipo do ingresso ou null",
    "num_days": number ou null
  },
  "message": "Mensagem clara e amigável em português explicando o resultado da análise",
  "details": "Detalhes adicionais se houver alerta"
}

Se não conseguir extrair datas do documento, use status "error" e explique.
Se as datas estão compatíveis, use "valid".
Se há problema de datas (ingresso vence antes da viagem, ou não cobre os dias no parque), use "warning".`
      },
    ];

    if (!isPdf) {
      // Send image to AI
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Analise este ingresso/documento chamado "${doc.document_name}" (tipo: ${doc.document_type}). Extraia as datas e compare com o perfil do viajante.`,
          },
          {
            type: "image_url",
            image_url: { url: fileUrl },
          },
        ],
      });
    } else {
      // PDF - analyze based on filename and context
      messages.push({
        role: "user",
        content: `O documento é um PDF chamado "${doc.document_name}" (tipo: ${doc.document_type}). Como não consigo ver o conteúdo do PDF diretamente, analise com base no nome do arquivo e tipo. Se não for possível extrair datas concretas, retorne status "error" com uma mensagem explicando que PDFs precisam ser verificados manualmente.`,
      });
    }

    // 4. Call Lovable AI
    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      // Update doc with error status
      await supabase
        .from("user_documents")
        .update({
          ai_validation_status: "error",
          ai_validation_message: "Não foi possível analisar o documento no momento. Tente novamente mais tarde.",
          ai_validated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      return new Response(
        JSON.stringify({ error: "AI analysis failed", status: "error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // 5. Parse AI response
    let parsed: any;
    try {
      // Extract JSON from response (may be wrapped in markdown code blocks)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseErr) {
      console.error("Failed to parse AI response:", rawContent);
      parsed = {
        status: "error",
        extracted_dates: {},
        message: "Não foi possível interpretar a análise. Verifique o documento manualmente.",
      };
    }

    // 6. Update the document with AI results
    const { error: updateError } = await supabase
      .from("user_documents")
      .update({
        ai_validation_status: parsed.status || "error",
        ai_validation_message: parsed.message || "Análise concluída.",
        ai_extracted_dates: parsed.extracted_dates || {},
        ai_validated_at: new Date().toISOString(),
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("Failed to update document:", updateError);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-ticket error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
