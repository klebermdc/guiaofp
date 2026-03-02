// Comprehensive park information for Orlando parks
// This file contains detailed information, tips, and metadata for all parks

import magicKingdomImg from '@/assets/parks/magic-kingdom.jpg';
import epcotImg from '@/assets/parks/epcot.jpg';
import hollywoodStudiosImg from '@/assets/parks/hollywood-studios.jpg';
import animalKingdomImg from '@/assets/parks/animal-kingdom.jpg';
import islandsOfAdventureImg from '@/assets/parks/islands-of-adventure.jpg';
import universalStudiosImg from '@/assets/parks/universal-studios.jpg';
import epicUniverseImg from '@/assets/parks/epic-universe.jpg';
import seaworldImg from '@/assets/parks/seaworld.jpg';
import buschGardensImg from '@/assets/parks/busch-gardens.jpg';
import legolandImg from '@/assets/parks/legoland.jpg';
import aquaticaImg from '@/assets/parks/aquatica.jpg';
import discoveryCoveImg from '@/assets/parks/discovery-cove.jpg';
import blizzardBeachImg from '@/assets/parks/blizzard-beach.jpg';
import typhoonLagoonImg from '@/assets/parks/typhoon-lagoon.jpg';
import volcanoBayImg from '@/assets/parks/volcano-bay.jpg';

export type ParkCategory = 'disney' | 'universal' | 'seaworld' | 'other' | 'waterpark';

export interface ParkTip {
  icon: string;
  title: string;
  description: string;
  type: 'dica' | 'alerta' | 'economia' | 'tempo';
}

export interface ParkAttraction {
  name: string;
  type: 'ride' | 'show' | 'experience' | 'meet';
  thrillLevel: 1 | 2 | 3 | 4 | 5;
  heightRequired?: string;
  mustDo: boolean;
  lightningLane?: boolean;
  tip?: string;
}

export interface ParkInfo {
  id: string;
  name: string;
  shortName: string;
  image: string;
  color: string;
  category: ParkCategory;
  categoryLabel: string;
  emoji: string;
  description: string;
  fullDescription: string;
  operatingHours: string;
  averageVisitTime: string;
  bestTimeToVisit: string;
  parkingCost: string;
  highlights: string[];
  tips: ParkTip[];
  topAttractions: ParkAttraction[];
  areas?: string[];
  specialEvents?: string[];
  diningTips?: string[];
  website: string;
}

