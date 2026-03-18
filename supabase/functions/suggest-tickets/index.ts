import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItineraryData {
  selectedParks: string[];
  duration: number;
  budget: string;
  parkInterest: string;
  adultsCount: number;
  childrenCount: number;
  childrenAges: number[];
  travelStyle: string;
}

interface TicketRecommendation {
  type: string;
  days: number;
  parks: string[];
  estimatedCostAdult: number;
  estimatedCostChild: number;
  totalEstimate: number;
  reason: string;
  tips: string[];
  buyLink: string;
}

// Preços base aproximados em USD (2024)
const TICKET_PRICES = {
  base: {
    adult: { 1: 109, 2: 107, 3: 105, 4: 99, 5: 94, 6: 89, 7: 85, 8: 82, 9: 80, 10: 78 },
    child: { 1: 104, 2: 102, 3: 100, 4: 94, 5: 89, 6: 84, 7: 80, 8: 77, 9: 75, 10: 73 },
  },
  hopper: {
    addonPerDay: 65,
  },
  hopperPlus: {
    addonPerDay: 85,
  },
};

function calculateCost(
  ticketType: 'base' | 'hopper' | 'hopperPlus',
  days: number,
  adultsCount: number,
  childrenCount: number
): { adult: number; child: number; total: number } {
  const clampedDays = Math.min(Math.max(days, 1), 10);
  
  const baseAdult = TICKET_PRICES.base.adult[clampedDays as keyof typeof TICKET_PRICES.base.adult];
  const baseChild = TICKET_PRICES.base.child[clampedDays as keyof typeof TICKET_PRICES.base.child];
  
  let adultPrice = baseAdult * clampedDays;
  let childPrice = baseChild * clampedDays;
  
  if (ticketType === 'hopper') {
    adultPrice += TICKET_PRICES.hopper.addonPerDay * clampedDays;
    childPrice += TICKET_PRICES.hopper.addonPerDay * clampedDays;
  } else if (ticketType === 'hopperPlus') {
    adultPrice += TICKET_PRICES.hopperPlus.addonPerDay * clampedDays;
    childPrice += TICKET_PRICES.hopperPlus.addonPerDay * clampedDays;
  }
  
  return {
    adult: adultPrice,
    child: childPrice,
    total: (adultPrice * adultsCount) + (childPrice * childrenCount),
  };
}

function analyzeAndSuggest(data: ItineraryData): TicketRecommendation {
  const { 
    selectedParks, 
    duration, 
    budget, 
    parkInterest,
    adultsCount = 2,
    childrenCount = 0,
    childrenAges = [],
    travelStyle = 'moderado'
  } = data;

  const disneyParks = ['Magic Kingdom', 'Epcot', 'Hollywood Studios', 'Animal Kingdom'];
  const selectedDisneyParks = selectedParks.filter(p => disneyParks.includes(p));
  const hasMultipleDisneyParks = selectedDisneyParks.length > 1;
  
  // Dias recomendados baseados no estilo
  let recommendedDays = Math.min(duration - 2, 10); // Deixar dias para descanso/outras atividades
  
  if (travelStyle === 'intenso') {
    recommendedDays = Math.min(duration - 1, 10);
  } else if (travelStyle === 'relaxado') {
    recommendedDays = Math.min(duration - 3, 7);
  }
  
  recommendedDays = Math.max(recommendedDays, selectedDisneyParks.length);

  let ticketType: 'base' | 'hopper' | 'hopperPlus' = 'base';
  let reason = '';
  const tips: string[] = [];

  // Lógica de sugestão baseada no perfil
  if (parkInterest === 'Altíssimo' && duration >= 7 && budget !== 'Econômico') {
    ticketType = 'hopperPlus';
    reason = 'Com seu alto interesse em parques e viagem mais longa, o Park Hopper Plus permite visitar múltiplos parques por dia e inclui acesso aos parques aquáticos.';
    tips.push('Comece pelo parque que mais te interessa cedo e pule para outro à tarde');
    tips.push('Use o parque aquático como dia de descanso entre parques temáticos');
  } else if (hasMultipleDisneyParks && duration >= 5 && budget !== 'Econômico') {
    ticketType = 'hopper';
    reason = 'O Park Hopper é ideal para quem quer flexibilidade de visitar mais de um parque por dia, otimizando seu tempo.';
    tips.push('Chegue no parque principal logo na abertura e pule para outro após o almoço');
    tips.push('Use o hopper para ver fogos em um parque diferente à noite');
  } else if (budget === 'Econômico') {
    ticketType = 'base';
    recommendedDays = Math.min(recommendedDays, selectedDisneyParks.length);
    reason = 'O ingresso base oferece o melhor custo-benefício. Um parque por dia permite aproveitar tudo sem pressa.';
    tips.push('Dedique um dia inteiro para cada parque para aproveitar ao máximo');
    tips.push('Chegue antes da abertura para pegar as atrações mais populares');
  } else {
    ticketType = 'base';
    reason = 'Para sua viagem, o ingresso base é suficiente. Você terá tempo de aproveitar cada parque com calma.';
    tips.push('Planeje seu dia usando o app My Disney Experience');
  }

  // Dicas para crianças
  const hasSmallChildren = childrenAges.some(age => age < 7);
  if (hasSmallChildren) {
    tips.push('Com crianças pequenas, planeje pausas para descanso no meio do dia');
    tips.push('Use o Rider Switch para atrações com restrição de altura');
  }

  // Dica de compra
  tips.push('Compre os ingressos com antecedência para garantir preços menores');

  const costs = calculateCost(ticketType, recommendedDays, adultsCount, childrenCount);

  const typeLabels = {
    base: 'Ingresso Base',
    hopper: 'Park Hopper',
    hopperPlus: 'Park Hopper Plus'
  };

  return {
    type: typeLabels[ticketType],
    days: recommendedDays,
    parks: selectedDisneyParks,
    estimatedCostAdult: costs.adult,
    estimatedCostChild: costs.child,
    totalEstimate: costs.total,
    reason,
    tips,
    buyLink: 'https://guiaofp.lovable.app/checkout/premium'
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itineraryData } = await req.json();
    
    if (!itineraryData) {
      return new Response(
        JSON.stringify({ error: 'itineraryData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const suggestions = analyzeAndSuggest(itineraryData);
    
    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
