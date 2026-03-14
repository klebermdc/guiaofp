import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionnaireAnswers {
  budget_level: string;
  is_first_trip: boolean;
  travel_style: string;
  parks_interest_level: string;
  airport_transfer: string;
  will_rent_car: string;
  staying_region: string;
  accommodation_type: string;
  selected_parks: string[];
  additional_activities: string[];
}

interface Travelers {
  adults_count: number;
  children_count: number;
  children_ages: number[];
}

interface ItineraryRequest {
  itinerary_id: string;
}

const parkLabels: Record<string, string> = {
  magic_kingdom: "Magic Kingdom",
  epcot: "EPCOT",
  hollywood_studios: "Hollywood Studios",
  animal_kingdom: "Animal Kingdom",
  universal_studios: "Universal Studios Florida",
  islands_of_adventure: "Islands of Adventure",
  epic_universe: "Epic Universe",
  volcano_bay: "Volcano Bay",
  seaworld: "SeaWorld Orlando",
  busch_gardens: "Busch Gardens Tampa",
  legoland: "LEGOLAND Florida",
  aquatica: "Aquatica Orlando",
};

const activityLabels: Record<string, string> = {
  compras_outlets: "Compras em Outlets (Orlando Premium, Vineland)",
  compras_shopping: "Compras em Shoppings (Mall at Millenia, Florida Mall)",
  restaurantes_finos: "Restaurantes e experiências gastronômicas",
  kennedy_space: "Kennedy Space Center",
  airboat: "Passeio de Airboat nos Everglades",
  golfe: "Golfe",
  basketball_nba: "Jogo da NBA (Orlando Magic)",
  disney_springs: "Disney Springs",
  universal_citywalk: "Universal CityWalk",
  spa_relaxamento: "Spa e relaxamento",
  fotos_profissionais: "Ensaio fotográfico",
  dia_piscina: "Dia de piscina no hotel",
};

const budgetDescriptions: Record<string, string> = {
  economico: "orçamento econômico (até $150/dia por pessoa)",
  moderado: "orçamento moderado ($150-300/dia por pessoa)",
  confortavel: "orçamento confortável ($300-500/dia por pessoa)",
  premium: "orçamento premium ($500+/dia por pessoa)",
};

