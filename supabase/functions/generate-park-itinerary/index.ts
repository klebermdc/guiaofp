import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ThemeParks.wiki entity IDs mapped by park name
const THEMEPARKS_ENTITY_IDS: Record<string, string> = {
  "Magic Kingdom": "75ea578a-adc8-4116-a54d-dccb60765ef9",
  "EPCOT": "47f90d2c-e191-4239-a466-5892ef59a88b",
  "Hollywood Studios": "288747d1-8b4f-4a64-867e-ea7c9b27bad8",
  "Animal Kingdom": "1c84a229-8862-4648-9c71-378ddd2c7693",
  "Universal Studios": "eb3f4560-2383-4a36-9152-6b3e5ed6bc57",
  "Universal Studios Florida": "eb3f4560-2383-4a36-9152-6b3e5ed6bc57",
  "Islands of Adventure": "267615cc-8943-4c2a-ae2c-5da728ca591f",
  "Epic Universe": "12dbb85b-265f-44e6-bccf-f1faa17211fc",
  "SeaWorld": "27d64dee-d85e-48dc-ad6d-8077445cd946",
  "SeaWorld Orlando": "27d64dee-d85e-48dc-ad6d-8077445cd946",
  "Busch Gardens": "fc40c99a-be0a-42f4-a483-1e939db275c2",
  "Busch Gardens Tampa": "fc40c99a-be0a-42f4-a483-1e939db275c2",
};

interface LiveAttractionData {
  name: string;
  status: string;
  waitTime: number;
}

interface LiveShowData {
  name: string;
  status: string;
  showtimes: string[];
  nextShowtime?: string;
}

