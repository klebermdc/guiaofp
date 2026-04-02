import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  useRealTimeData?: boolean;
}

interface WaitTimeData {
  name: string;
  currentWait: number;
  status: string;
  optimalWindows: OptimalWindow[];
  avgHistorical: number | null;
}

interface OptimalWindow {
  start: string;
  end: string;
  avgWait: number;
  ranking: number;
  confidence: number;
}

// Fetch current wait times from ThemeParks.wiki API
async function fetchCurrentWaitTimes(parkName: string): Promise<Map<string, { waitTime: number; status: string }>> {
  const PARK_ENTITY_IDS: Record<string, string> = {
    'Magic Kingdom': '75ea578a-adc8-4116-a54d-dccb60765ef9',
    'EPCOT': '47f90d2c-e191-4239-a466-5892ef59a88b',
    'Hollywood Studios': '288747d1-8b4f-4a64-867e-ea7c9b27bad8',
    'Animal Kingdom': '1c84a229-8862-4648-9c71-378ddd2c7693',
    'Universal Studios Florida': 'eb3f4560-2383-4a36-9152-6b3e5ed6bc57',
    'Islands of Adventure': '267615cc-8943-4c2a-ae2c-5da728ca591f',
    'Epic Universe': '12dbb85b-265f-44e6-bccf-f1faa17211fc',
    'SeaWorld Orlando': '27d64dee-d85e-48dc-ad6d-8077445cd946',
    'Busch Gardens Tampa': 'fc40c99a-be0a-42f4-a483-1e939db275c2',
  };

  const entityId = PARK_ENTITY_IDS[parkName];
  if (!entityId) {
    console.log(`No entity ID found for park: ${parkName}`);
    return new Map();
  }

  try {
    const response = await fetch(`https://api.themeparks.wiki/v1/entity/${entityId}/live`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.error(`ThemeParks.wiki API error for ${parkName}:`, response.status);
      return new Map();
    }

    const data = await response.json();
    const waitTimes = new Map<string, { waitTime: number; status: string }>();

    if (data.liveData) {
      for (const item of data.liveData) {
        if (item.entityType === 'ATTRACTION') {
          waitTimes.set(item.name, {
            waitTime: item.queue?.STANDBY?.waitTime || 0,
            status: item.status || 'UNKNOWN',
          });
        }
      }
    }

    console.log(`Fetched ${waitTimes.size} current wait times for ${parkName}`);
    return waitTimes;
  } catch (error) {
    console.error(`Error fetching current wait times for ${parkName}:`, error);
    return new Map();
  }
}

// Get optimal windows from database
async function getOptimalWindows(
  supabase: any,
  attractionNames: string[],
  parkName: string,
  dayOfWeek: number
): Promise<Map<string, OptimalWindow[]>> {
  const { data: windows, error } = await supabase
    .from('optimal_windows')
    .select('attraction_name, time_window_start, time_window_end, avg_wait_time, ranking, confidence_score')
    .eq('park_name', parkName)
    .eq('day_of_week', dayOfWeek)
    .in('attraction_name', attractionNames)
    .lte('ranking', 5) // Top 5 windows
    .order('ranking');

  if (error) {
    console.error('Error fetching optimal windows:', error);
    return new Map();
  }

  const windowsMap = new Map<string, OptimalWindow[]>();
  for (const w of windows || []) {
    if (!windowsMap.has(w.attraction_name)) {
      windowsMap.set(w.attraction_name, []);
    }
    windowsMap.get(w.attraction_name)!.push({
      start: w.time_window_start,
      end: w.time_window_end,
      avgWait: w.avg_wait_time,
      ranking: w.ranking,
      confidence: w.confidence_score,
    });
  }

  return windowsMap;
}

// Get historical averages from daily analytics
async function getHistoricalAverages(
  supabase: any,
  attractionNames: string[],
  parkName: string,
  dayOfWeek: number
): Promise<Map<string, number>> {
  const { data: analytics, error } = await supabase
    .from('daily_analytics')
    .select('attraction_name, avg_wait_time')
    .eq('park_name', parkName)
    .eq('day_of_week', dayOfWeek)
    .in('attraction_name', attractionNames)
    .gte('confidence_score', 0.5) // Only use reliable data
    .order('date', { ascending: false })
    .limit(attractionNames.length * 10); // Last 10 entries per attraction

  if (error) {
    console.error('Error fetching historical averages:', error);
    return new Map();
  }

  // Calculate average of averages per attraction
  const sums = new Map<string, { total: number; count: number }>();
  for (const a of analytics || []) {
    if (!sums.has(a.attraction_name)) {
      sums.set(a.attraction_name, { total: 0, count: 0 });
    }
    const s = sums.get(a.attraction_name)!;
    s.total += a.avg_wait_time;
    s.count += 1;
  }

  const averages = new Map<string, number>();
  for (const [name, { total, count }] of sums) {
    averages.set(name, Math.round(total / count));
  }

  return averages;
}

