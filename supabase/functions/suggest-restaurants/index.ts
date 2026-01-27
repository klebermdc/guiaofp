import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ItineraryData {
  selectedParks: string[];
  budget: string;
  adultsCount: number;
  childrenCount: number;
  travelStyle: string;
}

interface RestaurantRecommendation {
  name: string;
  park: string;
  cuisine: string;
  priceLevel: string;
  priceRange: string;
  requiresReservation: boolean;
  mustTry: string;
  tips: string;
  imageEmoji: string;
}

// Database of recommended restaurants by park
const RESTAURANT_DATABASE: Record<string, RestaurantRecommendation[]> = {
  "Magic Kingdom": [
    {
      name: "Be Our Guest Restaurant",
      park: "Magic Kingdom",
      cuisine: "Francesa",
      priceLevel: "$$$$",
      priceRange: "$40-65 por pessoa",
      requiresReservation: true,
      mustTry: "The Grey Stuff (sobremesa icônica do filme)",
      tips: "Faça reserva 60 dias antes! O ambiente do castelo da Fera é mágico.",
      imageEmoji: "🏰"
    },
    {
      name: "Cinderella's Royal Table",
      park: "Magic Kingdom",
      cuisine: "Americana",
      priceLevel: "$$$$",
      priceRange: "$60-85 por pessoa",
      requiresReservation: true,
      mustTry: "Café da manhã com princesas",
      tips: "Experiência única dentro do castelo da Cinderela. Reserve com antecedência!",
      imageEmoji: "👸"
    },
    {
      name: "Skipper Canteen",
      park: "Magic Kingdom",
      cuisine: "Internacional",
      priceLevel: "$$$",
      priceRange: "$25-45 por pessoa",
      requiresReservation: true,
      mustTry: "Peruvian Roasted Chicken",
      tips: "Temática de Jungle Cruise com piadas dos garçons. Ótima opção para fugir do calor.",
      imageEmoji: "🚢"
    },
    {
      name: "Columbia Harbour House",
      park: "Magic Kingdom",
      cuisine: "Frutos do Mar",
      priceLevel: "$$",
      priceRange: "$15-22 por pessoa",
      requiresReservation: false,
      mustTry: "Lobster Roll",
      tips: "Quick-service mais tranquilo. Segundo andar tem menos filas.",
      imageEmoji: "🦞"
    },
    {
      name: "Casey's Corner",
      park: "Magic Kingdom",
      cuisine: "Americana",
      priceLevel: "$",
      priceRange: "$12-18 por pessoa",
      requiresReservation: false,
      mustTry: "Loaded Hot Dog",
      tips: "Hot dogs deliciosos com vista do castelo. Ótimo para refeição rápida.",
      imageEmoji: "🌭"
    }
  ],
  "EPCOT": [
    {
      name: "Le Cellier Steakhouse",
      park: "EPCOT",
      cuisine: "Steakhouse Canadense",
      priceLevel: "$$$$",
      priceRange: "$55-85 por pessoa",
      requiresReservation: true,
      mustTry: "Canadian Cheddar Cheese Soup e Filet Mignon",
      tips: "Um dos melhores steaks da Disney. Ambiente aconchegante no pavilhão do Canadá.",
      imageEmoji: "🥩"
    },
    {
      name: "Teppan Edo",
      park: "EPCOT",
      cuisine: "Japonesa",
      priceLevel: "$$$",
      priceRange: "$35-55 por pessoa",
      requiresReservation: true,
      mustTry: "Show de Teppanyaki com Filet e Frango",
      tips: "Chefs fazem show na sua mesa. Divertido para crianças!",
      imageEmoji: "🍱"
    },
    {
      name: "Biergarten Restaurant",
      park: "EPCOT",
      cuisine: "Alemã",
      priceLevel: "$$$",
      priceRange: "$30-45 por pessoa",
      requiresReservation: true,
      mustTry: "Buffet com Schnitzel e Sausages",
      tips: "Buffet alemão com show ao vivo. Mesas compartilhadas, ótimo ambiente!",
      imageEmoji: "🍺"
    },
    {
      name: "La Hacienda de San Angel",
      park: "EPCOT",
      cuisine: "Mexicana",
      priceLevel: "$$$",
      priceRange: "$28-45 por pessoa",
      requiresReservation: true,
      mustTry: "Tacos de Ribeye e Margaritas",
      tips: "Vista perfeita para os fogos de artifício! Reserve para o jantar.",
      imageEmoji: "🌮"
    },
    {
      name: "Les Halles Boulangerie-Patisserie",
      park: "EPCOT",
      cuisine: "Francesa",
      priceLevel: "$$",
      priceRange: "$12-20 por pessoa",
      requiresReservation: false,
      mustTry: "Croissants e Quiche",
      tips: "Padaria autêntica francesa. Perfeito para café da manhã ou lanche.",
      imageEmoji: "🥐"
    }
  ],
  "Hollywood Studios": [
    {
      name: "Brown Derby",
      park: "Hollywood Studios",
      cuisine: "Americana Clássica",
      priceLevel: "$$$$",
      priceRange: "$45-70 por pessoa",
      requiresReservation: true,
      mustTry: "Cobb Salad (receita original de 1937) e Grapefruit Cake",
      tips: "Ambiente Hollywood glamouroso. Imperdível para amantes de cinema clássico.",
      imageEmoji: "🎬"
    },
    {
      name: "50's Prime Time Café",
      park: "Hollywood Studios",
      cuisine: "Americana Comfort Food",
      priceLevel: "$$$",
      priceRange: "$22-35 por pessoa",
      requiresReservation: true,
      mustTry: "Fried Chicken e Meatloaf",
      tips: "Garçons fingem ser sua família dos anos 50. Coma os vegetais ou leva bronca!",
      imageEmoji: "📺"
    },
    {
      name: "Sci-Fi Dine-In Theater",
      park: "Hollywood Studios",
      cuisine: "Americana",
      priceLevel: "$$$",
      priceRange: "$22-38 por pessoa",
      requiresReservation: true,
      mustTry: "Reuben Burger",
      tips: "Você come dentro de um carro assistindo filmes B de ficção científica!",
      imageEmoji: "🚗"
    },
    {
      name: "Docking Bay 7",
      park: "Hollywood Studios",
      cuisine: "Galáctica",
      priceLevel: "$$",
      priceRange: "$16-25 por pessoa",
      requiresReservation: false,
      mustTry: "Smoked Kaadu Ribs",
      tips: "Quick-service em Galaxy's Edge. Comida surpreendentemente boa!",
      imageEmoji: "🚀"
    },
    {
      name: "Woody's Lunch Box",
      park: "Hollywood Studios",
      cuisine: "Americana",
      priceLevel: "$$",
      priceRange: "$12-18 por pessoa",
      requiresReservation: false,
      mustTry: "Totchos e Lunch Box Tart",
      tips: "Em Toy Story Land. Chegue cedo, filas são longas!",
      imageEmoji: "🤠"
    }
  ],
  "Animal Kingdom": [
    {
      name: "Tiffins",
      park: "Animal Kingdom",
      cuisine: "Internacional/Fusion",
      priceLevel: "$$$$",
      priceRange: "$50-75 por pessoa",
      requiresReservation: true,
      mustTry: "Surf and Turf e Bread Service",
      tips: "Considerado um dos melhores restaurantes da Disney. Decoração com arte de viagens.",
      imageEmoji: "🌍"
    },
    {
      name: "Yak & Yeti",
      park: "Animal Kingdom",
      cuisine: "Asiática",
      priceLevel: "$$$",
      priceRange: "$25-40 por pessoa",
      requiresReservation: true,
      mustTry: "Ahi Tuna Nachos e Crispy Honey Chicken",
      tips: "Ambiente asiático elaborado. Também tem versão quick-service.",
      imageEmoji: "🏔️"
    },
    {
      name: "Tusker House",
      park: "Animal Kingdom",
      cuisine: "Africana",
      priceLevel: "$$$",
      priceRange: "$35-55 por pessoa",
      requiresReservation: true,
      mustTry: "Buffet com pratos africanos e Mickey Safari",
      tips: "Café da manhã com personagens! Reserve 60 dias antes.",
      imageEmoji: "🦁"
    },
    {
      name: "Flame Tree Barbecue",
      park: "Animal Kingdom",
      cuisine: "BBQ Americano",
      priceLevel: "$$",
      priceRange: "$14-22 por pessoa",
      requiresReservation: false,
      mustTry: "Ribs Sampler",
      tips: "Melhor BBQ dos parques. Área de assentos com vista linda do lago.",
      imageEmoji: "🍖"
    },
    {
      name: "Satu'li Canteen",
      park: "Animal Kingdom",
      cuisine: "Saudável/Bowls",
      priceLevel: "$$",
      priceRange: "$15-22 por pessoa",
      requiresReservation: false,
      mustTry: "Cheeseburger Pods e Bowls customizáveis",
      tips: "Em Pandora. Comida surpreendente e saudável. Use Mobile Order!",
      imageEmoji: "🌿"
    }
  ],
  "Universal Studios": [
    {
      name: "Lombard's Seafood Grille",
      park: "Universal Studios",
      cuisine: "Frutos do Mar",
      priceLevel: "$$$",
      priceRange: "$28-45 por pessoa",
      requiresReservation: true,
      mustTry: "Fish and Chips e New England Clam Chowder",
      tips: "Ambiente de São Francisco. Bom escape do calor e das filas.",
      imageEmoji: "🦐"
    },
    {
      name: "Finnegan's Bar & Grill",
      park: "Universal Studios",
      cuisine: "Irlandesa/Americana",
      priceLevel: "$$$",
      priceRange: "$20-35 por pessoa",
      requiresReservation: false,
      mustTry: "Shepherd's Pie e Fish & Chips",
      tips: "Pub irlandês autêntico com música ao vivo às vezes.",
      imageEmoji: "☘️"
    },
    {
      name: "Leaky Cauldron",
      park: "Universal Studios",
      cuisine: "Britânica",
      priceLevel: "$$",
      priceRange: "$15-25 por pessoa",
      requiresReservation: false,
      mustTry: "Fish and Chips e Butterbeer",
      tips: "Em Diagon Alley. Ambiente mágico! Chegue fora do horário de pico.",
      imageEmoji: "⚡"
    },
    {
      name: "Fast Food Boulevard",
      park: "Universal Studios",
      cuisine: "Variada/Temática",
      priceLevel: "$$",
      priceRange: "$12-20 por pessoa",
      requiresReservation: false,
      mustTry: "Krusty Burger e Buzz Cola",
      tips: "Em Springfield! Vários restaurantes dos Simpsons em um só lugar.",
      imageEmoji: "🍔"
    }
  ],
  "Islands of Adventure": [
    {
      name: "Mythos Restaurant",
      park: "Islands of Adventure",
      cuisine: "Mediterrânea",
      priceLevel: "$$$",
      priceRange: "$25-42 por pessoa",
      requiresReservation: true,
      mustTry: "Pad Thai e Lamb Burger",
      tips: "Já foi eleito melhor restaurante de parque temático! Caverna impressionante.",
      imageEmoji: "🏛️"
    },
    {
      name: "Three Broomsticks",
      park: "Islands of Adventure",
      cuisine: "Britânica",
      priceLevel: "$$",
      priceRange: "$15-25 por pessoa",
      requiresReservation: false,
      mustTry: "Great Feast (para compartilhar) e Butterbeer",
      tips: "Em Hogsmeade. Ambiente incrível! Café da manhã é menos cheio.",
      imageEmoji: "🧙"
    },
    {
      name: "Confisco Grille",
      park: "Islands of Adventure",
      cuisine: "Americana/Internacional",
      priceLevel: "$$$",
      priceRange: "$20-35 por pessoa",
      requiresReservation: false,
      mustTry: "Wood-Grilled Chicken e Pad Thai",
      tips: "Opção mais tranquila próxima à entrada. Bom para fugir das multidões.",
      imageEmoji: "🗺️"
    },
    {
      name: "Captain America Diner",
      park: "Islands of Adventure",
      cuisine: "Americana Fast Food",
      priceLevel: "$$",
      priceRange: "$12-18 por pessoa",
      requiresReservation: false,
      mustTry: "Cheeseburger e Milkshakes",
      tips: "Em Marvel Super Hero Island. Quick-service temático de heróis.",
      imageEmoji: "🦸"
    }
  ],
  "Epic Universe": [
    {
      name: "The Weasley's Wizarding Wheezes Café",
      park: "Epic Universe",
      cuisine: "Britânica/Fantasia",
      priceLevel: "$$",
      priceRange: "$15-25 por pessoa",
      requiresReservation: false,
      mustTry: "Produtos mágicos temáticos",
      tips: "Novo parque! Explore as opções gastronômicas únicas.",
      imageEmoji: "🪄"
    },
    {
      name: "How to Train Your Dragon Feast Hall",
      park: "Epic Universe",
      cuisine: "Viking/Nórdica",
      priceLevel: "$$$",
      priceRange: "$25-40 por pessoa",
      requiresReservation: true,
      mustTry: "Banquete Viking",
      tips: "Experiência imersiva no mundo de Como Treinar Seu Dragão.",
      imageEmoji: "🐉"
    }
  ]
};

