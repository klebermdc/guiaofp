import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dados completos dos restaurantes
const restaurantsData = [
  // ========== DISNEY PARKS ==========
  // MAGIC KINGDOM
  {
    id: 'cinderella-royal-table',
    name: "Cinderella's Royal Table",
    category: 'disney',
    location: 'Magic Kingdom',
    area: 'Fantasyland',
    address: 'Fantasyland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Jante dentro do icônico Castelo da Cinderela nesta experiência gastronômica mágica.',
    price_range: '$$$$',
    highlights: ['Jantar dentro do Castelo da Cinderela', 'Encontro com princesas Disney'],
    reservation_required: true,
    featured: true,
    character_dining: true
  },
  {
    id: 'be-our-guest',
    name: "Be Our Guest Restaurant",
    category: 'disney',
    location: 'Magic Kingdom',
    area: 'Fantasyland',
    address: 'Fantasyland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Inspirado em A Bela e a Fera, oferece três ambientes temáticos com culinária francesa-americana.',
    price_range: '$$$',
    highlights: ['Cenário do filme A Bela e a Fera', 'Três ambientes temáticos diferentes'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'crystal-palace',
    name: 'The Crystal Palace',
    category: 'disney',
    location: 'Magic Kingdom',
    area: 'Main Street U.S.A.',
    address: 'Main Street U.S.A., Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Buffet estilo vitoriano com personagens do Ursinho Pooh.',
    price_range: '$$$',
    highlights: ['Personagens do Ursinho Pooh', 'Buffet variado'],
    reservation_required: true,
    character_dining: true
  },
  {
    id: 'jungle-skipper-canteen',
    name: 'Jungle Navigation Co. Ltd. Skipper Canteen',
    category: 'disney',
    location: 'Magic Kingdom',
    area: 'Adventureland',
    address: 'Adventureland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante temático inspirado na Jungle Cruise com culinária asiática e latino-americana.',
    price_range: '$$',
    highlights: ['Tema da Jungle Cruise', 'Culinária internacional'],
    reservation_required: true
  },
  {
    id: 'tonys-town-square',
    name: "Tony's Town Square Restaurant",
    category: 'disney',
    location: 'Magic Kingdom',
    area: 'Main Street U.S.A.',
    address: 'Main Street U.S.A., Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante italiano inspirado em A Dama e o Vagabundo.',
    price_range: '$$',
    highlights: ['Tema de A Dama e o Vagabundo', 'Culinária italiana'],
    reservation_required: true
  },
  // EPCOT
  {
    id: 'space-220',
    name: 'Space 220 Restaurant',
    category: 'disney',
    location: 'EPCOT',
    area: 'World Discovery',
    address: 'World Discovery, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Experiência gastronômica única "no espaço", a 220 milhas acima da Terra.',
    price_range: '$$$$',
    highlights: ['Experiência imersiva no espaço', 'Vista para a Terra'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'le-cellier',
    name: 'Le Cellier Steakhouse',
    category: 'disney',
    location: 'EPCOT',
    area: 'Canada Pavilion',
    address: 'Canada Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Steakhouse canadense em ambiente de adega. Famoso pelo filet mignon.',
    price_range: '$$$$',
    highlights: ['Steakhouse premium', 'Famosa sopa de cheddar'],
    reservation_required: true
  },
  {
    id: 'teppan-edo',
    name: 'Teppan Edo',
    category: 'disney',
    location: 'EPCOT',
    area: 'Japan Pavilion',
    address: 'Japan Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Experiência teppanyaki tradicional japonesa com chefs ao vivo.',
    price_range: '$$$',
    highlights: ['Teppanyaki ao vivo', 'Culinária japonesa autêntica'],
    reservation_required: true
  },
  {
    id: 'san-angel-inn',
    name: 'San Angel Inn Restaurante',
    category: 'disney',
    location: 'EPCOT',
    area: 'Mexico Pavilion',
    address: 'Mexico Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante mexicano em ambiente noturno permanente à beira do rio.',
    price_range: '$$$',
    highlights: ['Dentro da pirâmide mexicana', 'Ambiente noturno único'],
    reservation_required: true
  },
  {
    id: 'chefs-de-france',
    name: 'Chefs de France',
    category: 'disney',
    location: 'EPCOT',
    area: 'France Pavilion',
    address: 'France Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Autêntica brasserie francesa com chefs renomados.',
    price_range: '$$$',
    highlights: ['Culinária francesa autêntica', 'Chefs franceses'],
    reservation_required: true
  },
  {
    id: 'biergarten',
    name: 'Biergarten Restaurant',
    category: 'disney',
    location: 'EPCOT',
    area: 'Germany Pavilion',
    address: 'Germany Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Buffet alemão com música ao vivo e dança tradicional.',
    price_range: '$$',
    highlights: ['Buffet alemão', 'Música ao vivo'],
    reservation_required: true
  },
  {
    id: 'la-hacienda',
    name: 'La Hacienda de San Angel',
    category: 'disney',
    location: 'EPCOT',
    area: 'Mexico Pavilion',
    address: 'Mexico Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante mexicano com vista para a lagoa e os fogos.',
    price_range: '$$$',
    highlights: ['Vista para Illuminations', 'Culinária mexicana premium'],
    reservation_required: true
  },
  {
    id: 'tutto-italia',
    name: 'Tutto Italia Ristorante',
    category: 'disney',
    location: 'EPCOT',
    area: 'Italy Pavilion',
    address: 'Italy Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante italiano autêntico no Pavilhão da Itália.',
    price_range: '$$$',
    highlights: ['Culinária italiana autêntica', 'Ambiente elegante'],
    reservation_required: true
  },
  {
    id: 'takumi-tei',
    name: 'Takumi-Tei',
    category: 'disney',
    location: 'EPCOT',
    area: 'Japan Pavilion',
    address: 'Japan Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'O restaurante mais refinado do Japão em EPCOT. Kaiseki cuisine.',
    price_range: '$$$$',
    highlights: ['Kaiseki cuisine', 'Experiência premium'],
    reservation_required: true,
    featured: true
  },
  // HOLLYWOOD STUDIOS
  {
    id: 'hollywood-brown-derby',
    name: 'The Hollywood Brown Derby',
    category: 'disney',
    location: 'Hollywood Studios',
    area: 'Hollywood Boulevard',
    address: 'Hollywood Boulevard, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Réplica do icônico restaurante de Hollywood. Famoso pela Cobb Salad.',
    price_range: '$$$$',
    highlights: ['Réplica do Hollywood original', 'Famosa Cobb Salad'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'sci-fi-dine-in',
    name: 'Sci-Fi Dine-In Theater Restaurant',
    category: 'disney',
    location: 'Hollywood Studios',
    area: 'Commissary Lane',
    address: 'Commissary Lane, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Jante em carros clássicos assistindo a filmes sci-fi antigos.',
    price_range: '$$',
    highlights: ['Jante em carros clássicos', 'Filmes sci-fi clássicos'],
    reservation_required: true,
    featured: true
  },
  {
    id: '50s-prime-time',
    name: "50's Prime Time Café",
    category: 'disney',
    location: 'Hollywood Studios',
    area: 'Echo Lake',
    address: 'Echo Lake, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Jante na cozinha da vovó nos anos 50! Garçons interativos.',
    price_range: '$$',
    highlights: ['Tema anos 50', 'Garçons interativos'],
    reservation_required: true
  },
  {
    id: 'docking-bay-7',
    name: 'Docking Bay 7 Food and Cargo',
    category: 'disney',
    location: 'Hollywood Studios',
    area: "Galaxy's Edge",
    address: "Star Wars: Galaxy's Edge, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830",
    description: 'Principal restaurante de Star Wars: Galaxy\'s Edge.',
    price_range: '$$',
    highlights: ['Tema Star Wars', 'Pratos de planetas diferentes'],
    reservation_required: false
  },
  {
    id: 'ogas-cantina',
    name: "Oga's Cantina",
    category: 'disney',
    location: 'Hollywood Studios',
    area: "Galaxy's Edge",
    address: "Star Wars: Galaxy's Edge, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830",
    description: 'Bar temático de Star Wars com bebidas únicas e DJ droid.',
    price_range: '$$',
    highlights: ['Bar de Star Wars', 'DJ droid ao vivo'],
    reservation_required: true
  },
  // ANIMAL KINGDOM
  {
    id: 'tiffins',
    name: 'Tiffins Restaurant',
    category: 'disney',
    location: 'Animal Kingdom',
    area: 'Discovery Island',
    address: 'Discovery Island, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante signature com culinária inspirada nas viagens dos Imagineers.',
    price_range: '$$$$',
    highlights: ['Culinária internacional refinada', 'Arte dos Imagineers'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'satuli-canteen',
    name: "Satu'li Canteen",
    category: 'disney',
    location: 'Animal Kingdom',
    area: 'Pandora',
    address: 'Pandora - The World of Avatar, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    description: 'Restaurante quick-service de Pandora com bowls customizáveis.',
    price_range: '$$',
    highlights: ['Tema de Avatar', 'Bowls customizáveis'],
    reservation_required: false
  },
  {
    id: 'yak-and-yeti',
    name: 'Yak & Yeti Restaurant',
    category: 'disney',
    location: 'Animal Kingdom',
    area: 'Asia',
    address: 'Asia, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante pan-asiático em construção nepalesa.',
    price_range: '$$',
    highlights: ['Culinária pan-asiática', 'Ambiente nepalês'],
    reservation_required: true
  },
  {
    id: 'flame-tree',
    name: 'Flame Tree Barbecue',
    category: 'disney',
    location: 'Animal Kingdom',
    area: 'Discovery Island',
    address: 'Discovery Island, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    description: 'Melhor BBQ do Walt Disney World. Quick-service com vista.',
    price_range: '$$',
    highlights: ['Melhor BBQ da Disney', 'Vista para a lagoa'],
    reservation_required: false
  },
  {
    id: 'tusker-house',
    name: 'Tusker House Restaurant',
    category: 'disney',
    location: 'Animal Kingdom',
    area: 'Africa',
    address: 'Africa, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Buffet africano com personagens do Safari Donald.',
    price_range: '$$$',
    highlights: ['Buffet africano', 'Personagens Disney'],
    reservation_required: true,
    character_dining: true
  },
  // DISNEY SPRINGS
  {
    id: 'morimoto-asia',
    name: 'Morimoto Asia',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 939-6686',
    description: 'Restaurante do Iron Chef Masaharu Morimoto com culinária pan-asiática.',
    price_range: '$$$',
    highlights: ['Chef Masaharu Morimoto', 'Culinária pan-asiática'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'homecomin',
    name: "Homecomin' Florida Kitchen",
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 560-0100',
    description: 'Restaurante do Chef Art Smith. Comida sulista da Flórida.',
    price_range: '$$',
    highlights: ['Chef Art Smith', 'Culinária sulista'],
    reservation_required: true
  },
  {
    id: 'jaleo',
    name: 'Jaleo by José Andrés',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 560-8646',
    description: 'Tapas espanholas do famoso chef José Andrés.',
    price_range: '$$$',
    highlights: ['Chef José Andrés', 'Tapas autênticas'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'the-polite-pig',
    name: 'The Polite Pig',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 938-7444',
    description: 'BBQ artesanal com drinks criativos. Dos criadores do The Ravenous Pig.',
    price_range: '$$',
    highlights: ['BBQ artesanal', 'Drinks criativos'],
    reservation_required: false
  },
  {
    id: 'wine-bar-george',
    name: 'Wine Bar George',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 490-1800',
    description: 'Bar de vinhos do Master Sommelier George Miliotes.',
    price_range: '$$$',
    highlights: ['Master Sommelier', 'Carta de vinhos extensa'],
    reservation_required: true
  },
  {
    id: 'the-boathouse',
    name: 'The Boathouse',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 939-2628',
    description: 'Steakhouse e frutos do mar com barcos anfíbios vintage.',
    price_range: '$$$',
    highlights: ['Barcos anfíbios', 'Frutos do mar premium'],
    reservation_required: true
  },
  {
    id: 'paddlefish',
    name: 'Paddlefish',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 934-2628',
    description: 'Restaurante de frutos do mar em um barco a vapor renovado.',
    price_range: '$$$',
    highlights: ['Em barco a vapor', 'Frutos do mar'],
    reservation_required: true
  },
  {
    id: 'stk-orlando',
    name: 'STK Orlando',
    category: 'disney',
    location: 'Disney Springs',
    address: 'Disney Springs, Lake Buena Vista, FL 32830',
    phone: '(407) 917-7440',
    description: 'Steakhouse moderno com DJ e ambiente de clube.',
    price_range: '$$$$',
    highlights: ['Steakhouse moderno', 'DJ ao vivo'],
    reservation_required: true
  },
  // DISNEY RESORTS
  {
    id: 'victoria-alberts',
    name: "Victoria & Albert's",
    category: 'disney',
    location: 'Disney Springs',
    address: "Disney's Grand Floridian Resort & Spa, Walt Disney World, FL 32830",
    phone: '(407) 939-3862',
    description: 'O restaurante mais premiado da Disney. Fine dining com menu degustação.',
    price_range: '$$$$',
    highlights: ['AAA Five Diamond', 'Menu degustação'],
    reservation_required: true,
    featured: true,
    michelin: true
  },
  {
    id: 'california-grill',
    name: 'California Grill',
    category: 'disney',
    location: 'Disney Springs',
    address: "Disney's Contemporary Resort, Walt Disney World, FL 32830",
    phone: '(407) 939-3463',
    description: 'Vista espetacular para o Magic Kingdom e fogos de artifício.',
    price_range: '$$$$',
    highlights: ['Vista para fogos', 'Culinária contemporânea'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'boma',
    name: 'Boma - Flavors of Africa',
    category: 'disney',
    location: 'Disney Springs',
    address: "Disney's Animal Kingdom Lodge, Walt Disney World, FL 32830",
    phone: '(407) 939-3463',
    description: 'Buffet africano excepcional no Animal Kingdom Lodge.',
    price_range: '$$$',
    highlights: ['Buffet africano', 'Savana vista'],
    reservation_required: true
  },
  {
    id: 'jiko',
    name: 'Jiko - The Cooking Place',
    category: 'disney',
    location: 'Disney Springs',
    address: "Disney's Animal Kingdom Lodge, Walt Disney World, FL 32830",
    phone: '(407) 939-3463',
    description: 'Restaurante signature africano com carta de vinhos sul-africanos.',
    price_range: '$$$$',
    highlights: ['Culinária africana', 'Vinhos sul-africanos'],
    reservation_required: true
  },
  {
    id: 'ohana',
    name: "'Ohana",
    category: 'disney',
    location: 'Disney Springs',
    address: "Disney's Polynesian Village Resort, Walt Disney World, FL 32830",
    phone: '(407) 939-3463',
    description: 'Jantar de estilo familiar havaiano com vista para o Magic Kingdom.',
    price_range: '$$$',
    highlights: ['Estilo familiar', 'Vista para fogos'],
    reservation_required: true
  },
  // ========== UNIVERSAL ==========
  // UNIVERSAL STUDIOS FLORIDA
  {
    id: 'leaky-cauldron',
    name: 'The Leaky Cauldron',
    category: 'universal',
    location: 'Universal Studios Florida',
    area: 'Diagon Alley',
    address: 'The Wizarding World of Harry Potter - Diagon Alley, Universal Studios Florida',
    description: 'Pub inglês temático de Harry Potter em Diagon Alley.',
    price_range: '$$',
    highlights: ['Tema Harry Potter', 'Cerveja Amanteigada'],
    reservation_required: false,
    featured: true
  },
  {
    id: 'mels-drive-in',
    name: "Mel's Drive-In",
    category: 'universal',
    location: 'Universal Studios Florida',
    area: 'Hollywood',
    address: 'Hollywood, Universal Studios Florida',
    description: 'Diner clássico dos anos 50 de American Graffiti.',
    price_range: '$',
    highlights: ['Tema American Graffiti', 'Hambúrgueres clássicos'],
    reservation_required: false
  },
  {
    id: 'finnegans',
    name: "Finnegan's Bar and Grill",
    category: 'universal',
    location: 'Universal Studios Florida',
    area: 'New York',
    address: 'New York, Universal Studios Florida',
    description: 'Pub irlandês com música ao vivo e fish & chips.',
    price_range: '$$',
    highlights: ['Pub irlandês autêntico', 'Música ao vivo'],
    reservation_required: true
  },
  // ISLANDS OF ADVENTURE
  {
    id: 'three-broomsticks',
    name: 'Three Broomsticks',
    category: 'universal',
    location: 'Islands of Adventure',
    area: 'Hogsmeade',
    address: 'The Wizarding World of Harry Potter - Hogsmeade, Islands of Adventure',
    description: 'Taverna de Hogsmeade com comida britânica tradicional.',
    price_range: '$$',
    highlights: ['Tema Harry Potter', 'Comida britânica'],
    reservation_required: false,
    featured: true
  },
  {
    id: 'mythos',
    name: 'Mythos Restaurant',
    category: 'universal',
    location: 'Islands of Adventure',
    area: 'The Lost Continent',
    address: 'The Lost Continent, Islands of Adventure',
    phone: '(407) 224-4012',
    description: 'Eleito melhor restaurante de parque temático múltiplas vezes.',
    price_range: '$$$',
    highlights: ['Melhor restaurante de parque', 'Vista para a lagoa'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'confisco-grille',
    name: 'Confisco Grille and Backwater Bar',
    category: 'universal',
    location: 'Islands of Adventure',
    area: 'Port of Entry',
    address: 'Port of Entry, Islands of Adventure',
    description: 'Restaurante temático de exploradores com menu diversificado.',
    price_range: '$$',
    highlights: ['Menu internacional', 'Ambiente de aventura'],
    reservation_required: true
  },
  // EPIC UNIVERSE
  {
    id: 'toadstool-cafe',
    name: 'Toadstool Cafe',
    category: 'universal',
    location: 'Epic Universe',
    area: 'Super Nintendo World',
    address: 'Super Nintendo World, Epic Universe, Universal Orlando Resort',
    description: 'Restaurante temático do Mario dentro do Super Nintendo World.',
    price_range: '$$',
    highlights: ['Tema Super Mario', 'Menu criativo'],
    reservation_required: true,
    featured: true
  },
  // CITYWALK
  {
    id: 'toothsome',
    name: 'Toothsome Chocolate Emporium & Savory Feast Kitchen',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 224-3663',
    description: 'Restaurante steampunk famoso pelos milkshakes e sobremesas.',
    price_range: '$$',
    highlights: ['Tema steampunk', 'Milkshakes gigantes'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'cowfish',
    name: 'The Cowfish Sushi Burger Bar',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 224-3663',
    description: 'Fusão única de sushi e hambúrgueres. Burgushi!',
    price_range: '$$',
    highlights: ['Fusão sushi-burger', 'Burgushi'],
    reservation_required: true
  },
  {
    id: 'hard-rock-cafe',
    name: 'Hard Rock Cafe Orlando',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 351-7625',
    description: 'O maior Hard Rock Cafe do mundo com memorabilia icônica.',
    price_range: '$$',
    highlights: ['Maior do mundo', 'Memorabilia musical'],
    reservation_required: false
  },
  {
    id: 'antojitos',
    name: 'Antojitos Authentic Mexican Food',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 224-3663',
    description: 'Culinária mexicana autêntica com ambiente colorido.',
    price_range: '$$',
    highlights: ['Culinária mexicana autêntica', 'Margaritas'],
    reservation_required: true
  },
  {
    id: 'bigfire',
    name: 'Bigfire',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 224-3663',
    description: 'Restaurante com culinária de fogo aberto e tema de acampamento.',
    price_range: '$$$',
    highlights: ['Culinária de fogo aberto', 'Tema campfire'],
    reservation_required: true
  },
  {
    id: 'vivo',
    name: 'Vivo Italian Kitchen',
    category: 'universal',
    location: 'CityWalk',
    address: 'CityWalk, Universal Orlando Resort',
    phone: '(407) 224-3663',
    description: 'Culinária italiana com massas frescas feitas na hora.',
    price_range: '$$',
    highlights: ['Massas frescas', 'Culinária italiana'],
    reservation_required: true
  },
  // ========== FORA DOS PARQUES ==========
  // STEAKHOUSES
  {
    id: 'christners',
    name: "Christner's Prime Steak & Lobster",
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '729 Lee Rd, Orlando, FL 32810',
    phone: '(407) 645-4443',
    description: 'Steakhouse clássico desde 1993. Ambiente elegante e atendimento excepcional.',
    price_range: '$$$$',
    highlights: ['Steakhouse clássico', 'Cortes premium'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'flemings',
    name: "Fleming's Prime Steakhouse & Wine Bar",
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '8030 Via Dellagio Way, Orlando, FL 32819',
    phone: '(407) 352-5706',
    description: 'Steakhouse premium com excelente carta de vinhos.',
    price_range: '$$$$',
    highlights: ['Cortes USDA Prime', 'Carta de vinhos'],
    reservation_required: true
  },
  {
    id: 'ruths-chris',
    name: "Ruth's Chris Steak House",
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '7501 W Sand Lake Rd, Orlando, FL 32819',
    phone: '(407) 226-3900',
    description: 'Steakhouse icônico com carnes servidas em pratos a 500°F.',
    price_range: '$$$$',
    highlights: ['Pratos a 500°F', 'Cortes USDA Prime'],
    reservation_required: true
  },
  {
    id: 'texas-de-brazil',
    name: 'Texas de Brazil',
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '5259 International Dr, Orlando, FL 32819',
    phone: '(407) 355-0355',
    description: 'Churrascaria brasileira com rodízio de carnes premium.',
    price_range: '$$$',
    highlights: ['Rodízio brasileiro', 'Carnes grelhadas'],
    reservation_required: true
  },
  // FRUTOS DO MAR
  {
    id: 'oceanaire',
    name: 'Oceanaire Seafood Room',
    category: 'fora-parques',
    subcategory: 'Frutos do Mar',
    address: '9101 International Dr, Orlando, FL 32819',
    phone: '(407) 363-4801',
    description: 'Restaurante de frutos do mar premium com ambiente art déco.',
    price_range: '$$$$',
    highlights: ['Frutos do mar frescos', 'Ambiente art déco'],
    reservation_required: true
  },
  {
    id: 'eddie-vs',
    name: "Eddie V's Prime Seafood",
    category: 'fora-parques',
    subcategory: 'Frutos do Mar',
    address: '7488 W Sand Lake Rd, Orlando, FL 32819',
    phone: '(407) 355-3011',
    description: 'Frutos do mar premium com lounge e música ao vivo.',
    price_range: '$$$$',
    highlights: ['Frutos do mar frescos', 'Música ao vivo'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'bonefish-grill',
    name: 'Bonefish Grill',
    category: 'fora-parques',
    subcategory: 'Frutos do Mar',
    address: '7830 W Sand Lake Rd, Orlando, FL 32819',
    phone: '(407) 355-7707',
    description: 'Restaurante de frutos do mar casual com peixes frescos.',
    price_range: '$$',
    highlights: ['Peixes frescos', 'Bang Bang Shrimp'],
    reservation_required: true
  },
  // ITALIANOS
  {
    id: 'christinis',
    name: "Christini's Ristorante Italiano",
    category: 'fora-parques',
    subcategory: 'Italiano',
    address: '7600 Dr Phillips Blvd, Orlando, FL 32819',
    phone: '(407) 345-8770',
    description: 'Fine dining italiano com música ao vivo e ambiente romântico.',
    price_range: '$$$$',
    highlights: ['Fine dining italiano', 'Música ao vivo'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'maggianos',
    name: "Maggiano's Little Italy",
    category: 'fora-parques',
    subcategory: 'Italiano',
    address: '9101 International Dr, Orlando, FL 32819',
    phone: '(407) 241-8811',
    description: 'Restaurante italiano estilo familiar com porções generosas.',
    price_range: '$$',
    highlights: ['Porções família', 'Culinária italiana clássica'],
    reservation_required: true
  },
  {
    id: 'brios',
    name: 'Brio Italian Grille',
    category: 'fora-parques',
    subcategory: 'Italiano',
    address: '4200 Conroy Rd, Orlando, FL 32839',
    phone: '(407) 351-8909',
    description: 'Culinária italiana em ambiente toscano moderno.',
    price_range: '$$',
    highlights: ['Ambiente toscano', 'Menu variado'],
    reservation_required: true
  },
  // JAPONESES
  {
    id: 'dragonfly',
    name: 'Dragonfly Robata Grill & Sushi',
    category: 'fora-parques',
    subcategory: 'Japonês',
    address: '7972 Via Dellagio Way, Orlando, FL 32819',
    phone: '(407) 370-3359',
    description: 'Culinária japonesa moderna com robata e sushi premium.',
    price_range: '$$$',
    highlights: ['Robata grill', 'Sushi premium'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'kobe',
    name: 'Kobe Japanese Steakhouse & Sushi',
    category: 'fora-parques',
    subcategory: 'Japonês',
    address: '9101 International Dr, Orlando, FL 32819',
    phone: '(407) 345-0007',
    description: 'Teppanyaki e sushi em ambiente divertido.',
    price_range: '$$',
    highlights: ['Teppanyaki', 'Show dos chefs'],
    reservation_required: true
  },
  // BRASILEIROS
  {
    id: 'fogo-de-chao',
    name: 'Fogo de Chão Brazilian Steakhouse',
    category: 'fora-parques',
    subcategory: 'Brasileiro',
    address: '8282 International Dr, Orlando, FL 32819',
    phone: '(407) 370-0711',
    description: 'Churrascaria brasileira premium com rodízio de 16 cortes.',
    price_range: '$$$$',
    highlights: ['Rodízio brasileiro', '16 cortes de carne'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'camila-s',
    name: "Café Camila",
    category: 'fora-parques',
    subcategory: 'Brasileiro',
    address: '5132 International Dr, Orlando, FL 32819',
    phone: '(407) 370-6000',
    description: 'Café brasileiro com pratos caseiros e sobremesas.',
    price_range: '$',
    highlights: ['Comida brasileira caseira', 'Ambiente familiar'],
    reservation_required: false
  },
  // INTERNACIONAIS
  {
    id: 'luma-on-park',
    name: 'Luma on Park',
    category: 'fora-parques',
    subcategory: 'Americana Contemporânea',
    address: '290 S Park Ave, Winter Park, FL 32789',
    phone: '(407) 599-4111',
    description: 'Restaurante farm-to-table premiado em Winter Park.',
    price_range: '$$$$',
    highlights: ['Farm-to-table', 'Ambiente elegante'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'ravenous-pig',
    name: 'The Ravenous Pig',
    category: 'fora-parques',
    subcategory: 'Gastropub',
    address: '565 W Fairbanks Ave, Winter Park, FL 32789',
    phone: '(407) 628-2333',
    description: 'Gastropub premiado com cerveja artesanal própria.',
    price_range: '$$$',
    highlights: ['Gastropub premiado', 'Cerveja artesanal'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'seasons-52',
    name: 'Seasons 52',
    category: 'fora-parques',
    subcategory: 'Americana Contemporânea',
    address: '7700 W Sand Lake Rd, Orlando, FL 32819',
    phone: '(407) 354-5212',
    description: 'Culinária sazonal com foco em pratos leves e saudáveis.',
    price_range: '$$$',
    highlights: ['Menu sazonal', 'Pratos saudáveis'],
    reservation_required: true
  },
  {
    id: 'capa',
    name: 'Capa Steakhouse',
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: 'Four Seasons Resort Orlando, 10100 Dream Tree Blvd, Golden Oak, FL 34747',
    phone: '(407) 313-6161',
    description: 'Steakhouse espanhol no rooftop com vista para fogos da Disney.',
    price_range: '$$$$',
    highlights: ['Vista para fogos Disney', 'Rooftop'],
    reservation_required: true,
    featured: true
  },
  {
    id: 'k-restaurant',
    name: 'K Restaurant',
    category: 'fora-parques',
    subcategory: 'Americana Contemporânea',
    address: '1710 Edgewater Dr, Orlando, FL 32804',
    phone: '(407) 872-2332',
    description: 'Restaurante íntimo com menu degustação e ingredientes locais.',
    price_range: '$$$$',
    highlights: ['Menu degustação', 'Chef\'s table'],
    reservation_required: true
  },
  {
    id: 'kabooki-sushi',
    name: 'Kabooki Sushi',
    category: 'fora-parques',
    subcategory: 'Japonês',
    address: '3122 E Colonial Dr, Orlando, FL 32803',
    phone: '(407) 228-3839',
    description: 'Sushi criativo com ingredientes frescos. Omakase disponível.',
    price_range: '$$$',
    highlights: ['Sushi criativo', 'Omakase'],
    reservation_required: true
  },
  {
    id: 'hawkers',
    name: 'Hawkers Asian Street Food',
    category: 'fora-parques',
    subcategory: 'Asiático',
    address: '1103 N Mills Ave, Orlando, FL 32803',
    phone: '(407) 237-0606',
    description: 'Street food asiático autêntico com menu diversificado.',
    price_range: '$$',
    highlights: ['Street food asiático', 'Ambiente casual'],
    reservation_required: false
  },
  {
    id: 'prato',
    name: 'Prato',
    category: 'fora-parques',
    subcategory: 'Italiano',
    address: '124 N Park Ave, Winter Park, FL 32789',
    phone: '(407) 262-0050',
    description: 'Culinária italiana com ingredientes frescos em Winter Park.',
    price_range: '$$',
    highlights: ['Ingredientes frescos', 'Ambiente acolhedor'],
    reservation_required: true
  },
  {
    id: 'capital-grille',
    name: 'The Capital Grille',
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '9101 International Dr, Orlando, FL 32819',
    phone: '(407) 370-4392',
    description: 'Steakhouse elegante com dry-aged steaks e carta de vinhos.',
    price_range: '$$$$',
    highlights: ['Dry-aged steaks', 'Carta de vinhos extensa'],
    reservation_required: true
  },
  {
    id: 'del-friscos',
    name: "Del Frisco's Double Eagle Steakhouse",
    category: 'fora-parques',
    subcategory: 'Steakhouse',
    address: '9150 International Dr, Orlando, FL 32819',
    phone: '(407) 351-5074',
    description: 'Steakhouse premium com ambiente moderno e elegante.',
    price_range: '$$$$',
    highlights: ['Cortes premium', 'Ambiente elegante'],
    reservation_required: true
  }
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Primeiro, limpar restaurantes existentes para evitar duplicatas
    const { error: deleteError } = await supabase
      .from("restaurants")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta todos

    if (deleteError) {
      console.log("Delete error (may be empty table):", deleteError);
    }

    // Inserir todos os restaurantes
    const restaurantsToInsert = restaurantsData.map((r) => ({
      name: r.name,
      slug: r.id,
      category: r.category,
      subcategory: r.subcategory || null,
      location: r.location || null,
      area: r.area || null,
      address: r.address || null,
      phone: r.phone || null,
      description: r.description || null,
      price_range: r.price_range || null,
      highlights: r.highlights || null,
      reservation_required: r.reservation_required || false,
      character_dining: r.character_dining || false,
      michelin: r.michelin || false,
      featured: r.featured || false,
    }));

    const { data, error } = await supabase
      .from("restaurants")
      .insert(restaurantsToInsert)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${data.length} restaurantes migrados com sucesso!`,
        count: data.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