const styleDescriptions: Record<string, string> = {
  tranquilo: "ritmo tranquilo, sem pressa, aproveitando cada momento",
  equilibrado: "ritmo equilibrado entre atividades e descanso",
  agitado: "ritmo intenso, máximo de atrações por dia",
  focado_parques: "foco total em parques temáticos",
  focado_compras: "foco em compras e outlets",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itinerary_id }: ItineraryRequest = await req.json();

    if (!itinerary_id) {
      return new Response(
        JSON.stringify({ error: "itinerary_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the itinerary data
    const { data: itinerary, error: fetchError } = await supabase
      .from("itineraries")
      .select("*")
      .eq("id", itinerary_id)
      .single();

    if (fetchError || !itinerary) {
      return new Response(
        JSON.stringify({ error: "Roteiro não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const travelers = itinerary.travelers as Travelers;
    const answers = itinerary.questionnaire_answers as QuestionnaireAnswers;
    const startDate = new Date(itinerary.start_date);
    const endDate = new Date(itinerary.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Build the prompt
    const selectedParksNames = answers.selected_parks.map(p => parkLabels[p] || p).join(", ");
    const additionalActivitiesNames = answers.additional_activities.map(a => activityLabels[a] || a).join(", ");
    
    const groupDescription = travelers.children_count > 0
      ? `${travelers.adults_count} adulto(s) e ${travelers.children_count} criança(s) (idades: ${travelers.children_ages.join(", ")} anos)`
      : `${travelers.adults_count} adulto(s)`;

    const systemPrompt = `Você é um Especialista Profissional em Planejamento de Viagens para Orlando.

Seu objetivo é montar um roteiro: estratégico, confortável, otimizado, realista, personalizado e altamente prático.
Você deve conduzir o usuário desde o planejamento até o retorno ao Brasil.

⚠️ REGRA ABSOLUTA DO SISTEMA
Sempre que gerar roteiro de parque, seguir EXATAMENTE a ORDEM OFICIAL OFP abaixo.
Nunca alterar essa sequência. Sempre adaptar apenas o ritmo conforme o perfil da família.

🧭 ORDEM OFICIAL OFP — ATRAÇÕES

🏰 MAGIC KINGDOM
Radical: TRON → Space Mountain → Seven Dwarfs → Haunted Mansion → Tiana → Pirates → Jungle → Philharmagic → Small World → Under the Sea → Barnstormer → Speedway → PeopleMover
Tranquila: Philharmagic → Small World → Under the Sea → Dumbo → Pooh → Speedway → Aladdin → Jungle → Pirates

🌐 EPCOT
Radical: Guardians → Soarin → Test Track → Mission Space → Spaceship → Remy → Frozen
Tranquila: Nemo → Soarin → Figment → Moana → Spaceship → Remy → Frozen

🐘 ANIMAL KINGDOM
Radical: Safari → Everest → Zootopia → Flight of Passage → Navi → Kali
Tranquila: Safari → Zootopia → Navi → Gorillas → Tigers → Lion King → Nemo

🎬 HOLLYWOOD STUDIOS
Radical: Tower → Star Tours → Rise → Millennium → Slinky → Toy Story Mania → Mickey Runaway
Tranquila: Mickey Runaway → Toy Story Mania → Alien → Millennium → Rise → Star Tours

🦖 ISLANDS OF ADVENTURE
Radical: Hulk → Velocicoaster → Hagrids → Forbidden Journey → Kong → Spider → Doom
Tranquila: Spider → Kong → Hippogriff → High in the Sky → Cat in the Hat → Caro Seuss

🎢 UNIVERSAL STUDIOS
Radical: Mummy → Transformers → Jimmy → Fast → Gringotts → MiB → Simpsons → ET → Minions → Vilões
Tranquila: Transformers → Jimmy → Fast → MiB → Simpsons → ET → Trolls → Minions → Vilões

🐉 EPIC UNIVERSE
Radical: Hiccup Gliders → Frankenstein → Werewolf → Stardust → Ministério → Mario Kart → Donkey
Tranquila: Mario Kart → Donkey → Hiccup → Dragon Racer → Ministério → Show Arkanus → Show Dragão

📋 REGRAS DO ROTEIRO

Dia de chegada:
- Mercado próximo, farmácia, fast food, posto, jantar leve, dica de adaptação

Dias de parque:
- Horário de saída, ordem estratégica das atrações (seguir ORDEM OFP), horário de almoço, snack famoso, horário de descanso, melhor foto, melhor saída

Dias livres — sugerir:
- Walmart, Target, Publix, outlets, shoppings, restaurantes brasileiros, cafeterias, Apple Store, lojas baratas, Ross / Burlington / Marshalls
- Criar mini roteiro do dia

Dia de descanso:
- Piscina, café especial, passeio leve, compras rápidas, jantar legal

Dia de retorno:
- Abastecer, café rápido, sair com antecedência, devolver carro, aeroporto

🎯 FORMATO:
- Dividir por dias com títulos claros
- Linguagem simples, dicas reais, tom especialista
- Otimização logística, foco em conforto

FORMATO DE SAÍDA (JSON estrito):
{
  "days": [
    {
      "day_number": 1,
      "date": "DD/MM/YYYY",
      "title": "Título do dia",
      "theme": "disney" | "universal" | "seaworld" | "shopping" | "rest" | "arrival" | "departure" | "other",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Título da atividade",
          "description": "Descrição detalhada com dicas reais",
          "location": "Local",
          "duration_minutes": 60,
          "tips": "Dica prática"
        }
      ],
      "meals": [
        {
          "type": "breakfast" | "lunch" | "dinner" | "snack",
          "time": "HH:MM",
          "restaurant": "Nome do restaurante",
          "location": "Local",
          "tip": "Dica opcional"
        }
      ],
      "notes": "Notas adicionais do dia"
    }
  ],
  "general_tips": ["Dica geral 1", "Dica geral 2"],
  "estimated_budget": {
    "parks_tickets": 0,
    "meals": 0,
    "transportation": 0,
    "extras": 0,
    "total": 0
  }
}`;

    const userPrompt = `Crie um roteiro completo de ${totalDays} dias para Orlando.

INFORMAÇÕES DA VIAGEM:
- Data de início: ${startDate.toLocaleDateString('pt-BR')}
- Data de fim: ${endDate.toLocaleDateString('pt-BR')}
- Total: ${totalDays} dias

GRUPO:
- ${groupDescription}
- Primeira vez em Orlando: ${answers.is_first_trip ? "Sim" : "Não"}

PREFERÊNCIAS:
- Orçamento: ${budgetDescriptions[answers.budget_level] || answers.budget_level}
- Estilo de viagem: ${styleDescriptions[answers.travel_style] || answers.travel_style}
- Interesse em parques: ${answers.parks_interest_level}

PARQUES SELECIONADOS:
${selectedParksNames || "Nenhum específico"}

ATIVIDADES EXTRAS:
${additionalActivitiesNames || "Nenhuma específica"}

LOGÍSTICA:
- Região de hospedagem: ${answers.staying_region.replace(/_/g, " ")}
- Tipo de hospedagem: ${answers.accommodation_type.replace(/_/g, " ")}
- Transporte aeroporto: ${answers.airport_transfer.replace(/_/g, " ")}
- Aluguel de carro: ${answers.will_rent_car}

Retorne APENAS o JSON válido, sem explicações adicionais.`;

    // Call Lovable AI Gateway
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
        temperature: 0.7,
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

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Parse the JSON response
    let generatedItinerary;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      generatedItinerary = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Erro ao processar roteiro gerado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the itinerary in the database
    // Note: total_days is a generated column, do not update it directly
    const { error: updateError } = await supabase
      .from("itineraries")
      .update({
        generated_itinerary: generatedItinerary,
        estimated_budget: generatedItinerary.estimated_budget?.total || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itinerary_id);

    if (updateError) {
      console.error("Error updating itinerary:", updateError);
      return new Response(
        JSON.stringify({ error: "Erro ao salvar roteiro" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        itinerary_id,
        generated_itinerary: generatedItinerary,
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