// Format wait time data for AI prompt
function formatWaitTimeContext(waitTimeData: WaitTimeData[]): string {
  if (waitTimeData.length === 0) return '';

  let context = '\n\n📊 **DADOS DE FILAS EM TEMPO REAL:**\n';
  
  for (const data of waitTimeData) {
    const statusEmoji = data.status === 'OPERATING' ? '🟢' : data.status === 'CLOSED' ? '🔴' : '🟡';
    context += `\n${statusEmoji} **${data.name}**\n`;
    context += `   • Fila atual: ${data.currentWait} min\n`;
    
    if (data.avgHistorical !== null) {
      const diff = data.currentWait - data.avgHistorical;
      const trend = diff > 10 ? '📈 acima' : diff < -10 ? '📉 abaixo' : '➡️ normal';
      context += `   • Média histórica: ${data.avgHistorical} min (${trend})\n`;
    }
    
    if (data.optimalWindows.length > 0) {
      const bestWindow = data.optimalWindows[0];
      context += `   • 🎯 Melhor horário: ${bestWindow.start.substring(0, 5)} - ${bestWindow.end.substring(0, 5)} (~${Math.round(bestWindow.avgWait)} min)\n`;
    }
  }

  return context;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      attractions, 
      parkDate, 
      parkName, 
      groupSize, 
      hasGuide,
      useRealTimeData = true 
    }: ItineraryRequest = await req.json();
    
    const MINIMAX_API_KEY = Deno.env.get("MINIMAX_API_KEY");
    if (!MINIMAX_API_KEY) {
      throw new Error("MINIMAX_API_KEY is not configured");
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

    // Collect real-time data if enabled
    let waitTimeContext = '';
    const waitTimeData: WaitTimeData[] = [];

    if (useRealTimeData) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const attractionNames = attractions
        .filter(a => a.parkName === parkName)
        .map(a => a.attractionName);

      // Determine day of week for the visit
      const visitDate = parkDate ? new Date(parkDate) : new Date();
      const dayOfWeek = visitDate.getDay();

      // Fetch data in parallel
      const [currentWaitTimes, optimalWindows, historicalAverages] = await Promise.all([
        fetchCurrentWaitTimes(parkName),
        getOptimalWindows(supabase, attractionNames, parkName, dayOfWeek),
        getHistoricalAverages(supabase, attractionNames, parkName, dayOfWeek),
      ]);

      // Build wait time data for each attraction
      for (const attractionName of attractionNames) {
        const current = currentWaitTimes.get(attractionName);
        const windows = optimalWindows.get(attractionName) || [];
        const avgHistorical = historicalAverages.get(attractionName) || null;

        if (current) {
          waitTimeData.push({
            name: attractionName,
            currentWait: current.waitTime,
            status: current.status,
            optimalWindows: windows,
            avgHistorical,
          });
        }
      }

      waitTimeContext = formatWaitTimeContext(waitTimeData);
      console.log(`Collected wait time data for ${waitTimeData.length} attractions`);
    }

    // Different prompts based on plan
    let systemPrompt: string;
    let userPrompt: string;

    if (hasGuide) {
      // COMPLETE itinerary for guide plan
      systemPrompt = `Você é um especialista em parques temáticos de Orlando com anos de experiência.
Sua tarefa é criar um roteiro OTIMIZADO e DETALHADO para o parque, considerando:
- Fluxo de multidão típico
- Localização das atrações no parque
- Tempo de espera estimado
- Melhor sequência para minimizar caminhadas e filas
${useRealTimeData ? '- DADOS DE FILAS EM TEMPO REAL fornecidos abaixo' : ''}

IMPORTANTE: Use os dados de fila em tempo real para otimizar a ordem das atrações.
Priorize atrações com filas mais curtas primeiro quando possível.
Sugira os melhores horários baseado nos dados históricos fornecidos.

⚠️ REGRA CRÍTICA SOBRE PARADAS, SHOWS E SHOWS DE ENCERRAMENTO:
- NUNCA apresente horários de paradas, shows ou shows noturnos/de encerramento (fireworks, nighttime spectaculars) como fixos ou garantidos.
- Sempre que mencionar uma parada ou show, use linguagem como "horário sujeito a alteração" ou "consulte o app oficial no dia".
- No INÍCIO do roteiro de cada dia que contenha parada, show ou show de encerramento, inclua obrigatoriamente este aviso:
  "⚠️ Atenção: horários de paradas, shows e show de encerramento podem mudar. Consulte o aplicativo oficial no dia da visita para confirmar os horários atualizados."
- Isso vale para TODOS os parques: Disney, Universal, SeaWorld, etc.

🎟️ REGRA CRÍTICA SOBRE JANELA DE UTILIZAÇÃO DOS INGRESSOS:
Ao distribuir dias de parque no roteiro, SEMPRE respeite a janela de utilização dos ingressos:

**Disney (janela a partir do primeiro uso):**
- 2 dias → 4 dias corridos | 3 dias → 5 dias corridos | 4 dias → 7 dias corridos
- 5 dias → 8 dias corridos | 6 dias → 9 dias corridos | 7 dias → 10 dias corridos
- 8 dias → 12 dias corridos | 9 dias → 13 dias corridos | 10 dias → 14 dias corridos

**Universal Orlando (janela a partir do primeiro uso):**
- Todos os ingressos multi-day → 14 dias corridos consecutivos

Se as datas exatas não forem informadas, inclua obrigatoriamente no INÍCIO do roteiro:
"⚠️ Atenção: os ingressos da Disney possuem uma janela de utilização limitada após o primeiro uso. Ingressos da Universal são válidos por 14 dias corridos após o primeiro uso. Confirme suas datas exatas para garantir que todos os dias de parque estejam dentro da validade do ingresso."

Se as datas forem informadas, valide que os dias de parque cabem na janela e avise caso não caibam.

Responda em português do Brasil.
Formate a resposta em markdown com emojis.`;

      userPrompt = `Crie um roteiro otimizado para o ${parkName}.

Data da visita: ${parkDate || 'Não especificada'}
Dia da semana: ${parkDate ? new Date(parkDate).toLocaleDateString('pt-BR', { weekday: 'long' }) : 'Não especificado'}
Tamanho do grupo: ${groupSize || 'Não especificado'} pessoas

Atrações desejadas:
${attractionsList}
${waitTimeContext}

Forneça:
1. ⏰ **Horário ideal de chegada** com justificativa
2. 🗺️ **Sequência otimizada** das atrações com horários estimados ${useRealTimeData ? '(baseado nos dados de fila atuais e históricos)' : ''}
3. 🍽️ **Janelas de descanso/alimentação** recomendadas
4. ⚡ **Dicas de ajuste** caso algo saia do controle
5. 🎯 **Prioridades** - quais atrações fazer primeiro se o tempo for curto
${useRealTimeData ? '6. 📊 **Análise de filas** - quais atrações estão com fila acima/abaixo do normal' : ''}`;

    } else {
      // GENERIC itinerary for non-guide plan
      systemPrompt = `Você é um assistente de viagem para parques de Orlando.
Forneça dicas gerais e um roteiro básico, mas NÃO dê a sequência otimizada completa.

⚠️ REGRA CRÍTICA: NUNCA apresente horários de paradas, shows ou shows noturnos/de encerramento como fixos ou garantidos. Sempre oriente o visitante a conferir o aplicativo oficial no dia da visita.

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
- Dados de filas em tempo real

Finalize dizendo que para um roteiro personalizado e otimizado em tempo real, é necessário contratar um guia.`;
    }

    const response = await fetch("https://api.minimaxi.chat/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
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
    const rawItinerary = data.choices?.[0]?.message?.content || "Não foi possível gerar o roteiro.";
    // Strip <think>...</think> reasoning blocks from MiniMax responses
    const itinerary = rawItinerary.replace(/<think>[\s\S]*?<\/think>\s*/g, '');

    return new Response(
      JSON.stringify({ 
        itinerary,
        hasGuide,
        parkName,
        waitTimeData: hasGuide ? waitTimeData : undefined,
        dataSource: useRealTimeData ? 'real-time' : 'none',
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