export const PARK_INFO: ParkInfo[] = [
  // ===== DISNEY PARKS =====
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    shortName: 'MK',
    image: magicKingdomImg,
    color: 'from-blue-500 to-purple-600',
    category: 'disney',
    categoryLabel: 'Disney',
    emoji: '🏰',
    description: 'O parque mais icônico da Disney com o Castelo da Cinderela',
    fullDescription: 'O Magic Kingdom é o parque mais visitado do mundo e a essência da magia Disney. Com o icônico Castelo da Cinderela como centro, oferece atrações clássicas, shows espetaculares e encontros com personagens. É dividido em 6 áreas temáticas que transportam você para mundos mágicos diferentes.',
    operatingHours: '9h às 22h (varia por temporada)',
    averageVisitTime: '10-12 horas',
    bestTimeToVisit: 'Terças e Quartas são mais vazias. Evite segundas após feriados.',
    parkingCost: '$30 (Standard) / $50-60 (Preferred)',
    highlights: [
      'Castelo da Cinderela',
      'Space Mountain',
      'Splash Mountain',
      'Pirates of the Caribbean',
      'Happily Ever After (fogos)'
    ],
    tips: [
      {
        icon: '⏰',
        title: 'Chegue Cedo',
        description: 'Esteja no parque 30-45 min antes da abertura. As primeiras 2 horas têm filas menores.',
        type: 'tempo'
      },
      {
        icon: '🎆',
        title: 'Reserve Lugar para os Fogos',
        description: 'Escolha seu lugar 1 hora antes do Happily Ever After. Main Street ou em frente ao castelo são ideais.',
        type: 'dica'
      },
      {
        icon: '💡',
        title: 'Use o Multi Pass',
        description: 'Para atrações como Space Mountain, Big Thunder e Jungle Cruise, o Lightning Lane Multi Pass vale muito a pena.',
        type: 'dica'
      },
      {
        icon: '🍽️',
        title: 'Almoce às 11h ou 14h',
        description: 'Evite o horário de pico (12h-13h). Restaurantes ficam lotados nesse período.',
        type: 'economia'
      },
      {
        icon: '⚠️',
        title: 'Segundas são Lotadas',
        description: 'Muitos hotéis Disney têm check-out no domingo, então visitantes aproveitam a segunda.',
        type: 'alerta'
      },
      {
        icon: '🚂',
        title: 'Use o Trem',
        description: 'O Walt Disney World Railroad é ótimo para descansar e ver o parque de outro ângulo.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Space Mountain', type: 'ride', thrillLevel: 3, mustDo: true, lightningLane: true, tip: 'Vá na primeira hora ou use LL' },
      { name: 'Big Thunder Mountain', type: 'ride', thrillLevel: 3, heightRequired: '102cm', mustDo: true, lightningLane: true },
      { name: 'Pirates of the Caribbean', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Haunted Mansion', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true },
      { name: 'Seven Dwarfs Mine Train', type: 'ride', thrillLevel: 2, heightRequired: '97cm', mustDo: true, lightningLane: true, tip: 'Individual Lightning Lane - reserve cedo!' },
      { name: 'Tron Lightcycle Run', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true, lightningLane: true, tip: 'Virtual Queue às 7h ou Individual LL' },
    ],
    areas: ['Main Street U.S.A.', 'Adventureland', 'Frontierland', 'Liberty Square', 'Fantasyland', 'Tomorrowland'],
    specialEvents: ['Mickey\'s Not-So-Scary Halloween Party', 'Mickey\'s Very Merry Christmas Party'],
    diningTips: ['Be Our Guest (reserva obrigatória)', 'Dole Whip no Aloha Isle', 'Pecos Bill para porções grandes'],
    website: 'https://disneyworld.disney.go.com/destinations/magic-kingdom/'
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    shortName: 'EP',
    image: epcotImg,
    color: 'from-teal-500 to-blue-600',
    category: 'disney',
    categoryLabel: 'Disney',
    emoji: '🌍',
    description: 'Celebração de inovação, tecnologia e culturas do mundo',
    fullDescription: 'EPCOT (Experimental Prototype Community of Tomorrow) combina tecnologia futurista com a celebração de culturas do mundo inteiro. Dividido em World Celebration, World Discovery, World Nature e World Showcase, oferece experiências únicas, gastronomia internacional e algumas das atrações mais tecnológicas da Disney.',
    operatingHours: '9h às 21h (varia por temporada)',
    averageVisitTime: '8-10 horas',
    bestTimeToVisit: 'Evite durante Food & Wine Festival (out-nov) se não gosta de multidões.',
    parkingCost: '$30 (Standard) / $50-60 (Preferred)',
    highlights: [
      'Guardians of the Galaxy: Cosmic Rewind',
      'Test Track',
      'Frozen Ever After',
      'World Showcase (11 países)',
      'Luminous (show noturno)'
    ],
    tips: [
      {
        icon: '⏰',
        title: 'Chegue Cedo no Epcot',
        description: 'Vá direto para Test Track ou Frozen Ever After na abertura — as filas crescem rápido após 10h.',
        type: 'tempo'
      },
      {
        icon: '🍷',
        title: 'Explore o World Showcase',
        description: 'Cada país tem bebidas e comidas típicas. Chegue após 11h quando os pavilhões abrem.',
        type: 'dica'
      },
      {
        icon: '🎭',
        title: 'Shows nos Pavilhões',
        description: 'Não perca: Vozes de Liberty (América), Mariachi Cobre (México), Taiko (Japão).',
        type: 'dica'
      },
      {
        icon: '⏰',
        title: 'Frozen na Hora Certa',
        description: 'Vá para Frozen Ever After na primeira hora ou use Individual Lightning Lane.',
        type: 'tempo'
      },
      {
        icon: '🚶',
        title: 'Comece pelo Fundo',
        description: 'A maioria começa na entrada. Vá direto para Test Track ou World Showcase.',
        type: 'economia'
      },
      {
        icon: '📅',
        title: 'Festivals Especiais',
        description: 'Food & Wine (out-nov), Flower & Garden (mar-jul) e Festival of the Arts (jan-fev) são imperdíveis!',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Guardians of the Galaxy: Cosmic Rewind', type: 'ride', thrillLevel: 4, heightRequired: '107cm', mustDo: true, lightningLane: true, tip: 'Virtual Queue obrigatória!' },
      { name: 'Test Track', type: 'ride', thrillLevel: 3, heightRequired: '102cm', mustDo: true, lightningLane: true },
      { name: 'Frozen Ever After', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true },
      { name: 'Remy\'s Ratatouille Adventure', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true },
      { name: 'Soarin\' Around the World', type: 'ride', thrillLevel: 2, heightRequired: '102cm', mustDo: true, lightningLane: true },
    ],
    areas: ['World Celebration', 'World Discovery', 'World Nature', 'World Showcase'],
    specialEvents: ['EPCOT International Food & Wine Festival', 'EPCOT International Flower & Garden Festival', 'Festival of the Arts'],
    diningTips: ['La Hacienda de San Angel (México)', 'Le Cellier (Canadá)', 'Via Napoli (Itália)'],
    website: 'https://disneyworld.disney.go.com/destinations/epcot/'
  },
  {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    shortName: 'HS',
    image: hollywoodStudiosImg,
    color: 'from-red-500 to-pink-600',
    category: 'disney',
    categoryLabel: 'Disney',
    emoji: '🎬',
    description: 'O parque do cinema com Star Wars e Toy Story',
    fullDescription: 'Hollywood Studios é o parque da Disney dedicado ao cinema, TV e entretenimento. Abriga as incríveis áreas temáticas de Star Wars: Galaxy\'s Edge e Toy Story Land, além de atrações clássicas baseadas em filmes. É o parque com as atrações mais "radicais" da Disney World.',
    operatingHours: '8h às 21h (varia por temporada)',
    averageVisitTime: '8-10 horas',
    bestTimeToVisit: 'Segundas e sextas costumam ser menos lotadas.',
    parkingCost: '$30 (Standard) / $50-60 (Preferred)',
    highlights: [
      'Star Wars: Rise of the Resistance',
      'Tower of Terror',
      'Slinky Dog Dash',
      'Mickey & Minnie\'s Runaway Railway',
      'Millennium Falcon: Smugglers Run'
    ],
    tips: [
      {
        icon: '🚀',
        title: 'Rise of the Resistance',
        description: 'A melhor atração da Disney! Use Individual Lightning Lane ou chegue bem cedo.',
        type: 'alerta'
      },
      {
        icon: '🤠',
        title: 'Toy Story Land',
        description: 'Área muito fotogênica! Vá no início da manhã ou final da tarde para fotos sem multidão.',
        type: 'dica'
      },
      {
        icon: '⚡',
        title: 'Tower of Terror',
        description: 'Filas menores no final do dia. Se tiver medo de queda, sente na fileira do meio.',
        type: 'dica'
      },
      {
        icon: '🍹',
        title: 'Oga\'s Cantina',
        description: 'O bar de Star Wars! Reserva obrigatória via app. Tente às 7h no dia da visita.',
        type: 'dica'
      },
      {
        icon: '🏃',
        title: 'Estratégia de Corda',
        description: 'Na abertura, vá direto para Slinky Dog Dash OU Rise of the Resistance (se não tiver LL).',
        type: 'tempo'
      },
      {
        icon: '🌙',
        title: 'Galaxy\'s Edge à Noite',
        description: 'A área de Star Wars fica ainda mais mágica à noite com as luzes especiais.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Star Wars: Rise of the Resistance', type: 'ride', thrillLevel: 3, heightRequired: '102cm', mustDo: true, lightningLane: true, tip: 'A MELHOR atração da Disney World!' },
      { name: 'Tower of Terror', type: 'ride', thrillLevel: 4, heightRequired: '102cm', mustDo: true, lightningLane: true },
      { name: 'Slinky Dog Dash', type: 'ride', thrillLevel: 2, heightRequired: '97cm', mustDo: true, lightningLane: true },
      { name: 'Mickey & Minnie\'s Runaway Railway', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true },
      { name: 'Rock \'n\' Roller Coaster', type: 'ride', thrillLevel: 5, heightRequired: '122cm', mustDo: true, lightningLane: true },
    ],
    areas: ['Hollywood Boulevard', 'Echo Lake', 'Grand Avenue', 'Star Wars: Galaxy\'s Edge', 'Toy Story Land', 'Animation Courtyard'],
    diningTips: ['Woody\'s Lunch Box (Quick Service)', '50\'s Prime Time Café (experiência divertida)', 'Docking Bay 7 (Star Wars)'],
    website: 'https://disneyworld.disney.go.com/destinations/hollywood-studios/'
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    shortName: 'AK',
    image: animalKingdomImg,
    color: 'from-green-500 to-emerald-600',
    category: 'disney',
    categoryLabel: 'Disney',
    emoji: '🦁',
    description: 'Aventura na natureza com safári e Pandora',
    fullDescription: 'Animal Kingdom é o maior parque temático do mundo em área, combinando um zoológico de classe mundial com atrações emocionantes. A área de Pandora (Avatar) é simplesmente espetacular, especialmente à noite. O parque celebra a natureza e a vida selvagem com experiências únicas.',
    operatingHours: '8h às 20h (varia por temporada)',
    averageVisitTime: '6-8 horas',
    bestTimeToVisit: 'Chegue cedo para o Kilimanjaro Safaris - animais são mais ativos pela manhã.',
    parkingCost: '$30 (Standard) / $50-60 (Preferred)',
    highlights: [
      'Avatar Flight of Passage',
      'Kilimanjaro Safaris',
      'Expedition Everest',
      'Na\'vi River Journey',
      'Tree of Life'
    ],
    tips: [
      {
        icon: '🐘',
        title: 'Safári Matinal',
        description: 'Faça o Kilimanjaro Safaris na primeira hora! Animais estão mais ativos e visíveis.',
        type: 'tempo'
      },
      {
        icon: '🌟',
        title: 'Pandora à Noite',
        description: 'A área de Avatar BRILHA literalmente à noite. Volte após escurecer para fotos incríveis.',
        type: 'dica'
      },
      {
        icon: '⛰️',
        title: 'Everest: Fila Single',
        description: 'A Single Rider Line do Expedition Everest costuma ser bem mais rápida.',
        type: 'economia'
      },
      {
        icon: '🦜',
        title: 'Trilhas dos Animais',
        description: 'Maharajah Jungle Trek e Gorilla Falls têm animais incríveis e nenhuma fila!',
        type: 'dica'
      },
      {
        icon: '☀️',
        title: 'Use Protetor Solar',
        description: 'É o parque com menos sombra. Leve chapéu, óculos e protetor solar.',
        type: 'alerta'
      },
      {
        icon: '🎭',
        title: 'Festival of the Lion King',
        description: 'Um dos melhores shows da Disney! Reserve tempo para assistir.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Avatar Flight of Passage', type: 'ride', thrillLevel: 3, heightRequired: '112cm', mustDo: true, lightningLane: true, tip: 'Sensação de voar em um Banshee!' },
      { name: 'Kilimanjaro Safaris', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true, tip: 'Vá logo cedo!' },
      { name: 'Expedition Everest', type: 'ride', thrillLevel: 4, heightRequired: '112cm', mustDo: true, lightningLane: true },
      { name: 'Na\'vi River Journey', type: 'ride', thrillLevel: 1, mustDo: true, lightningLane: true },
      
    ],
    areas: ['Oasis', 'Discovery Island', 'Africa', 'Asia', 'DinoLand U.S.A.', 'Pandora – The World of Avatar'],
    diningTips: ['Satu\'li Canteen (Pandora - excelente!)', 'Flame Tree Barbecue', 'Yak & Yeti'],
    website: 'https://disneyworld.disney.go.com/destinations/animal-kingdom/'
  },

  // ===== UNIVERSAL PARKS =====
  {
    id: 'universal-studios',
    name: 'Universal Studios',
    shortName: 'USF',
    image: universalStudiosImg,
    color: 'from-yellow-500 to-orange-600',
    category: 'universal',
    categoryLabel: 'Universal',
    emoji: '🎥',
    description: 'A magia do cinema ganha vida com simuladores incríveis',
    fullDescription: 'Universal Studios Florida traz a magia de Hollywood para Orlando. Com atrações baseadas em grandes filmes e séries, oferece experiências imersivas como os mundos de Harry Potter, Springfield dos Simpsons e muito mais. As tecnologias de simulação 3D/4D são impressionantes.',
    operatingHours: '9h às 21h (varia por temporada)',
    averageVisitTime: '8-10 horas',
    bestTimeToVisit: 'Evite fins de semana e feriados. Terças e quartas são mais vazias.',
    parkingCost: '$30 (Standard) / $50-80 (Prime)',
    highlights: [
      'Harry Potter and the Escape from Gringotts',
      'Revenge of the Mummy',
      'Hollywood Rip Ride Rockit',
      'Transformers: The Ride',
      'Diagon Alley'
    ],
    tips: [
      {
        icon: '🧙',
        title: 'Diagon Alley Oculto',
        description: 'A entrada para Diagon Alley é escondida propositalmente. Procure a parede de tijolos!',
        type: 'dica'
      },
      {
        icon: '🎢',
        title: 'Rip Ride Rockit',
        description: 'Você escolhe a música! Há músicas secretas com códigos especiais.',
        type: 'dica'
      },
      {
        icon: '🚂',
        title: 'Hogwarts Express',
        description: 'O trem conecta os dois parques. A experiência é diferente em cada direção!',
        type: 'dica'
      },
      {
        icon: '🍺',
        title: 'Cerveja Amanteigada',
        description: 'Prove gelada ou frozen! Disponível em vários pontos de Diagon Alley.',
        type: 'dica'
      },
      {
        icon: '📱',
        title: 'App Universal',
        description: 'Baixe o app para ver tempos de fila em tempo real e usar Virtual Lines.',
        type: 'economia'
      },
      {
        icon: '🕒',
        title: 'Mummy no Final',
        description: 'Revenge of the Mummy tem fila menor no final do dia.',
        type: 'tempo'
      }
    ],
    topAttractions: [
      { name: 'Harry Potter and the Escape from Gringotts', type: 'ride', thrillLevel: 3, heightRequired: '107cm', mustDo: true },
      { name: 'Revenge of the Mummy', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true, tip: 'Montanha-russa indoor no escuro!' },
      { name: 'Hollywood Rip Ride Rockit', type: 'ride', thrillLevel: 5, heightRequired: '130cm', mustDo: true },
      { name: 'Transformers: The Ride 3D', type: 'ride', thrillLevel: 3, heightRequired: '102cm', mustDo: true },
      { name: 'E.T. Adventure', type: 'ride', thrillLevel: 1, mustDo: true, tip: 'Atração clássica e nostálgica!' },
    ],
    areas: ['Production Central', 'New York', 'San Francisco', 'The Wizarding World of Harry Potter – Diagon Alley', 'World Expo', 'Springfield U.S.A.', 'Woody Woodpecker\'s KidZone', 'Hollywood'],
    diningTips: ['Leaky Cauldron (Harry Potter)', 'Finnegan\'s Bar & Grill', 'Fast Food Boulevard (Simpsons)'],
    website: 'https://www.universalorlando.com/web/en/us/theme-parks/universal-studios-florida'
  },
  {
    id: 'islands-of-adventure',
    name: 'Islands of Adventure',
    shortName: 'IOA',
    image: islandsOfAdventureImg,
    color: 'from-orange-500 to-red-600',
    category: 'universal',
    categoryLabel: 'Universal',
    emoji: '🦖',
    description: 'Atrações radicais e o icônico Castelo de Hogwarts',
    fullDescription: 'Islands of Adventure é considerado um dos melhores parques temáticos do mundo. Com atrações de altíssima qualidade, inclui o incrível Castelo de Hogwarts, VelociCoaster, e a área do Jurassic World. É o parque com as montanhas-russas mais emocionantes da região.',
    operatingHours: '9h às 21h (varia por temporada)',
    averageVisitTime: '8-10 horas',
    bestTimeToVisit: 'Chegue na abertura para VelociCoaster e Hagrid\'s.',
    parkingCost: '$30 (Standard) / $50-80 (Prime)',
    highlights: [
      'VelociCoaster',
      'Hagrid\'s Magical Creatures Motorbike Adventure',
      'Harry Potter and the Forbidden Journey',
      'Jurassic World VelociCoaster',
      'Incredible Hulk Coaster'
    ],
    tips: [
      {
        icon: '🦕',
        title: 'VelociCoaster PRIMEIRO',
        description: 'Corra para o VelociCoaster na abertura. A fila cresce rapidamente ao longo do dia.',
        type: 'tempo'
      },
      {
        icon: '🏍️',
        title: 'Hagrid\'s Virtual Queue',
        description: 'Use Virtual Line via app quando disponível. É a atração mais concorrida!',
        type: 'alerta'
      },
      {
        icon: '🏰',
        title: 'Tour pelo Castelo',
        description: 'Mesmo sem ir na atração, faça o tour pelo castelo de Hogwarts. É impressionante!',
        type: 'dica'
      },
      {
        icon: '💚',
        title: 'Hulk no Final',
        description: 'A fila do Hulk diminui bastante após as 17h.',
        type: 'tempo'
      },
      {
        icon: '🎒',
        title: 'Lockers Obrigatórios',
        description: 'Várias atrações exigem deixar bolsas em lockers gratuitos. Planeje-se!',
        type: 'alerta'
      },
      {
        icon: '🍻',
        title: 'Three Broomsticks',
        description: 'O restaurante em Hogsmeade tem comida excelente e ambiente imersivo.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'VelociCoaster', type: 'ride', thrillLevel: 5, heightRequired: '130cm', mustDo: true, tip: 'A MELHOR montanha-russa da Flórida!' },
      { name: 'Hagrid\'s Magical Creatures Motorbike Adventure', type: 'ride', thrillLevel: 3, heightRequired: '122cm', mustDo: true },
      { name: 'Harry Potter and the Forbidden Journey', type: 'ride', thrillLevel: 3, heightRequired: '122cm', mustDo: true },
      { name: 'Incredible Hulk Coaster', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true },
      { name: 'Jurassic World River Adventure', type: 'ride', thrillLevel: 3, heightRequired: '107cm', mustDo: true, tip: 'Você VAI se molhar!' },
    ],
    areas: ['Port of Entry', 'Marvel Super Hero Island', 'Toon Lagoon', 'Skull Island', 'Jurassic Park', 'The Wizarding World of Harry Potter – Hogsmeade', 'The Lost Continent', 'Seuss Landing'],
    diningTips: ['Three Broomsticks (Harry Potter)', 'Mythos Restaurant (premiado!)', 'Confisco Grille'],
    website: 'https://www.universalorlando.com/web/en/us/theme-parks/islands-of-adventure'
  },
  {
    id: 'epic-universe',
    name: 'Epic Universe',
    shortName: 'EU',
    image: epicUniverseImg,
    color: 'from-indigo-500 to-purple-600',
    category: 'universal',
    categoryLabel: 'Universal',
    emoji: '✨',
    description: 'O novo mega parque da Universal com mundos revolucionários',
    fullDescription: 'Epic Universe é o mais novo e ambicioso parque da Universal, inaugurado em 2025. Com tecnologias de ponta, inclui mundos imersivos de Super Nintendo, Dark Universe (monstros clássicos), How to Train Your Dragon e muito mais. É o parque temático mais inovador da atualidade.',
    operatingHours: '9h às 22h (varia por temporada)',
    averageVisitTime: '10-12 horas',
    bestTimeToVisit: 'Como é novo, todos os dias são movimentados. Vá durante a semana.',
    parkingCost: '$35 (Standard) / $55-85 (Prime)',
    highlights: [
      'Super Nintendo World',
      'Stardust Racers (montanha-russa dupla)',
      'Harry Potter Ministry of Magic',
      'How to Train Your Dragon área',
      'Dark Universe'
    ],
    tips: [
      {
        icon: '🎮',
        title: 'Power-Up Band',
        description: 'Compre a pulseira interativa para participar das experiências de Mario!',
        type: 'dica'
      },
      {
        icon: '🏎️',
        title: 'Mario Kart',
        description: 'A atração mais concorrida! Use Virtual Queue ou vá na abertura.',
        type: 'tempo'
      },
      {
        icon: '🧹',
        title: 'Novo Mundo HP',
        description: 'O Ministério da Magia traz uma experiência completamente nova de Harry Potter.',
        type: 'dica'
      },
      {
        icon: '🌙',
        title: 'Dark Universe à Noite',
        description: 'A área dos monstros fica ainda mais atmosférica depois do pôr do sol.',
        type: 'dica'
      },
      {
        icon: '📱',
        title: 'App é Essencial',
        description: 'Virtual Queues e reservas são gerenciadas pelo app. Baixe antes!',
        type: 'alerta'
      },
      {
        icon: '🐉',
        title: 'Dragon Flying',
        description: 'A área de Como Treinar seu Dragão tem voos de dragão incríveis!',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Mario Kart: Bowser\'s Challenge', type: 'ride', thrillLevel: 2, heightRequired: '107cm', mustDo: true, tip: 'Experiência de RA revolucionária!' },
      { name: 'Stardust Racers', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true, tip: 'Duas montanhas-russas que competem!' },
      { name: 'Harry Potter and the Battle at the Ministry', type: 'ride', thrillLevel: 3, heightRequired: '107cm', mustDo: true },
      { name: 'Donkey Kong Mine Cart Madness', type: 'ride', thrillLevel: 3, heightRequired: '107cm', mustDo: true },
      { name: 'How to Train Your Dragon Flight', type: 'ride', thrillLevel: 2, mustDo: true },
    ],
    areas: ['Celestial Park (hub central)', 'Super Nintendo World', 'The Wizarding World of Harry Potter – Ministry of Magic', 'How to Train Your Dragon – Isle of Berk', 'Dark Universe'],
    diningTips: ['Toadstool Cafe (Super Nintendo)', 'Isle of Berk dining', 'Celestial Park restaurants'],
    website: 'https://www.universalorlando.com/web/en/us/theme-parks/epic-universe'
  },

  // ===== SEAWORLD PARKS =====
  {
    id: 'seaworld',
    name: 'SeaWorld Orlando',
    shortName: 'SW',
    image: seaworldImg,
    color: 'from-blue-600 to-cyan-500',
    category: 'seaworld',
    categoryLabel: 'SeaWorld',
    emoji: '🐋',
    description: 'Mundo marinho com shows e montanhas-russas incríveis',
    fullDescription: 'SeaWorld Orlando combina a experiência de um parque marinho com montanhas-russas de classe mundial. Oferece shows com animais marinhos, encontros com golfinhos e focas, aquários impressionantes e algumas das melhores montanhas-russas da Flórida, como Mako, Kraken e Pipeline.',
    operatingHours: '10h às 18h (varia por temporada)',
    averageVisitTime: '6-8 horas',
    bestTimeToVisit: 'Evite fins de semana. Dias de semana são muito mais tranquilos.',
    parkingCost: '$30 (Standard) / $35-50 (Preferred)',
    highlights: [
      'Mako (montanha-russa hyper)',
      'Pipeline: The Surf Coaster',
      'Kraken',
      'Manta',
      'Shows com Golfinhos e Orcas'
    ],
    tips: [
      {
        icon: '🎢',
        title: 'Mako e Pipeline Primeiro',
        description: 'As montanhas-russas ficam com filas menores nas primeiras 2 horas.',
        type: 'tempo'
      },
      {
        icon: '🐬',
        title: 'Shows Têm Horários',
        description: 'Verifique o app para os horários dos shows. Chegue 15 min antes para bons lugares.',
        type: 'alerta'
      },
      {
        icon: '💦',
        title: 'Você VAI se molhar',
        description: 'Journey to Atlantis e Infinity Falls garantem que você saia encharcado!',
        type: 'alerta'
      },
      {
        icon: '🐧',
        title: 'Antarctica',
        description: 'A área dos pinguins tem ar-condicionado GELADO. Ótimo para se refrescar!',
        type: 'dica'
      },
      {
        icon: '💰',
        title: 'Quick Queue',
        description: 'Vale a pena em dias cheios. Dá acesso ilimitado às atrações principais.',
        type: 'economia'
      },
      {
        icon: '🍴',
        title: 'All-Day Dining Deal',
        description: 'Se vai ficar o dia todo, o plano de alimentação ilimitada compensa.',
        type: 'economia'
      }
    ],
    topAttractions: [
      { name: 'Mako', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true, tip: 'A mais rápida e alta da Flórida!' },
      { name: 'Pipeline: The Surf Coaster', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true, tip: 'Única do tipo no mundo!' },
      { name: 'Kraken Unleashed', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true },
      { name: 'Manta', type: 'ride', thrillLevel: 4, heightRequired: '137cm', mustDo: true, tip: 'Você voa como uma arraia!' },
      { name: 'Journey to Atlantis', type: 'ride', thrillLevel: 3, heightRequired: '107cm', mustDo: true, tip: 'Combo de dark ride e água!' },
    ],
    areas: ['Sea of Legends', 'Sea of Shallows', 'Sea of Ice', 'Sea of Delight', 'Sea of Mystery', 'Sea of Fun'],
    diningTips: ['Sharks Underwater Grill (jantar com tubarões!)', 'Voyager\'s Smokehouse', 'Mama\'s Pretzel Kitchen'],
    website: 'https://seaworld.com/orlando/'
  },
  {
    id: 'busch-gardens',
    name: 'Busch Gardens Tampa',
    shortName: 'BG',
    image: buschGardensImg,
    color: 'from-orange-600 to-red-500',
    category: 'seaworld',
    categoryLabel: 'SeaWorld Parks',
    emoji: '🎢',
    description: 'O paraíso das montanhas-russas com safári africano',
    fullDescription: 'Busch Gardens Tampa Bay é o destino definitivo para amantes de montanhas-russas. Com 10+ coasters de classe mundial, incluindo SheiKra, Cheetah Hunt e Iron Gwazi, também oferece um safári africano com animais em habitat natural. Fica a ~1h de Orlando.',
    operatingHours: '10h às 18h (varia por temporada)',
    averageVisitTime: '8-10 horas',
    bestTimeToVisit: 'Dias de semana. Evite época de férias escolares americanas.',
    parkingCost: '$30 (Standard) / $35-50 (Preferred)',
    highlights: [
      'Iron Gwazi (RMC hybrid)',
      'SheiKra (dive coaster)',
      'Cheetah Hunt',
      'Serengeti Safari',
      'Tigris'
    ],
    tips: [
      {
        icon: '🎢',
        title: 'Iron Gwazi Essencial',
        description: 'A melhor montanha-russa da Flórida! Vá logo na abertura.',
        type: 'tempo'
      },
      {
        icon: '🚗',
        title: '1 Hora de Orlando',
        description: 'Planeje chegar cedo. O trajeto de Orlando leva cerca de 1 hora.',
        type: 'alerta'
      },
      {
        icon: '🦁',
        title: 'Safári pela Manhã',
        description: 'Os animais estão mais ativos nas primeiras horas. Faça o Serengeti Safari cedo.',
        type: 'dica'
      },
      {
        icon: '☀️',
        title: 'Leve Protetor Solar',
        description: 'O parque tem muitas áreas ao ar livre. Proteja-se do sol!',
        type: 'alerta'
      },
      {
        icon: '💦',
        title: 'Congo River Rapids',
        description: 'Atração aquática que MOLHA muito. Guarde para o final ou leve roupa extra.',
        type: 'dica'
      },
      {
        icon: '🍺',
        title: 'Cerveja Gratuita',
        description: 'Adultos ganham 2 cervejas gratuitas por dia no parque!',
        type: 'economia'
      }
    ],
    topAttractions: [
      { name: 'Iron Gwazi', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true, tip: 'A MELHOR montanha-russa da Flórida!' },
      { name: 'SheiKra', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true, tip: 'Queda de 90 graus!' },
      { name: 'Cheetah Hunt', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true },
      { name: 'Montu', type: 'ride', thrillLevel: 5, heightRequired: '137cm', mustDo: true },
      { name: 'Serengeti Safari', type: 'experience', thrillLevel: 1, mustDo: true },
    ],
    areas: ['Morocco', 'Egypt', 'Nairobi', 'Congo', 'Stanleyville', 'Jungala', 'Pantopia', 'Sesame Street Safari of Fun'],
    diningTips: ['Dragon Fire Grill', 'Zambia Smokehouse', 'Serengeti Overlook'],
    website: 'https://buschgardens.com/tampa/'
  },

  // ===== OTHER PARKS =====
  {
    id: 'legoland',
    name: 'LEGOLAND Florida',
    shortName: 'LL',
    image: legolandImg,
    color: 'from-yellow-500 to-red-500',
    category: 'other',
    categoryLabel: 'Família',
    emoji: '🧱',
    description: 'O mundo LEGO perfeito para crianças de 2-12 anos',
    fullDescription: 'LEGOLAND Florida é o parque ideal para famílias com crianças de 2 a 12 anos. Com mais de 50 atrações, shows e experiências, tudo é construído para os pequenos aproveitarem. Inclui Miniland USA com réplicas de cidades americanas em LEGO, montanhas-russas infantis e áreas interativas.',
    operatingHours: '10h às 18h (varia por temporada)',
    averageVisitTime: '6-8 horas',
    bestTimeToVisit: 'Dias de semana fora de férias escolares. O parque é bem menos cheio.',
    parkingCost: '$30 (Standard)',
    highlights: [
      'Miniland USA',
      'The Dragon Coaster',
      'LEGO Ninjago',
      'Pirate River Quest',
      'LEGO Movie World'
    ],
    tips: [
      {
        icon: '👶',
        title: 'Idade Ideal: 2-12',
        description: 'O parque é projetado para crianças. Adolescentes podem achar "infantil".',
        type: 'alerta'
      },
      {
        icon: '🧱',
        title: 'Miniland é Incrível',
        description: 'Tire tempo para ver todas as cidades em LEGO. São milhões de peças!',
        type: 'dica'
      },
      {
        icon: '💦',
        title: 'Parque Aquático Separado',
        description: 'LEGOLAND Water Park é pago separadamente. Combo vale a pena no verão.',
        type: 'economia'
      },
      {
        icon: '🚗',
        title: '45 min de Orlando',
        description: 'O parque fica em Winter Haven. Planeje o tempo de deslocamento.',
        type: 'alerta'
      },
      {
        icon: '🎢',
        title: 'The Dragon',
        description: 'A montanha-russa principal é perfeita para primeira experiência de coaster.',
        type: 'dica'
      },
      {
        icon: '🛍️',
        title: 'Compre LEGO no Parque',
        description: 'Preços são similares às lojas, mas a experiência de escolher é melhor!',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'The Dragon', type: 'ride', thrillLevel: 2, heightRequired: '102cm', mustDo: true },
      { name: 'LEGO Ninjago The Ride', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Pirate River Quest', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'The Great LEGO Race VR', type: 'ride', thrillLevel: 2, heightRequired: '102cm', mustDo: true },
      { name: 'Miniland USA', type: 'experience', thrillLevel: 1, mustDo: true },
    ],
    areas: ['The Beginning', 'Fun Town', 'LEGO Kingdoms', 'Land of Adventure', 'LEGO City', 'Pirate\'s Cove', 'Miniland USA', 'LEGO Technic', 'LEGO Ninjago World', 'THE LEGO MOVIE WORLD'],
    diningTips: ['Brick\'s Family Restaurant', 'Fun Town Pizza & Pasta', 'Granny\'s Apple Fries'],
    website: 'https://www.legoland.com/florida/'
  },
  {
    id: 'aquatica',
    name: 'Aquatica Orlando',
    shortName: 'AQ',
    image: aquaticaImg,
    color: 'from-cyan-400 to-blue-500',
    category: 'waterpark',
    categoryLabel: 'Parque Aquático',
    emoji: '🌊',
    description: 'Parque aquático do SeaWorld com tobogãs e lazy rivers',
    fullDescription: 'Aquatica é o parque aquático do SeaWorld, combinando emoção e relaxamento. Com tobogãs radicais, lazy rivers, piscinas de ondas e encontros com vida marinha, é uma opção perfeita para dias quentes. Menos lotado que os parques aquáticos da Disney.',
    operatingHours: '10h às 17h (varia por temporada)',
    averageVisitTime: '5-7 horas',
    bestTimeToVisit: 'Dias de semana são muito menos cheios. Evite feriados.',
    parkingCost: '$25 (Standard)',
    highlights: [
      'Riptide Race',
      'Ihu\'s Breakaway Falls',
      'Roa\'s Rapids',
      'Dolphin Plunge',
      'Loggerhead Lane'
    ],
    tips: [
      {
        icon: '☀️',
        title: 'Chegue na Abertura',
        description: 'As primeiras 2 horas são mais tranquilas e a água ainda está limpa.',
        type: 'tempo'
      },
      {
        icon: '🏖️',
        title: 'Reserve Cabana',
        description: 'As cabanas privativas dão sombra e acesso exclusivo. Reserve online!',
        type: 'dica'
      },
      {
        icon: '👟',
        title: 'Use Aqua Socks',
        description: 'O chão pode ficar muito quente. Sapatos de água ajudam muito.',
        type: 'alerta'
      },
      {
        icon: '🐬',
        title: 'Dolphin Plunge',
        description: 'O tobogã passa por aquário com golfinhos (Commerson\'s dolphins)!',
        type: 'dica'
      },
      {
        icon: '🌴',
        title: 'Loggerhead Lane',
        description: 'O lazy river passa por aquário com peixes tropicais. Relaxante!',
        type: 'dica'
      },
      {
        icon: '💰',
        title: 'Combo com SeaWorld',
        description: 'Ingressos combo com SeaWorld têm melhor custo-benefício.',
        type: 'economia'
      }
    ],
    topAttractions: [
      { name: 'Riptide Race', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true },
      { name: 'Ihu\'s Breakaway Falls', type: 'ride', thrillLevel: 5, heightRequired: '122cm', mustDo: true, tip: 'Queda livre de 24m!' },
      { name: 'Dolphin Plunge', type: 'ride', thrillLevel: 3, heightRequired: '122cm', mustDo: true },
      { name: 'Roa\'s Rapids', type: 'ride', thrillLevel: 2, mustDo: true, tip: 'Lazy river radical!' },
      { name: 'Loggerhead Lane', type: 'ride', thrillLevel: 1, mustDo: true },
    ],
    website: 'https://aquatica.com/orlando/'
  },
  {
    id: 'discovery-cove',
    name: 'Discovery Cove',
    shortName: 'DC',
    image: discoveryCoveImg,
    color: 'from-teal-400 to-emerald-500',
    category: 'seaworld',
    categoryLabel: 'SeaWorld Parks',
    emoji: '🐬',
    description: 'Resort exclusivo all-inclusive com nado com golfinhos',
    fullDescription: 'Discovery Cove é uma experiência resort exclusiva com número limitado de visitantes por dia. Inclui nado com golfinhos, snorkeling em recife tropical, praia de areia branca e alimentação all-inclusive. É o parque mais caro de Orlando, mas oferece uma experiência única e relaxante.',
    operatingHours: '7h às 17h30',
    averageVisitTime: '7-8 horas',
    bestTimeToVisit: 'Qualquer dia - a lotação é sempre limitada e controlada.',
    parkingCost: 'Incluído no ingresso',
    highlights: [
      'Dolphin Swim Experience',
      'Grand Reef (snorkeling)',
      'Wind-Away River',
      'Serenity Bay',
      'Freshwater Oasis'
    ],
    tips: [
      {
        icon: '💰',
        title: 'Preço Premium',
        description: 'É o parque mais caro (~$300-500/pessoa), mas TUDO está incluído.',
        type: 'alerta'
      },
      {
        icon: '🐬',
        title: 'Nado com Golfinho',
        description: 'A experiência principal dura ~30 min em grupos pequenos. Inesquecível!',
        type: 'dica'
      },
      {
        icon: '🍹',
        title: 'All-Inclusive Real',
        description: 'Comidas, bebidas (incluindo alcoólicas), snorkel, toalhas - TUDO incluído!',
        type: 'economia'
      },
      {
        icon: '📷',
        title: 'Fotos Caras',
        description: 'Pacote de fotos é cobrado à parte. Decida antes se quer comprar.',
        type: 'alerta'
      },
      {
        icon: '🎫',
        title: 'Combo com SeaWorld',
        description: 'O ingresso dá acesso ao SeaWorld por 14 dias! Aproveite.',
        type: 'economia'
      },
      {
        icon: '☀️',
        title: 'Protetor Solar Especial',
        description: 'Use apenas protetor solar fornecido pelo parque (protege os animais).',
        type: 'alerta'
      }
    ],
    topAttractions: [
      { name: 'Dolphin Swim Experience', type: 'experience', thrillLevel: 1, mustDo: true, tip: 'A experiência principal!' },
      { name: 'Grand Reef', type: 'experience', thrillLevel: 1, mustDo: true, tip: 'Snorkeling com raias e tubarões!' },
      { name: 'Wind-Away River', type: 'ride', thrillLevel: 1, mustDo: true },
      { name: 'Serenity Bay', type: 'experience', thrillLevel: 1, mustDo: true },
      { name: 'Freshwater Oasis', type: 'experience', thrillLevel: 1, mustDo: true },
    ],
    website: 'https://discoverycove.com/'
  },

  // ===== DISNEY WATER PARKS =====
  {
    id: 'blizzard-beach',
    name: 'Disney\'s Blizzard Beach',
    shortName: 'BB',
    image: blizzardBeachImg,
    color: 'from-sky-400 to-blue-500',
    category: 'waterpark',
    categoryLabel: 'Disney Water Park',
    emoji: '❄️',
    description: 'Parque aquático temático de estação de ski derretida',
    fullDescription: 'Blizzard Beach conta a história de uma estação de ski na Flórida que derreteu, criando um parque aquático único. Com o Summit Plummet (um dos tobogãs mais altos do mundo) e várias atrações para toda família, combina tematização Disney com adrenalina.',
    operatingHours: '10h às 18h (varia por temporada)',
    averageVisitTime: '5-7 horas',
    bestTimeToVisit: 'Dias de semana e fora de férias escolares.',
    parkingCost: 'Gratuito para hóspedes Disney / $30 outros',
    highlights: [
      'Summit Plummet',
      'Teamboat Springs',
      'Cross Country Creek',
      'Ski Patrol Training Camp',
      'Melt-Away Bay'
    ],
    tips: [
      {
        icon: '⛷️',
        title: 'Summit Plummet',
        description: 'Queda de 36m quase vertical! Só para corajosos. Fila anda rápido.',
        type: 'dica'
      },
      {
        icon: '👨‍👩‍👧‍👦',
        title: 'Teamboat Springs',
        description: 'O maior tobogã de boia familiar do mundo! Perfeito para grupos.',
        type: 'dica'
      },
      {
        icon: '🏖️',
        title: 'Cadeiras Limitadas',
        description: 'Chegue cedo para garantir cadeiras com sombra.',
        type: 'tempo'
      },
      {
        icon: '🎫',
        title: 'Ingresso Separado',
        description: 'Parques aquáticos Disney requerem ingresso próprio ou add-on.',
        type: 'alerta'
      },
      {
        icon: '🌊',
        title: 'Melt-Away Bay',
        description: 'A piscina de ondas é menor que Typhoon Lagoon, mas mais relaxante.',
        type: 'dica'
      },
      {
        icon: '👶',
        title: 'Tike\'s Peak',
        description: 'Área exclusiva para crianças pequenas. Super segura e divertida.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Summit Plummet', type: 'ride', thrillLevel: 5, heightRequired: '122cm', mustDo: true, tip: '36m de queda livre!' },
      { name: 'Teamboat Springs', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Slush Gusher', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true },
      { name: 'Downhill Double Dipper', type: 'ride', thrillLevel: 3, heightRequired: '122cm', mustDo: true },
      { name: 'Cross Country Creek', type: 'ride', thrillLevel: 1, mustDo: true },
    ],
    website: 'https://disneyworld.disney.go.com/destinations/blizzard-beach/'
  },
  {
    id: 'typhoon-lagoon',
    name: 'Disney\'s Typhoon Lagoon',
    shortName: 'TL',
    image: typhoonLagoonImg,
    color: 'from-amber-400 to-orange-500',
    category: 'waterpark',
    categoryLabel: 'Disney Water Park',
    emoji: '🌴',
    description: 'Parque aquático tropical com a maior piscina de ondas',
    fullDescription: 'Typhoon Lagoon é tematizado como uma vila tropical devastada por um tufão. Destaque para a maior piscina de ondas do mundo, que produz ondas de até 2 metros. Oferece uma experiência mais relaxante e familiar que Blizzard Beach.',
    operatingHours: '10h às 18h (varia por temporada)',
    averageVisitTime: '5-7 horas',
    bestTimeToVisit: 'Dias de semana. Evite quando apenas um parque aquático está aberto.',
    parkingCost: 'Gratuito para hóspedes Disney / $30 outros',
    highlights: [
      'Typhoon Lagoon Surf Pool',
      'Crush \'n\' Gusher',
      'Castaway Creek',
      'Miss Adventure Falls',
      'Shark Reef'
    ],
    tips: [
      {
        icon: '🌊',
        title: 'Ondas Gigantes',
        description: 'A piscina de ondas tem ondas a cada 90 segundos. Cuidado com crianças pequenas!',
        type: 'alerta'
      },
      {
        icon: '🦈',
        title: 'Shark Reef',
        description: 'Snorkeling com tubarões e raias reais! Equipamento incluído.',
        type: 'dica'
      },
      {
        icon: '🏄',
        title: 'Aulas de Surf',
        description: 'Antes do parque abrir, há aulas pagas de surf na piscina de ondas.',
        type: 'dica'
      },
      {
        icon: '🎢',
        title: 'Crush \'n\' Gusher',
        description: 'Montanha-russa aquática! Uma das melhores atrações.',
        type: 'dica'
      },
      {
        icon: '👨‍👩‍👧',
        title: 'Miss Adventure Falls',
        description: 'Atração familiar com bote. Ótima para todas as idades!',
        type: 'dica'
      },
      {
        icon: '🌴',
        title: 'Castaway Creek',
        description: 'Lazy river de 600m que dá a volta em todo o parque.',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Typhoon Lagoon Surf Pool', type: 'ride', thrillLevel: 2, mustDo: true, tip: 'Maior piscina de ondas do mundo!' },
      { name: 'Crush \'n\' Gusher', type: 'ride', thrillLevel: 3, heightRequired: '122cm', mustDo: true },
      { name: 'Miss Adventure Falls', type: 'ride', thrillLevel: 2, mustDo: true },
      { name: 'Shark Reef', type: 'experience', thrillLevel: 1, mustDo: true },
      { name: 'Castaway Creek', type: 'ride', thrillLevel: 1, mustDo: true },
    ],
    website: 'https://disneyworld.disney.go.com/destinations/typhoon-lagoon/'
  },
  {
    id: 'volcano-bay',
    name: 'Universal\'s Volcano Bay',
    shortName: 'VB',
    image: volcanoBayImg,
    color: 'from-orange-500 to-red-600',
    category: 'waterpark',
    categoryLabel: 'Universal Water Park',
    emoji: '🌋',
    description: 'Parque aquático tecnológico com vulcão central',
    fullDescription: 'Volcano Bay revolucionou os parques aquáticos com o TapuTapu - pulseira que guarda seu lugar na fila virtual enquanto você aproveita o parque. O vulcão Krakatau de 60m é o centro do parque, oferecendo tobogãs radicais, piscinas de ondas e lazy rivers.',
    operatingHours: '10h às 17h (varia por temporada)',
    averageVisitTime: '5-7 horas',
    bestTimeToVisit: 'Dias de semana. Verifique se o parque está aberto (fecha em dias de baixa demanda).',
    parkingCost: 'Usa estacionamento Universal ($30-50)',
    highlights: [
      'Krakatau Aqua Coaster',
      'Ko\'okiri Body Plunge',
      'Kala & Tai Nui Serpentine Body Slides',
      'Waturi Beach Wave Pool',
      'Kopiko Wai Winding River'
    ],
    tips: [
      {
        icon: '⌚',
        title: 'TapuTapu Essencial',
        description: 'A pulseira TapuTapu é sua chave para tudo. Reserve atrações virtualmente!',
        type: 'dica'
      },
      {
        icon: '🌋',
        title: 'Ko\'okiri Body Plunge',
        description: 'Queda de 38m através do vulcão! Tobogã mais radical da Flórida.',
        type: 'alerta'
      },
      {
        icon: '🏝️',
        title: 'Cabanas Privativas',
        description: 'As cabanas têm TapuTapu próprio com prioridade nas filas!',
        type: 'dica'
      },
      {
        icon: '📱',
        title: 'Não Precisa do App',
        description: 'Diferente dos parques, aqui o TapuTapu faz tudo. Deixe o celular guardado.',
        type: 'economia'
      },
      {
        icon: '🎢',
        title: 'Aqua Coaster',
        description: 'Montanha-russa aquática que sobe E desce dentro do vulcão!',
        type: 'dica'
      },
      {
        icon: '🌙',
        title: 'Vulcão à Noite',
        description: 'Se ficar até o fim, veja o show de luzes no vulcão!',
        type: 'dica'
      }
    ],
    topAttractions: [
      { name: 'Krakatau Aqua Coaster', type: 'ride', thrillLevel: 4, heightRequired: '107cm', mustDo: true, tip: 'Montanha-russa aquática!' },
      { name: 'Ko\'okiri Body Plunge', type: 'ride', thrillLevel: 5, heightRequired: '122cm', mustDo: true, tip: 'Queda de 38m!' },
      { name: 'Kala & Tai Nui', type: 'ride', thrillLevel: 4, heightRequired: '122cm', mustDo: true },
      { name: 'Honu ika Moana', type: 'ride', thrillLevel: 3, mustDo: true },
      { name: 'Waturi Beach', type: 'ride', thrillLevel: 1, mustDo: true },
    ],
    website: 'https://www.universalorlando.com/web/en/us/theme-parks/volcano-bay'
  },
];

// Helper functions
export const getParksByCategory = (category: ParkCategory): ParkInfo[] => {
  return PARK_INFO.filter(park => park.category === category);
};

export const getParkById = (id: string): ParkInfo | undefined => {
  return PARK_INFO.find(park => park.id === id);
};

export const getCategories = (): { id: ParkCategory; label: string; count: number }[] => {
  const categories: ParkCategory[] = ['disney', 'universal', 'seaworld', 'other', 'waterpark'];
  const labels: Record<ParkCategory, string> = {
    disney: '🏰 Disney',
    universal: '🎥 Universal',
    seaworld: '🐋 SeaWorld',
    other: '🎢 Outros',
    waterpark: '🌊 Parques Aquáticos'
  };
  
  return categories.map(cat => ({
    id: cat,
    label: labels[cat],
    count: PARK_INFO.filter(p => p.category === cat).length
  }));
};

export const getAllParks = (): ParkInfo[] => PARK_INFO;