async function fetchLiveData(parkName: string): Promise<{ attractions: LiveAttractionData[]; shows: LiveShowData[] }> {
  const entityId = THEMEPARKS_ENTITY_IDS[parkName];
  if (!entityId) return { attractions: [], shows: [] };

  try {
    const res = await fetch(`https://api.themeparks.wiki/v1/entity/${entityId}/live`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { attractions: [], shows: [] };

    const data = await res.json();
    const attractions: LiveAttractionData[] = [];
    const shows: LiveShowData[] = [];

    for (const item of data.liveData || []) {
      if (item.entityType === "ATTRACTION") {
        attractions.push({
          name: item.name,
          status: item.status || "UNKNOWN",
          waitTime: item.queue?.STANDBY?.waitTime || 0,
        });
      } else if (item.entityType === "SHOW" || item.entityType === "CHARACTER") {
        const showtimes: string[] = [];
        let nextShowtime: string | undefined;
        const now = new Date();

        if (Array.isArray(item.showtimes)) {
          for (const st of item.showtimes) {
            if (st.startTime) {
              const date = new Date(st.startTime);
              const timeStr = date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/New_York",
              });
              showtimes.push(timeStr);
              if (!nextShowtime && date > now) {
                nextShowtime = timeStr;
              }
            }
          }
        }

        shows.push({
          name: item.name,
          status: item.status || "UNKNOWN",
          showtimes,
          nextShowtime,
        });
      }
    }

    console.log(`Live data: ${attractions.length} attractions, ${shows.length} shows for ${parkName}`);
    return { attractions, shows };
  } catch (err) {
    console.error("Failed to fetch live data:", err);
    return { attractions: [], shows: [] };
  }
}

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

    // Fetch live data, attractions, wait times, and user profile in parallel
    const parkIdResult = await supabase.from("parks").select("id").eq("name", parkName).single();
    const parkId = parkIdResult.data?.id || "";

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const [liveData, attractionsResult, waitTimeResult, profileResult] = await Promise.all([
      fetchLiveData(parkName),
      supabase
        .from("attractions")
        .select("name, area, type, thrill_level, height_requirement, duration, lightning_lane, tips, best_time_to_visit")
        .eq("park_id", parkId)
        .order("popularity_score", { ascending: false }),
      supabase
        .from("daily_analytics")
        .select("attraction_name, avg_wait_time, best_time, peak_time, best_wait_time, peak_wait_time")
        .eq("park_name", queryParkName)
        .gte("date", startDate),
      userId
        ? supabase
            .from("profiles")
            .select("group_size, travelers, group_style, priority, physical_restrictions, food_allergies, has_celebration, celebration_type, uses_stroller_or_wheelchair")
            .eq("user_id", userId)
            .single()
        : Promise.resolve({ data: null }),
    ]);

    const attractions = attractionsResult.data;
    const waitTimeData = waitTimeResult.data;
    const userProfile = profileResult.data;

    // Build live status map (normalize names for matching)
    const normalize = (s: string) => s.replace(/[™®©:'']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const liveStatusMap = new Map<string, { status: string; waitTime: number }>();
    for (const a of liveData.attractions) {
      liveStatusMap.set(normalize(a.name), { status: a.status, waitTime: a.waitTime });
    }

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

    // Filter out closed attractions and mark status
    const attractionsList = attractions?.map((a) => {
      const wt = waitTimeSummary.find((w) => normalize(w.name).includes(normalize(a.name)) || normalize(a.name).includes(normalize(w.name)));
      const live = liveStatusMap.get(normalize(a.name));
      const isClosed = live && live.status !== "OPERATING" && live.status !== "UNKNOWN";

      if (isClosed) return null; // Exclude closed attractions

      const currentWait = live ? `${live.waitTime} min (ao vivo)` : "N/A";

      return `- ${a.name} | Área: ${a.area || "N/A"} | Tipo: ${a.type || "ride"} | Intensidade: ${a.thrill_level || "N/A"} | Altura mín: ${a.height_requirement ? a.height_requirement + "cm" : "Nenhuma"} | Lightning Lane: ${a.lightning_lane ? "Sim" : "Não"} | Duração: ${a.duration || "N/A"} min | Fila atual: ${currentWait} | Tempo médio fila (30d): ${wt ? wt.avgWait + " min" : "N/A"} | Melhor horário: ${wt?.bestTime || "N/A"} | Horário pico: ${wt?.peakTime || "N/A"}`;
    }).filter(Boolean).join("\n") || "Nenhuma atração encontrada";

    // Count closed attractions for context
    const closedAttractions = attractions?.filter((a) => {
      const live = liveStatusMap.get(normalize(a.name));
      return live && live.status !== "OPERATING" && live.status !== "UNKNOWN";
    }).map((a) => a.name) || [];

    // Build shows schedule section
    const showsList = liveData.shows
      .filter((s) => s.status === "OPERATING" && s.showtimes.length > 0)
      .map((s) => `- ${s.name} | Horários: ${s.showtimes.join(", ")} | Próximo: ${s.nextShowtime || "N/A"}`)
      .join("\n");

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

    // Fetch custom prompt from database
    let systemPrompt: string;
    const { data: promptData } = await supabase
      .from("ai_itinerary_prompt")
      .select("system_prompt")
      .eq("prompt_key", "park_itinerary_system")
      .eq("is_active", true)
      .single();

    if (promptData?.system_prompt) {
      // Replace {parkName} placeholder with actual park name
      systemPrompt = promptData.system_prompt.replace(/\{parkName\}/g, parkName);
    } else {
      // Fallback hardcoded prompt
      systemPrompt = `Você é a Joy, especialista em Orlando e parques temáticos. Gere um roteiro otimizado para o parque ${parkName} em PORTUGUÊS DO BRASIL.

REGRAS:
1. Ordene as atrações de forma estratégica para minimizar tempo de fila e deslocamento
2. Comece pelas atrações mais populares (rope-drop strategy)
3. Agrupe atrações por área para reduzir caminhada
4. Intercale atrações intensas com mais calmas para gerenciar energia
5. Considere o perfil do grupo (se fornecido) para adaptar recomendações
6. Se há crianças pequenas ou restrições de altura, exclua atrações inadequadas
7. Inclua sugestões de pausas para alimentação e descanso
8. Use os dados de tempo de fila para recomendar horários ideais
9. IMPORTANTE: Inclua os shows disponíveis nos horários corretos conforme a programação ao vivo fornecida
10. NÃO inclua atrações que estão fechadas ou fora de operação
11. Encaixe os shows nos intervalos entre atrações, respeitando os horários reais

RESPONDA EXCLUSIVAMENTE em JSON válido com esta estrutura:
{
  "title": "Roteiro Otimizado - [Nome do Parque]",
  "strategy": "Breve descrição da estratégia (1-2 frases)",
  "estimated_duration": "Xh",
  "closed_attractions": ["lista de atrações fechadas hoje"],
  "items": [
    {
      "order": 1,
      "time": "09:00",
      "name": "Nome da Atração",
      "area": "Área do Parque",
      "type": "ride|show|experience|meet|meal|break",
      "duration_min": 15,
      "tip": "Dica curta e relevante",
      "icon": "emoji relevante"
    }
  ],
  "tips": ["Dica geral 1", "Dica geral 2"]
}

NÃO inclua estimativas de tempo de fila. Foque na ordem otimizada com horários sugeridos e duração de cada atividade.
Inclua de 15-25 itens incluindo pausas para refeição e descanso.`;
    }

    const userMessage = `ATRAÇÕES ABERTAS NO ${parkName.toUpperCase()} HOJE:
${attractionsList}

${closedAttractions.length > 0 ? `ATRAÇÕES FECHADAS HOJE (NÃO INCLUIR NO ROTEIRO):
${closedAttractions.map((n) => `- ${n}`).join("\n")}
` : ""}
${showsList ? `SHOWS E PERSONAGENS COM HORÁRIOS AO VIVO:
${showsList}
` : "Nenhum show com horários disponíveis no momento."}

${profileContext}

Gere o roteiro otimizado para um dia completo no parque, encaixando os shows nos horários corretos.`;

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
