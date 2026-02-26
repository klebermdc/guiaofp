/**
 * Top 3 Recommendations for Travel Mode
 * Data sourced from curated guide - Doces, Restaurantes, and Snacks per park
 * Each item includes location name for map navigation
 */

export type Top3Category = 'doces' | 'restaurantes' | 'snacks';

export interface Top3Item {
  name: string;
  location: string; // Where to find it (restaurant/stand name)
  area: string; // Park area
  price?: string;
  description: string;
  emoji: string;
}

export interface ParkTop3 {
  parkId: string; // content_categories ID
  parkName: string;
  doces: Top3Item[];
  restaurantes: Top3Item[];
  snacks: Top3Item[];
}

export const TRAVEL_MODE_TOP3: ParkTop3[] = [
  {
    parkId: 'dd6b79b8-d934-4e15-8967-1f1af1911fef',
    parkName: 'Magic Kingdom',
    doces: [
      {
        name: 'Dole Whip Pineapple Soft-Serve',
        location: 'Aloha Isle',
        area: 'Adventureland',
        price: 'US$ 7,29',
        description: 'Sorvete cremoso de abacaxi, refrescante, sem lactose. Um dos snacks mais clássicos do parque.',
        emoji: '🍦',
      },
      {
        name: 'Crème Brûlée Croissant',
        location: "Gaston's Tavern",
        area: 'Fantasyland',
        price: 'US$ 6,49',
        description: 'Croissant recheado com creme de baunilha e cobertura de açúcar caramelizado.',
        emoji: '🥐',
      },
      {
        name: 'Waffle com Nutella e Frutas',
        location: 'Sleepy Hollow Refreshments',
        area: 'Liberty Square',
        price: 'US$ 8,79',
        description: 'Waffle belga com creme de chocolate e avelã, banana, frutas vermelhas e chantilly.',
        emoji: '🧇',
      },
    ],
    restaurantes: [
      {
        name: 'Columbia Harbour House',
        location: 'Columbia Harbour House',
        area: 'Liberty Square',
        description: 'Frutos do mar, peixe empanado e camarão. Ambiente espaçoso com ar-condicionado.',
        emoji: '🦐',
      },
      {
        name: "Cosmic Ray's Starlight Café",
        location: "Cosmic Ray's Starlight Café",
        area: 'Tomorrowland',
        description: 'Hambúrgueres, sanduíches, frango e saladas. Um dos maiores do parque.',
        emoji: '🍔',
      },
      {
        name: 'Pecos Bill Tall Tale Inn',
        location: 'Pecos Bill Tall Tale Inn and Café',
        area: 'Frontierland',
        description: 'Estilo tex-mex com tacos, burritos e bowls personalizáveis.',
        emoji: '🌮',
      },
    ],
    snacks: [
      {
        name: 'Spring Rolls',
        location: 'Spring Roll Snack Cart',
        area: 'Adventureland',
        description: 'Rolinhos fritos crocantes com sabores variados. Um dos mais disputados do parque.',
        emoji: '🥟',
      },
      {
        name: 'Turkey Leg',
        location: "Prince Eric's Village Market",
        area: 'Fantasyland',
        description: 'Coxa de peru gigante, bem temperada e suculenta. Substitui uma refeição.',
        emoji: '🍗',
      },
      {
        name: "Casey's Corner Hot Dogs",
        location: "Casey's Corner",
        area: 'Main Street, U.S.A.',
        description: 'Hot dogs clássicos americanos, rápidos e perfeitos como snack reforçado.',
        emoji: '🌭',
      },
    ],
  },
  {
    parkId: '03e87b8e-7467-4121-971b-91826dd55bec',
    parkName: 'EPCOT',
    doces: [
      {
        name: 'Croque Glacé',
        location: "L'Artisan des Glaces",
        area: 'Pavilhão da França',
        price: 'US$ 9,50',
        description: 'Sorvete dentro de um brioche quente. Contraste de quente e frio incrível.',
        emoji: '🍨',
      },
      {
        name: 'Caramel Popcorn',
        location: 'Karamell-Küche',
        area: 'Pavilhão da Alemanha',
        price: 'US$ 6,99',
        description: 'Pipoca crocante coberta com caramelo artesanal. Clássico absoluto.',
        emoji: '🍿',
      },
      {
        name: 'Macaron Ice Cream Sandwich',
        location: "L'Artisan des Glaces",
        area: 'Pavilhão da França',
        price: 'US$ 7,00',
        description: 'Dois macarons franceses recheados com sorvete. Elegante e popular.',
        emoji: '🧁',
      },
    ],
    restaurantes: [
      {
        name: 'Regal Eagle Smokehouse',
        location: 'Regal Eagle Smokehouse',
        area: 'Pavilhão dos Estados Unidos',
        description: 'Churrasco americano com carnes defumadas e boas porções.',
        emoji: '🥩',
      },
      {
        name: 'Sunshine Seasons',
        location: 'Sunshine Seasons',
        area: 'The Land',
        description: 'Estações diferentes: pratos quentes, saladas, sanduíches e sobremesas.',
        emoji: '🥗',
      },
      {
        name: 'Via Napoli Pizza Window',
        location: 'Via Napoli Pizza Window',
        area: 'Pavilhão da Itália',
        description: 'Pizza por fatia com massa italiana. Ideal para comer andando pelo World Showcase.',
        emoji: '🍕',
      },
    ],
    snacks: [
      {
        name: 'Fish and Chips',
        location: 'Yorkshire County Fish Shop',
        area: 'Pavilhão do Reino Unido',
        description: 'Peixe empanado na hora com batatas fritas. Um dos mais famosos do EPCOT.',
        emoji: '🐟',
      },
      {
        name: 'Crêpe de Queijo Brie',
        location: 'Crêpes À Emporter',
        area: 'Pavilhão da França',
        description: 'Galette salgada com massa de trigo sarraceno e recheio de queijo brie.',
        emoji: '🧀',
      },
      {
        name: 'Jumbo Turkey Leg',
        location: 'Fife & Drum Tavern',
        area: 'Pavilhão dos Estados Unidos',
        description: 'Coxa de peru gigante, bem temperada. Snack icônico e ideal para dividir.',
        emoji: '🍗',
      },
    ],
  },
  {
    parkId: 'ffdca010-b62c-40cc-98ee-37a853da037d',
    parkName: 'Hollywood Studios',
    doces: [
      {
        name: 'Jack-Jack Cookie Num Num',
        location: 'Neighborhood Bakery',
        area: 'Pixar Place',
        description: 'Cookie gigante servido quente com gotas de chocolate. Um dos mais famosos.',
        emoji: '🍪',
      },
      {
        name: 'Mini Churros',
        location: 'Ice Cold Hydraulics',
        area: 'Pixar Place',
        description: 'Churros mini, crocantes por fora e macios por dentro, com açúcar e canela.',
        emoji: '🥖',
      },
      {
        name: 'Cookies and Cream Funnel Cake',
        location: 'Epic Eats',
        area: 'Echo Lake',
        description: 'Funnel cake com sorvete de baunilha, pedaços de cookie e calda.',
        emoji: '🎂',
      },
    ],
    restaurantes: [
      {
        name: 'Backlot Express',
        location: 'Backlot Express',
        area: 'Echo Lake',
        description: 'Hambúrgueres, frango empanado. Ideal para refeições rápidas em dias cheios.',
        emoji: '🍔',
      },
      {
        name: 'ABC Commissary',
        location: 'ABC Commissary',
        area: 'Commissary Lane',
        description: 'Pratos de frango, massas e itens sazonais. Ambiente interno climatizado.',
        emoji: '🍝',
      },
      {
        name: 'Fairfax Fare',
        location: 'Fairfax Fare',
        area: 'Sunset Boulevard',
        description: 'Bowls tex-mex com temperos acentuados. Bom custo-benefício.',
        emoji: '🥘',
      },
    ],
    snacks: [
      {
        name: 'BBQ Brisket Melt',
        location: "Woody's Lunch Box",
        area: 'Toy Story Land',
        description: 'Sanduíche com brisket barbecue, queijo derretido e pão tostado. Muito elogiado.',
        emoji: '🥪',
      },
      {
        name: 'Curry Pork Rinds',
        location: 'Ronto Roasters',
        area: "Star Wars: Galaxy's Edge",
        description: 'Torresmo crocante temperado com curry. Perfeito para acompanhar bebida.',
        emoji: '🥓',
      },
      {
        name: 'Pepperoni Pizza',
        location: "Catalina Eddie's",
        area: 'Sunset Boulevard',
        description: 'Pizza quick service, massa macia e bem servida. Ótima para dividir.',
        emoji: '🍕',
      },
    ],
  },
  {
    parkId: '0ba5dfb2-4a27-48d2-9fa5-b014f04a4205',
    parkName: 'Animal Kingdom',
    doces: [
      {
        name: 'Blueberry Cream Cheese Mousse',
        location: "Satu'li Canteen",
        area: 'Pandora',
        price: 'US$ 5,99',
        description: 'Mousse leve de cream cheese com blueberry. Uma das mais elogiadas do parque.',
        emoji: '🫐',
      },
      {
        name: 'Cookie Dough Brownie Ice Cream',
        location: 'Terra Treats',
        area: 'Discovery Island',
        price: 'US$ 6,99',
        description: 'Sanduíche de sorvete com brownie e cookie dough. Bem indulgente.',
        emoji: '🍫',
      },
      {
        name: 'Key Lime Pie Pop',
        location: 'Flame Tree Barbecue',
        area: 'Discovery Island',
        price: 'US$ 5,49',
        description: 'Torta de limão no palito com cobertura crocante. Refrescante e perfeita pro calor.',
        emoji: '🍋',
      },
    ],
    restaurantes: [
      {
        name: 'Flame Tree Barbecue',
        location: 'Flame Tree Barbecue',
        area: 'Discovery Island',
        description: 'Churrasco defumado com costelas e frango. Um dos mais elogiados, áreas externas lindas.',
        emoji: '🍖',
      },
      {
        name: "Satu'li Canteen",
        location: "Satu'li Canteen",
        area: 'Pandora',
        description: 'Bowls personalizáveis com proteínas grelhadas. Equilíbrio entre sabor e rapidez.',
        emoji: '🥙',
      },
      {
        name: 'Harambe Market',
        location: 'Harambe Market',
        area: 'África',
        description: 'Cozinha com sabores africanos, carnes grelhadas e acompanhamentos únicos.',
        emoji: '🥘',
      },
    ],
    snacks: [
      {
        name: 'French Fries with Pulled Pork',
        location: 'Flame Tree Barbecue',
        area: 'Discovery Island',
        description: 'Batata frita com pulled pork desfiado e queijo. Cheio de sabor.',
        emoji: '🍟',
      },
      {
        name: 'Savanna Sausage',
        location: 'Harambe Market',
        area: 'África',
        description: 'Linguiça grelhada com temperos africanos. Opção salgada diferente.',
        emoji: '🌭',
      },
      {
        name: 'Fresh Fruit Cup',
        location: 'Harambe Fruit Market',
        area: 'África',
        description: 'Copinho de frutas frescas, refrescante e leve. Equilibra os snacks pesados.',
        emoji: '🍓',
      },
    ],
  },
  {
    parkId: 'c63c98b3-1cef-4d90-8142-0a68331907e1',
    parkName: 'Universal Studios',
    doces: [
      {
        name: 'Butterbeer',
        location: 'The Leaky Cauldron',
        area: 'Diagon Alley',
        description: 'Bebida doce e cremosa com notas de caramelo e baunilha. Clássico de Harry Potter.',
        emoji: '🍺',
      },
      {
        name: 'Chocolate Chip Cookie',
        location: 'Today Café',
        area: 'Production Central',
        description: 'Cookie grande com gotas de chocolate, macio por dentro. Perfeito com café.',
        emoji: '🍪',
      },
      {
        name: 'Banana Popcorn',
        location: 'Pop Banana Popcorn Cart',
        area: 'Área dos Minions',
        description: 'Pipoca doce sabor banana, temática dos Minions. Divertida e popular com crianças.',
        emoji: '🍌',
      },
    ],
    restaurantes: [
      {
        name: 'The Leaky Cauldron',
        location: 'The Leaky Cauldron',
        area: 'Diagon Alley',
        description: 'Pratos britânicos como fish and chips, shepherd\'s pie. Muito imersivo.',
        emoji: '🧙',
      },
      {
        name: "Louie's Italian Restaurant",
        location: "Louie's Italian Restaurant",
        area: 'New York',
        description: 'Massas, lasanha, pizza e pratos clássicos italianos.',
        emoji: '🍝',
      },
      {
        name: "Richter's Burger Co.",
        location: "Richter's Burger Co.",
        area: 'San Francisco',
        description: 'Hambúrgueres, sanduíches e batatas fritas. Simples e funcional.',
        emoji: '🍔',
      },
    ],
    snacks: [
      {
        name: "Cletus' Chicken Shack",
        location: "Cletus' Chicken Shack",
        area: 'Springfield',
        description: 'Frango frito, waffle com frango e sanduíches bem carregados.',
        emoji: '🍗',
      },
      {
        name: "Luigi's Pizza",
        location: "Luigi's Pizza",
        area: 'Springfield',
        description: 'Pizza em fatias grandes, estilo fast food. Rápida para comer andando.',
        emoji: '🍕',
      },
      {
        name: 'Assorted Pies',
        location: 'San Francisco Pastry Company',
        area: 'San Francisco',
        description: 'Tortas americanas clássicas como apple pie e chocolate pie.',
        emoji: '🥧',
      },
    ],
  },
  {
    parkId: '5a1bb5ed-866e-4a73-86ff-2ad23ebc1148',
    parkName: 'Islands of Adventure',
    doces: [
      {
        name: 'Butterbeer',
        location: 'Three Broomsticks',
        area: 'Hogsmeade',
        description: 'Bebida doce e cremosa com notas de caramelo e baunilha. Disponível gelada, frozen ou quente.',
        emoji: '🍺',
      },
      {
        name: 'Classic Cinnabon Roll',
        location: 'Cinnabon',
        area: 'Port of Entry',
        description: 'Cinnamon roll grande e macio com bastante canela e cobertura de cream cheese.',
        emoji: '🥯',
      },
      {
        name: 'Assorted Pies',
        location: 'San Francisco Pastry Company',
        area: 'Port of Entry',
        description: 'Tortas americanas clássicas, bem servidas e ótimas para dividir.',
        emoji: '🥧',
      },
    ],
    restaurantes: [
      {
        name: 'Three Broomsticks',
        location: 'Three Broomsticks',
        area: 'Hogsmeade',
        description: 'Pratos britânicos clássicos: frango assado, ribs, fish and chips. Muito imersivo.',
        emoji: '🧙',
      },
      {
        name: 'Burger Digs',
        location: 'Burger Digs',
        area: 'Jurassic Park',
        description: 'Hambúrgueres, nuggets e batatas fritas. Prático e agrada famílias.',
        emoji: '🍔',
      },
      {
        name: 'Cafe 4',
        location: 'Cafe 4',
        area: 'Marvel Super Hero Island',
        description: 'Temático dos heróis Marvel com pizzas, massas e pratos italiano-americanos.',
        emoji: '🦸',
      },
    ],
    snacks: [
      {
        name: 'Pizza Predattoria',
        location: 'Pizza Predattoria',
        area: 'Jurassic Park',
        description: 'Fatias grandes de pizza, massas e saladas. Rápido e fácil de dividir.',
        emoji: '🍕',
      },
      {
        name: 'Turkey Leg',
        location: 'Thunder Falls Terrace',
        area: 'Jurassic Park',
        description: 'Coxa de peru gigante temperada. Snack clássico e reforçado.',
        emoji: '🍗',
      },
      {
        name: 'Frozen Butterbeer',
        location: 'Hog\'s Head Pub',
        area: 'Hogsmeade',
        description: 'Versão frozen da cerveja amanteigada. Refrescante para dias quentes.',
        emoji: '🧊',
      },
    ],
  },
];

// Helper to get Top 3 data for a specific park
export const getTop3ForPark = (parkId: string): ParkTop3 | undefined => {
  return TRAVEL_MODE_TOP3.find(p => p.parkId === parkId);
};

// Category metadata
export const TOP3_CATEGORIES: Record<Top3Category, { label: string; emoji: string; gradient: string }> = {
  doces: { label: 'Top Doces', emoji: '🍰', gradient: 'from-pink-500 to-rose-600' },
  restaurantes: { label: 'Top Restaurantes', emoji: '🍽️', gradient: 'from-orange-500 to-amber-600' },
  snacks: { label: 'Top Snacks', emoji: '🧂', gradient: 'from-emerald-500 to-green-600' },
};