function getRestaurantsByProfile(data: ItineraryData): RestaurantRecommendation[] {
  const { selectedParks, budget, adultsCount, childrenCount, travelStyle } = data;
  
  const hasKids = childrenCount > 0;
  const isLargGroup = (adultsCount + childrenCount) >= 5;
  
  // Map budget to price levels
  const budgetToPriceLevels: Record<string, string[]> = {
    "Econômico": ["$", "$$"],
    "Moderado": ["$$", "$$$"],
    "Confortável": ["$$", "$$$", "$$$$"],
    "Premium": ["$$$", "$$$$"],
  };
  
  const allowedPriceLevels = budgetToPriceLevels[budget] || ["$$", "$$$"];
  
  // Collect restaurants from selected parks
  let restaurants: RestaurantRecommendation[] = [];
  
  for (const park of selectedParks) {
    const parkRestaurants = RESTAURANT_DATABASE[park] || [];
    restaurants = [...restaurants, ...parkRestaurants];
  }
  
  // Filter by budget
  restaurants = restaurants.filter(r => allowedPriceLevels.includes(r.priceLevel));
  
  // Prioritize based on travel style
  if (travelStyle === "Agitado" || travelStyle === "Focado em Parques") {
    // Prefer quick-service for busy travelers
    restaurants.sort((a, b) => {
      if (!a.requiresReservation && b.requiresReservation) return -1;
      if (a.requiresReservation && !b.requiresReservation) return 1;
      return 0;
    });
  } else if (travelStyle === "Tranquilo") {
    // Prefer table-service for relaxed travelers
    restaurants.sort((a, b) => {
      if (a.requiresReservation && !b.requiresReservation) return -1;
      if (!a.requiresReservation && b.requiresReservation) return 1;
      return 0;
    });
  }
  
  // If has kids, prioritize family-friendly options
  if (hasKids) {
    // Move quick-service up for families with young kids
    restaurants.sort((a, b) => {
      // Kid-friendly restaurants have $ or $$ pricing usually
      const aKidFriendly = a.priceLevel === "$" || a.priceLevel === "$$";
      const bKidFriendly = b.priceLevel === "$" || b.priceLevel === "$$";
      if (aKidFriendly && !bKidFriendly) return -1;
      if (!aKidFriendly && bKidFriendly) return 1;
      return 0;
    });
  }
  
  // Remove duplicates and limit results
  const seen = new Set<string>();
  const unique: RestaurantRecommendation[] = [];
  
  for (const r of restaurants) {
    if (!seen.has(r.name)) {
      seen.add(r.name);
      unique.push(r);
    }
  }
  
  // Return top recommendations (max 2 per park, up to 8 total)
  const parkCounts: Record<string, number> = {};
  const result: RestaurantRecommendation[] = [];
  
  for (const r of unique) {
    parkCounts[r.park] = (parkCounts[r.park] || 0) + 1;
    if (parkCounts[r.park] <= 2 && result.length < 8) {
      result.push(r);
    }
  }
  
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { itineraryData } = await req.json();
    
    if (!itineraryData) {
      return new Response(
        JSON.stringify({ error: "Missing itinerary data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const restaurants = getRestaurantsByProfile(itineraryData);

    return new Response(
      JSON.stringify({ restaurants }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in suggest-restaurants:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
