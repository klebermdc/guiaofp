// Pre-defined itinerary templates for quick import

export interface TemplateItem {
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  item_name: string;
  item_type: 'park' | 'attraction' | 'restaurant' | 'shopping' | 'activity';
  category: string;
  color: string;
  icon: string;
  duration?: number;
  start_time?: string;
  notes?: string;
}

export interface TemplateDay {
  dayOffset: number; // 0 = first day, 1 = second day, etc.
  label: string;
  items: TemplateItem[];
}

export interface PlannerTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'disney' | 'universal' | 'shopping' | 'mixed' | 'relaxed';
  totalDays: number;
  difficulty: 'easy' | 'moderate' | 'intense';
  highlights: string[];
  days: TemplateDay[];
}

export const PLANNER_TEMPLATES: PlannerTemplate[] = [
  {
    id: 'magic-kingdom-1day',
    name: 'Magic Kingdom em 1 Dia',
    description: 'Roteiro otimizado para aproveitar o máximo do Magic Kingdom em um único dia',
    icon: '🏰',
    category: 'disney',
    totalDays: 1,
    difficulty: 'intense',
    highlights: ['Space Mountain', 'Seven Dwarfs Mine Train', 'Fogos às 21h'],
    days: [
      {
        dayOffset: 0,
        label: 'Magic Kingdom',
        items: [
          { time_slot: 'morning', item_name: 'Chegada no Magic Kingdom', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🏰', start_time: '08:00', notes: 'Chegue 30min antes da abertura' },
          { time_slot: 'morning', item_name: 'Seven Dwarfs Mine Train', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '⛏️', duration: 30, notes: 'Lightning Lane recomendado' },
          { time_slot: 'morning', item_name: 'Peter Pan\'s Flight', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '✨', duration: 25 },
          { time_slot: 'morning', item_name: 'Haunted Mansion', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '👻', duration: 20 },
          { time_slot: 'afternoon', item_name: 'Almoço - Be Our Guest', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️', start_time: '12:00', notes: 'Reserva recomendada' },
          { time_slot: 'afternoon', item_name: 'Space Mountain', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🚀', duration: 30 },
          { time_slot: 'afternoon', item_name: 'Tron Lightcycle Run', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏍️', duration: 30 },
          { time_slot: 'afternoon', item_name: 'Pirates of the Caribbean', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏴‍☠️', duration: 25 },
          { time_slot: 'evening', item_name: 'Jantar - Columbia Harbour House', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️', start_time: '18:00' },
          { time_slot: 'evening', item_name: 'Big Thunder Mountain', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏔️', duration: 25 },
          { time_slot: 'night', item_name: 'Happily Ever After (Fogos)', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎆', start_time: '21:00', notes: 'Posicione-se às 20:30' },
        ]
      }
    ]
  },
  {
    id: 'hollywood-studios-1day',
    name: 'Hollywood Studios em 1 Dia',
    description: 'Explore Star Wars, Toy Story Land e Tower of Terror em um dia épico',
    icon: '🎬',
    category: 'disney',
    totalDays: 1,
    difficulty: 'intense',
    highlights: ['Rise of the Resistance', 'Tower of Terror', 'Slinky Dog'],
    days: [
      {
        dayOffset: 0,
        label: 'Hollywood Studios',
        items: [
          { time_slot: 'morning', item_name: 'Chegada no Hollywood Studios', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎬', start_time: '08:00' },
          { time_slot: 'morning', item_name: 'Rise of the Resistance', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '⭐', duration: 45, notes: 'Lightning Lane Multi Pass!' },
          { time_slot: 'morning', item_name: 'Millennium Falcon', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🚀', duration: 30 },
          { time_slot: 'morning', item_name: 'Slinky Dog Dash', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🐕', duration: 30 },
          { time_slot: 'afternoon', item_name: 'Almoço - Docking Bay 7', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️', start_time: '12:30' },
          { time_slot: 'afternoon', item_name: 'Tower of Terror', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🗼', duration: 25 },
          { time_slot: 'afternoon', item_name: 'Rock \'n\' Roller Coaster', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🎸', duration: 25 },
          { time_slot: 'evening', item_name: 'Alien Swirling Saucers', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '👽', duration: 20 },
          { time_slot: 'evening', item_name: 'Toy Story Mania', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🎯', duration: 25 },
          { time_slot: 'night', item_name: 'Fantasmic!', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🌟', start_time: '20:00', notes: 'Chegue 45min antes' },
        ]
      }
    ]
  },
  {
    id: 'universal-2days',
    name: 'Universal Completa em 2 Dias',
    description: 'Conheça os dois parques Universal com calma e diversão',
    icon: '⚡',
    category: 'universal',
    totalDays: 2,
    difficulty: 'moderate',
    highlights: ['Hagrid\'s', 'Velocicoaster', 'Forbidden Journey'],
    days: [
      {
        dayOffset: 0,
        label: 'Islands of Adventure',
        items: [
          { time_slot: 'morning', item_name: 'Chegada em Islands of Adventure', item_type: 'activity', category: 'universal', color: '#7C3AED', icon: '🏝️', start_time: '09:00' },
          { time_slot: 'morning', item_name: 'Hagrid\'s Magical Creatures', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🧙', duration: 45 },
          { time_slot: 'morning', item_name: 'Forbidden Journey', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '⚡', duration: 30 },
          { time_slot: 'morning', item_name: 'VelociCoaster', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🦖', duration: 25 },
          { time_slot: 'afternoon', item_name: 'Almoço - Three Broomsticks', item_type: 'restaurant', category: 'universal', color: '#F97316', icon: '🍺', start_time: '12:30' },
          { time_slot: 'afternoon', item_name: 'Hulk Coaster', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '💚', duration: 20 },
          { time_slot: 'afternoon', item_name: 'Spider-Man', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🕷️', duration: 25 },
          { time_slot: 'evening', item_name: 'Hagrid\'s (segunda vez)', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🧙', duration: 45, notes: 'À noite é ainda melhor!' },
          { time_slot: 'night', item_name: 'Jantar no CityWalk', item_type: 'restaurant', category: 'universal', color: '#F97316', icon: '🍔', start_time: '20:00' },
        ]
      },
      {
        dayOffset: 1,
        label: 'Universal Studios',
        items: [
          { time_slot: 'morning', item_name: 'Chegada em Universal Studios', item_type: 'activity', category: 'universal', color: '#7C3AED', icon: '🎬', start_time: '09:00' },
          { time_slot: 'morning', item_name: 'Escape from Gringotts', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🏛️', duration: 35 },
          { time_slot: 'morning', item_name: 'Revenge of the Mummy', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🪬', duration: 25 },
          { time_slot: 'morning', item_name: 'Transformers', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🤖', duration: 20 },
          { time_slot: 'afternoon', item_name: 'Almoço - Leaky Cauldron', item_type: 'restaurant', category: 'universal', color: '#F97316', icon: '🍽️', start_time: '13:00' },
          { time_slot: 'afternoon', item_name: 'Hogwarts Express', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🚂', duration: 20, notes: 'Ida para Islands' },
          { time_slot: 'afternoon', item_name: 'Retorno via Hogwarts Express', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🚂', duration: 20 },
          { time_slot: 'evening', item_name: 'Men in Black', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🔫', duration: 20 },
          { time_slot: 'evening', item_name: 'Simpsons Ride', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '🍩', duration: 20 },
          { time_slot: 'night', item_name: 'Jantar - Toothsome', item_type: 'restaurant', category: 'universal', color: '#F97316', icon: '🍰', start_time: '19:30' },
        ]
      }
    ]
  },
  {
    id: 'outlets-day',
    name: 'Dia de Compras nos Outlets',
    description: 'Roteiro otimizado para os melhores outlets de Orlando',
    icon: '🛍️',
    category: 'shopping',
    totalDays: 1,
    difficulty: 'easy',
    highlights: ['Orlando Vineland', 'Orlando International', 'Florida Mall'],
    days: [
      {
        dayOffset: 0,
        label: 'Compras',
        items: [
          { time_slot: 'morning', item_name: 'Orlando Vineland Premium Outlets', item_type: 'shopping', category: 'outlet', color: '#A855F7', icon: '🛍️', start_time: '10:00', notes: 'Maior outlet de Orlando!' },
          { time_slot: 'afternoon', item_name: 'Almoço no Outlet', item_type: 'restaurant', category: 'restaurante', color: '#F97316', icon: '🍔', start_time: '13:00' },
          { time_slot: 'afternoon', item_name: 'Orlando International Premium Outlets', item_type: 'shopping', category: 'outlet', color: '#A855F7', icon: '🛍️', notes: 'Mais compacto, boas lojas' },
          { time_slot: 'evening', item_name: 'Target', item_type: 'shopping', category: 'supermarket', color: '#CC0000', icon: '🎯', notes: 'Eletrônicos e utilidades' },
          { time_slot: 'night', item_name: 'Jantar', item_type: 'restaurant', category: 'restaurante', color: '#F97316', icon: '🍽️', start_time: '19:00' },
        ]
      }
    ]
  },
  {
    id: 'disney-4days',
    name: 'Disney 4 Parques em 4 Dias',
    description: 'Um dia para cada parque Disney com ritmo confortável',
    icon: '✨',
    category: 'disney',
    totalDays: 4,
    difficulty: 'moderate',
    highlights: ['Magic Kingdom', 'EPCOT', 'Hollywood Studios', 'Animal Kingdom'],
    days: [
      {
        dayOffset: 0,
        label: 'Magic Kingdom',
        items: [
          { time_slot: 'morning', item_name: 'Magic Kingdom', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🏰', start_time: '09:00' },
          { time_slot: 'morning', item_name: 'Seven Dwarfs Mine Train', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '⛏️' },
          { time_slot: 'morning', item_name: 'Space Mountain', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🚀' },
          { time_slot: 'afternoon', item_name: 'Almoço', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️', start_time: '12:30' },
          { time_slot: 'afternoon', item_name: 'Tron Lightcycle Run', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏍️' },
          { time_slot: 'evening', item_name: 'Pirates of the Caribbean', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏴‍☠️' },
          { time_slot: 'night', item_name: 'Happily Ever After', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎆', start_time: '21:00' },
        ]
      },
      {
        dayOffset: 1,
        label: 'EPCOT',
        items: [
          { time_slot: 'morning', item_name: 'EPCOT', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🌍', start_time: '09:00' },
          { time_slot: 'morning', item_name: 'Guardians of the Galaxy', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🎧' },
          { time_slot: 'morning', item_name: 'Test Track', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏎️' },
          { time_slot: 'afternoon', item_name: 'World Showcase - Almoço', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️' },
          { time_slot: 'afternoon', item_name: 'Remy\'s Ratatouille', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🐀' },
          { time_slot: 'evening', item_name: 'Frozen Ever After', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '❄️' },
          { time_slot: 'night', item_name: 'Luminous', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎆', start_time: '21:00' },
        ]
      },
      {
        dayOffset: 2,
        label: 'Hollywood Studios',
        items: [
          { time_slot: 'morning', item_name: 'Hollywood Studios', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎬', start_time: '09:00' },
          { time_slot: 'morning', item_name: 'Rise of the Resistance', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '⭐' },
          { time_slot: 'morning', item_name: 'Slinky Dog Dash', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🐕' },
          { time_slot: 'afternoon', item_name: 'Almoço', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️' },
          { time_slot: 'afternoon', item_name: 'Tower of Terror', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🗼' },
          { time_slot: 'evening', item_name: 'Millennium Falcon', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🚀' },
          { time_slot: 'night', item_name: 'Fantasmic!', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🌟', start_time: '20:00' },
        ]
      },
      {
        dayOffset: 3,
        label: 'Animal Kingdom',
        items: [
          { time_slot: 'morning', item_name: 'Animal Kingdom', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🦁', start_time: '08:00' },
          { time_slot: 'morning', item_name: 'Flight of Passage', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🐉' },
          { time_slot: 'morning', item_name: 'Na\'vi River Journey', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🛶' },
          { time_slot: 'afternoon', item_name: 'Kilimanjaro Safaris', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🦒' },
          { time_slot: 'afternoon', item_name: 'Almoço - Satu\'li Canteen', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️' },
          { time_slot: 'evening', item_name: 'Expedition Everest', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🏔️' },
          { time_slot: 'night', item_name: 'Disney Springs', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🛍️', notes: 'Compras e jantar' },
        ]
      }
    ]
  },
  {
    id: 'relaxed-week',
    name: 'Semana Relaxada (5 Dias)',
    description: 'Roteiro equilibrado com parques, compras e descanso',
    icon: '🌴',
    category: 'relaxed',
    totalDays: 5,
    difficulty: 'easy',
    highlights: ['2 Disney', '1 Universal', 'Compras', 'Dia livre'],
    days: [
      {
        dayOffset: 0,
        label: 'Chegada e Compras',
        items: [
          { time_slot: 'afternoon', item_name: 'Walmart Supercenter', item_type: 'shopping', category: 'supermarket', color: '#0066CC', icon: '🛒', notes: 'Compras iniciais' },
          { time_slot: 'evening', item_name: 'Jantar tranquilo', item_type: 'restaurant', category: 'restaurante', color: '#F97316', icon: '🍽️' },
          { time_slot: 'night', item_name: 'Descanso no hotel', item_type: 'activity', category: 'atividade', color: '#14B8A6', icon: '🏨' },
        ]
      },
      {
        dayOffset: 1,
        label: 'Magic Kingdom',
        items: [
          { time_slot: 'morning', item_name: 'Magic Kingdom', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🏰', start_time: '09:00' },
          { time_slot: 'afternoon', item_name: 'Atrações favoritas', item_type: 'attraction', category: 'disney', color: '#1E40AF', icon: '🎢' },
          { time_slot: 'evening', item_name: 'Jantar no parque', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️' },
          { time_slot: 'night', item_name: 'Fogos e retorno', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎆' },
        ]
      },
      {
        dayOffset: 2,
        label: 'Universal Studios',
        items: [
          { time_slot: 'morning', item_name: 'Universal Studios', item_type: 'activity', category: 'universal', color: '#7C3AED', icon: '🎬', start_time: '09:00' },
          { time_slot: 'afternoon', item_name: 'Harry Potter e atrações', item_type: 'attraction', category: 'universal', color: '#7C3AED', icon: '⚡' },
          { time_slot: 'evening', item_name: 'CityWalk', item_type: 'activity', category: 'universal', color: '#7C3AED', icon: '🎉' },
        ]
      },
      {
        dayOffset: 3,
        label: 'Outlets',
        items: [
          { time_slot: 'morning', item_name: 'Dia de descanso matinal', item_type: 'activity', category: 'atividade', color: '#14B8A6', icon: '😴', notes: 'Durma até mais tarde' },
          { time_slot: 'afternoon', item_name: 'Orlando Premium Outlets', item_type: 'shopping', category: 'outlet', color: '#A855F7', icon: '🛍️' },
          { time_slot: 'evening', item_name: 'Florida Mall', item_type: 'shopping', category: 'mall', color: '#EC4899', icon: '🏬' },
        ]
      },
      {
        dayOffset: 4,
        label: 'EPCOT',
        items: [
          { time_slot: 'morning', item_name: 'EPCOT', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🌍', start_time: '10:00' },
          { time_slot: 'afternoon', item_name: 'World Showcase', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🗺️' },
          { time_slot: 'evening', item_name: 'Jantar temático', item_type: 'restaurant', category: 'disney', color: '#F97316', icon: '🍽️' },
          { time_slot: 'night', item_name: 'Show noturno', item_type: 'activity', category: 'disney', color: '#1E40AF', icon: '🎆' },
        ]
      }
    ]
  }
];

// Helper to get templates by category
export const getTemplatesByCategory = (category?: PlannerTemplate['category']) => {
  if (!category) return PLANNER_TEMPLATES;
  return PLANNER_TEMPLATES.filter(t => t.category === category);
};

// Get difficulty badge color
export const getDifficultyColor = (difficulty: PlannerTemplate['difficulty']) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-700';
    case 'moderate': return 'bg-yellow-100 text-yellow-700';
    case 'intense': return 'bg-red-100 text-red-700';
  }
};

// Get category badge color
export const getCategoryColor = (category: PlannerTemplate['category']) => {
  switch (category) {
    case 'disney': return 'bg-blue-100 text-blue-700';
    case 'universal': return 'bg-purple-100 text-purple-700';
    case 'shopping': return 'bg-pink-100 text-pink-700';
    case 'mixed': return 'bg-orange-100 text-orange-700';
    case 'relaxed': return 'bg-teal-100 text-teal-700';
  }
};
