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
    const { parkName, userId } = await req.json();

    if (!parkName) {
      return new Response(JSON.stringify({ error: "parkName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Park name variants for DB queries
    const parkNameVariants: Record<string, string> = {
      "Universal Studios": "Universal Studios Florida",
      SeaWorld: "SeaWorld Orlando",
      "Busch Gardens": "Busch Gardens Tampa",
    };
    const queryParkName = parkNameVariants[parkName] || parkName;

    // Fetch all attractions for this park
    const { data: attractions } = await supabase
      .from("attractions")
      .select("name, area, type, thrill_level, height_requirement, duration, lightning_lane, tips, best_time_to_visit")
      .eq("park_id", (await supabase.from("parks").select("id").eq("name", parkName).single()).data?.id || "")
      .order("popularity_score", { ascending: false });

    // Fetch 30-day wait time averages from daily_analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: waitTimeData } = await supabase
      .from("daily_analytics")
      .select("attraction_name, avg_wait_time, best_time, peak_time, best_wait_time, peak_wait_time")
      .eq("park_name", queryParkName)
      .gte("date", startDate);

    // Build wait time averages
    const waitTimeMap: Record<string, { avgWait: number; bestTime: string | null; peakTime: string | null; bestWait: number | null; count: number }> = {};
    waitTimeData?.forEach((row) => {
      if (row.avg_wait_time != null) {
        if (!waitTimeMap[row.attraction_name]) {
          waitTimeMap[row.attraction_name] = { avgWait: 0, bestTime: row.best_time, peakTime: row.peak_time, bestWait: row.best_wait_time, count: 0 };
        }
        waitTimeMap[row.attraction_name].avgWait += Number(row.avg_wait_time);
        waitTimeMap[row.attraction_name].count++;
        if (row.best_time) waitTimeMap[row.attraction_name].bestTime = row.best_time;
      }
    });

    const waitTimeSummary = Object.entries(waitTimeMap).map(([name, data]) => ({
      name,
      avgWait: Math.round(data.avgWait / data.count),
      bestTime: data.bestTime,
      peakTime: data.peakTime,
      bestWait: data.bestWait,
    }));

    // Fetch user profile if userId provided
    let userProfile: any = null;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("group_size, travelers, group_style, priority, physical_restrictions, food_allergies, has_celebration, celebration_type, uses_stroller_or_wheelchair")
        .eq("user_id", userId)
        .single();
      userProfile = profile;
    }

    // Build the AI prompt
    const attractionsList = attractions?.map((a) => {
      const wt = waitTimeSummary.find((w) => w.name.toLowerCase().includes(a.name.toLowerCase()) || a.name.toLowerCase().includes(w.name.toLowerCase()));
      return `- ${a.name} | Área: ${a.area || "N/A"} | Tipo: ${a.type || "ride"} | Intensidade: ${a.thrill_level || "N/A"} | Altura mín: ${a.height_requirement ? a.height_requirement + "cm" : "Nenhuma"} | Lightning Lane: ${a.lightning_lane ? "Sim" : "Não"} | Duração: ${a.duration || "N/A"} min | Tempo médio fila: ${wt ? wt.avgWait + " min" : "N/A"} | Melhor horário: ${wt?.bestTime || "N/A"} | Horário pico: ${wt?.peakTime || "N/A"}`;
    }).join("\n") || "Nenhuma atração encontrada";

    let profileContext = "";
    if (userProfile) {
      const travelers = userProfile.travelers;
      let travelerInfo = "";
      if (Array.isArray(travelers) && travelers.length > 0) {
        travelerInfo = travelers.map((t: any) => `${t.name || "Viajante"} (${t.age || "?"} anos)`).join(", ");
      }
      profileContext = `
PERFIL DO GRUPO:
- Tamanho do grupo: ${userProfile.group_size || "N/A"}
- Viajantes: ${travelerInfo || "N/A"}
- Estilo: ${userProfile.group_style || "N/A"}
- Prioridades: ${userProfile.priority?.join(", ") || "N/A"}
- Restrições físicas: ${userProfile.physical_restrictions || "Nenhuma"}
- Alergias alimentares: ${userProfile.food_allergies || "Nenhuma"}
- Usa carrinho/cadeira de rodas: ${userProfile.uses_stroller_or_wheelchair || "Não"}
- Celebração: ${userProfile.has_celebration ? userProfile.celebration_type || "Sim" : "Não"}
`;
    }

    const systemPrompt = `Você é a Joy, especialista em Orlando e parques temáticos. Gere um roteiro otimizado para o parque ${parkName} em PORTUGUÊS DO BRASIL.

REGRAS:
1. Ordene as atrações de forma estratégica para minimizar tempo de fila e deslocamento
2. Comece pelas atrações mais populares (rope-drop strategy)
3. Agrupe atrações por área para reduzir caminhada
4. Intercale atrações intensas com mais calmas para gerenciar energia
5. Considere o perfil do grupo (se fornecido) para adaptar recomendações
6. Se há crianças pequenas ou restrições de altura, exclua atrações inadequadas
7. Inclua sugestões de pausas para alimentação e descanso
8. Use os dados de tempo de fila para recomendar horários ideais

RESPONDA EXCLUSIVAMENTE em JSON válido com esta estrutura:
{
  "title": "Roteiro Otimizado - [Nome do Parque]",
  "strategy": "Breve descrição da estratégia (1-2 frases)",
  "estimated_duration": "Xh",
  "items": [
    {
      "order": 1,
      "time": "09:00",
      "name": "Nome da Atração",
      "area": "Área do Parque",
      "type": "ride|show|experience|meet|meal|break",
      "duration_min": 15,
      "expected_wait": 10,
      "tip": "Dica curta e relevante",
      "icon": "emoji relevante"
    }
  ],
  "tips": ["Dica geral 1", "Dica geral 2"]
}

Inclua de 15-25 itens incluindo pausas para refeição e descanso.`;

    const userMessage = `ATRAÇÕES DISPONÍVEIS NO ${parkName.toUpperCase()}:
${attractionsList}

${profileContext}

Gere o roteiro otimizado para um dia completo no parque.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar roteiro" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-park-itinerary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
