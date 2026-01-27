import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItineraryData {
  budget: string;
  accommodationType: string;
  selectedParks: string[];
  duration: number;
  stayingRegion?: string;
  adultsCount?: number;
  childrenCount?: number;
  travelStyle?: string;
}

interface BaseHotel {
  name: string;
  category: string;
  pricePerNight: number;
  distance: string;
  amenities: string[];
  pros: string[];
  cons: string[];
  bookingLink: string;
  imageEmoji: string;
}

interface HotelRecommendation extends BaseHotel {
  totalEstimate: number;
}

// Base de dados de hotéis recomendados por região/categoria
const HOTEL_DATABASE = {
  disney_premium: [
    {
      name: "Disney's Grand Floridian Resort & Spa",
      category: "Deluxe",
      pricePerNight: 750,
      distance: "Monorail para Magic Kingdom",
      amenities: ["Piscina", "Spa", "Restaurantes", "Marina", "Monorail"],
      pros: ["Acesso direto ao Magic Kingdom", "Experiência premium Disney", "Early Theme Park Entry"],
      cons: ["Preço elevado", "Reservas com antecedência"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/grand-floridian-resort-and-spa/",
      imageEmoji: "🏰"
    },
    {
      name: "Disney's Contemporary Resort",
      category: "Deluxe",
      pricePerNight: 550,
      distance: "Monorail/Caminhada para Magic Kingdom",
      amenities: ["Piscina", "Chef Mickey's", "Monorail", "Fitness Center"],
      pros: ["Único hotel com monorail atravessando", "Caminhada até Magic Kingdom", "Early Entry"],
      cons: ["Design modernista pode não agradar todos"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/contemporary-resort/",
      imageEmoji: "🏢"
    },
  ],
  disney_moderate: [
    {
      name: "Disney's Caribbean Beach Resort",
      category: "Moderate",
      pricePerNight: 280,
      distance: "Skyliner para Epcot/Hollywood Studios",
      amenities: ["Piscina", "Praia", "Skyliner", "Restaurante"],
      pros: ["Skyliner para dois parques", "Ambiente tropical", "Bom custo-benefício"],
      cons: ["Resort grande, pode ser longe de tudo"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/caribbean-beach-resort/",
      imageEmoji: "🏝️"
    },
    {
      name: "Disney's Coronado Springs Resort",
      category: "Moderate",
      pricePerNight: 260,
      distance: "Ônibus para todos os parques",
      amenities: ["Piscina", "Spa", "Centro de Convenções", "Lago"],
      pros: ["Torre Destino com vistas incríveis", "Spa no resort", "Quartos reformados"],
      cons: ["Menos temático que outros moderados"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/coronado-springs-resort/",
      imageEmoji: "🌮"
    },
  ],
  disney_value: [
    {
      name: "Disney's All-Star Movies Resort",
      category: "Value",
      pricePerNight: 150,
      distance: "Ônibus para todos os parques",
      amenities: ["Piscina", "Food Court", "Loja Disney"],
      pros: ["Preço acessível", "Tema divertido", "Early Entry incluído"],
      cons: ["Quartos menores", "Apenas food court"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/all-star-movies-resort/",
      imageEmoji: "🎬"
    },
    {
      name: "Disney's Pop Century Resort",
      category: "Value",
      pricePerNight: 180,
      distance: "Skyliner para Epcot/Hollywood Studios",
      amenities: ["Piscina", "Skyliner", "Food Court", "Arcade"],
      pros: ["Skyliner disponível", "Tema nostálgico", "Reformado recentemente"],
      cons: ["Quartos compactos"],
      bookingLink: "https://disneyworld.disney.go.com/resorts/pop-century-resort/",
      imageEmoji: "🎸"
    },
  ],
  international_drive: [
    {
      name: "Universal's Endless Summer Resort",
      category: "Value",
      pricePerNight: 130,
      distance: "15 min de carro para Disney",
      amenities: ["Piscina", "Ônibus Universal", "Food Court", "Estacionamento"],
      pros: ["Preço excelente", "Ônibus grátis para Universal", "Quartos novos"],
      cons: ["Precisa de carro para Disney", "Sem benefícios Disney"],
      bookingLink: "https://www.universalorlando.com/web/en/us/places-to-stay/endless-summer-resort",
      imageEmoji: "🏄"
    },
    {
      name: "Hilton Orlando",
      category: "Upscale",
      pricePerNight: 200,
      distance: "20 min de carro para Disney",
      amenities: ["Piscinas", "Spa", "Restaurantes", "Lazy River"],
      pros: ["Localização central", "Infraestrutura completa", "Pontos Hilton"],
      cons: ["Sem benefícios de parques", "Precisa de transporte"],
      bookingLink: "https://www.hilton.com/en/hotels/orlhhhh-hilton-orlando/",
      imageEmoji: "🏨"
    },
  ],
  kissimmee: [
    {
      name: "Margaritaville Resort Orlando",
      category: "Upscale",
      pricePerNight: 250,
      distance: "10 min de carro para Disney",
      amenities: ["Parque aquático", "Restaurantes", "Spa", "Praia artificial"],
      pros: ["Parque aquático incluso", "Ambiente resort completo", "Perto da Disney"],
      cons: ["Fora do complexo Disney", "Precisa de carro"],
      bookingLink: "https://www.margaritavilleresorts.com/margaritaville-resort-orlando",
      imageEmoji: "🍹"
    },
    {
      name: "Gaylord Palms Resort",
      category: "Upscale",
      pricePerNight: 320,
      distance: "5 min de carro para Disney",
      amenities: ["Átrio coberto", "Piscinas", "Spa", "Restaurantes", "ICE! (sazonal)"],
      pros: ["Átrio impressionante", "Muito perto da Disney", "Experiência única"],
      cons: ["Resort fee alto", "Pode ser overwhelming"],
      bookingLink: "https://www.marriott.com/hotels/travel/mcogp-gaylord-palms-resort-and-convention-center/",
      imageEmoji: "🌴"
    },
  ],
  vacation_home: [
    {
      name: "Storey Lake Resort (Casa de Férias)",
      category: "Vacation Home",
      pricePerNight: 180,
      distance: "10 min de carro para Disney",
      amenities: ["Piscina privativa", "Cozinha completa", "Clube", "Lazy River"],
      pros: ["Espaço para família grande", "Cozinha economiza em refeições", "Privacidade"],
      cons: ["Precisa de carro", "Limpeza pode variar", "Sem serviço de hotel"],
      bookingLink: "https://www.vrbo.com/",
      imageEmoji: "🏠"
    },
    {
      name: "Windsor at Westside (Townhouse)",
      category: "Vacation Home",
      pricePerNight: 150,
      distance: "15 min de carro para Disney",
      amenities: ["Piscina privativa", "Clubhouse", "Playground", "BBQ"],
      pros: ["Ótimo para grupos", "Custo por pessoa baixo", "Conforto de casa"],
      cons: ["Manutenção varia por proprietário", "Check-in pode ser complexo"],
      bookingLink: "https://www.airbnb.com/",
      imageEmoji: "🏡"
    },
  ],
};

function getHotelsByProfile(data: ItineraryData): HotelRecommendation[] {
  const { budget, accommodationType, stayingRegion, duration, adultsCount = 2, childrenCount = 0 } = data;
  const totalGuests = adultsCount + childrenCount;
  
  let baseHotels: BaseHotel[] = [];
  
  // Determinar categoria baseado no orçamento
  if (budget === 'Luxo' || budget === 'Confortável') {
    baseHotels = [...(HOTEL_DATABASE.disney_premium || [])];
    if (accommodationType === 'Resort fora da Disney') {
      baseHotels = [...baseHotels, ...(HOTEL_DATABASE.kissimmee || [])];
    }
  } else if (budget === 'Moderado') {
    baseHotels = [...(HOTEL_DATABASE.disney_moderate || [])];
    if (stayingRegion === 'International Drive' || accommodationType === 'Hotel convencional') {
      baseHotels = [...baseHotels, ...(HOTEL_DATABASE.international_drive || [])];
    }
  } else {
    // Econômico
    baseHotels = [...(HOTEL_DATABASE.disney_value || [])];
    baseHotels = [...baseHotels, ...(HOTEL_DATABASE.international_drive || [])];
  }
  
  // Se preferência por casa de férias
  if (accommodationType === 'Casa de férias' || totalGuests > 4) {
    baseHotels = [...(HOTEL_DATABASE.vacation_home || []), ...baseHotels];
  }
  
  // Calcular estimativa total
  const nights = Math.max(duration - 1, 1);
  const hotels: HotelRecommendation[] = baseHotels.map(hotel => ({
    ...hotel,
    totalEstimate: hotel.pricePerNight * nights,
  }));
  
  // Ordenar por relevância (preço para econômico, qualidade para luxo)
  if (budget === 'Econômico') {
    hotels.sort((a, b) => a.pricePerNight - b.pricePerNight);
  }
  
  // Retornar top 4
  return hotels.slice(0, 4);
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

    const hotels = getHotelsByProfile(itineraryData);
    
    return new Response(JSON.stringify({ hotels }), {
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
