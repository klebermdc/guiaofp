export interface Restaurant {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  park?: string;
  address: string;
  phone?: string;
  description: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  highlights: string[];
  menu?: {
    appetizers?: string[];
    mainCourses?: string[];
    desserts?: string[];
    drinks?: string[];
  };
  images: string[];
  website?: string;
  reservations?: boolean;
  michelin?: boolean;
  featured?: boolean;
}

export const restaurantsData: Restaurant[] = [
  // ========== DISNEY PARKS ==========
  // MAGIC KINGDOM
  {
    id: 'cinderella-royal-table',
    name: "Cinderella's Royal Table",
    category: 'disney',
    park: 'Magic Kingdom',
    address: 'Fantasyland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Jante dentro do icônico Castelo da Cinderela nesta experiência gastronômica mágica. O restaurante oferece refeições com personagens da Disney e um menu inspirado na realeza com pratos americanos refinados. Reserve com bastante antecedência!',
    priceRange: '$$$$',
    highlights: [
      'Jantar dentro do Castelo da Cinderela',
      'Encontro com princesas Disney',
      'Menu inspirado na realeza',
      'Código de vestimenta elegante'
    ],
    menu: {
      mainCourses: [
        'Beef Tenderloin',
        'Pan-seared Chicken Breast',
        'Sustainable Fish of the Day'
      ],
      desserts: ['"The Clock Strikes Twelve" (Bolo de chocolate)']
    },
    images: ['https://images.unsplash.com/photo-1532635241-17e820acc59f?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'be-our-guest',
    name: "Be Our Guest Restaurant",
    category: 'disney',
    park: 'Magic Kingdom',
    address: 'Fantasyland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Inspirado em A Bela e a Fera, este restaurante oferece três ambientes temáticos: o Salão de Baile, a Galeria das Rosas e a Ala Oeste. Culinária francesa-americana em um cenário mágico. Primeiro restaurante do Magic Kingdom a servir cerveja e vinho.',
    priceRange: '$$$',
    highlights: [
      'Cenário do filme A Bela e a Fera',
      'Três ambientes temáticos diferentes',
      'Culinária franco-americana',
      'Serve cerveja e vinho'
    ],
    menu: {
      mainCourses: [
        'Croque Monsieur',
        'Coq au Vin',
        'Ratatouille',
        'French Onion Soup'
      ],
      desserts: ['The Master\'s Cupcake', 'The Grey Stuff']
    },
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'crystal-palace',
    name: 'The Crystal Palace',
    category: 'disney',
    park: 'Magic Kingdom',
    address: 'Main Street U.S.A., Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Buffet estilo vitoriano com personagens do Ursinho Pooh. Localização linda em Main Street com arquitetura de vidro. Oferece café da manhã, almoço e jantar em estilo buffet com grande variedade.',
    priceRange: '$$$',
    highlights: [
      'Personagens do Ursinho Pooh',
      'Buffet variado',
      'Arquitetura vitoriana em vidro',
      'Ótimo para famílias'
    ],
    menu: {
      mainCourses: [
        'Puffed French Toast',
        'Lasagna',
        'Rotisserie Chicken',
        'Carved Meats'
      ],
      desserts: ['Bread Pudding', 'Pineapple Upside Down Cake', '100 Acre Woods Waffles']
    },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    reservations: true
  },
  {
    id: 'jungle-skipper-canteen',
    name: 'Jungle Navigation Co. Ltd. Skipper Canteen',
    category: 'disney',
    park: 'Magic Kingdom',
    address: 'Adventureland, Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante temático inspirado na Jungle Cruise com culinária asiática, latino-americana e africana. Ambiente divertido com referências à atração.',
    priceRange: '$$',
    highlights: [
      'Tema da Jungle Cruise',
      'Culinária internacional',
      'Ambiente divertido',
      'Menu diversificado'
    ],
    menu: {
      mainCourses: [
        'Sustainable Fish',
        'Braised Short Ribs',
        'Peri-peri Chicken',
        'Char Siu Pork'
      ]
    },
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    reservations: true
  },
  {
    id: 'tonys-town-square',
    name: "Tony's Town Square Restaurant",
    category: 'disney',
    park: 'Magic Kingdom',
    address: 'Main Street U.S.A., Magic Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante italiano inspirado em A Dama e o Vagabundo. Menu de massas tradicionais e pratos italianos. Pátio externo perfeito para observar as paradas.',
    priceRange: '$$',
    highlights: [
      'Tema de A Dama e o Vagabundo',
      'Culinária italiana',
      'Vista para Main Street',
      'Pátio ao ar livre'
    ],
    menu: {
      mainCourses: [
        'Spaghetti com almôndegas gigantes',
        'Chicken Parmigiana',
        'Shrimp Scampi',
        'Calamari'
      ]
    },
    images: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'],
    reservations: true
  },

  // EPCOT
  {
    id: 'space-220',
    name: 'Space 220 Restaurant',
    category: 'disney',
    park: 'Epcot',
    address: 'World Discovery, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Experiência gastronômica única "no espaço", a 220 milhas acima da Terra. Janelas com vista para o espaço sideral e culinária contemporânea americana de alto nível. Reservas extremamente concorridas.',
    priceRange: '$$$$',
    highlights: [
      'Experiência imersiva no espaço',
      'Vista para a Terra',
      'Culinária contemporânea',
      'Elevar espacial simulado'
    ],
    menu: {
      appetizers: ['Star Course Salad', 'Celestial Cheese Board'],
      mainCourses: [
        'Slow Rotation Short Rib',
        'Blue Moon Cauliflower',
        'Neptune Pasta',
        'Vegan Option'
      ],
      desserts: ['Chocolate Cheesecake']
    },
    images: ['https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'le-cellier',
    name: 'Le Cellier Steakhouse',
    category: 'disney',
    park: 'Epcot',
    address: 'Canada Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Steakhouse canadense em ambiente de adega. Famoso pelo filet mignon com cheddar e pela sopa de cheddar canadense. Ambiente aconchegante e romântico.',
    priceRange: '$$$$',
    highlights: [
      'Steakhouse premium',
      'Famosa sopa de cheddar',
      'Ambiente de adega',
      'Culinária canadense'
    ],
    menu: {
      appetizers: ['Canadian Cheddar Cheese Soup', 'Poutine'],
      mainCourses: [
        'Filet Mignon',
        'Bone-in Ribeye',
        'Sustainable Fish',
        'Mushroom Filet (Plant-based)'
      ],
      desserts: ['Maple Crème Brûlée', 'Chocolate "Moose"']
    },
    images: ['https://images.unsplash.com/photo-1558030137-50e3c41e05f0?w=800'],
    reservations: true
  },
  {
    id: 'teppan-edo',
    name: 'Teppan Edo',
    category: 'disney',
    park: 'Epcot',
    address: 'Japan Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Experiência teppanyaki tradicional japonesa com chefs preparando a comida na sua frente. Excelente para grupos e famílias. Localizado no Pavilhão do Japão.',
    priceRange: '$$$',
    highlights: [
      'Teppanyaki ao vivo',
      'Performance dos chefs',
      'Culinária japonesa autêntica',
      'Ótimo para grupos'
    ],
    menu: {
      mainCourses: [
        'Hibachi Steak',
        'Hibachi Chicken',
        'Hibachi Shrimp',
        'Combination Meals'
      ]
    },
    images: ['https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800'],
    reservations: true
  },
  {
    id: 'san-angel-inn',
    name: 'San Angel Inn Restaurante',
    category: 'disney',
    park: 'Epcot',
    address: 'Mexico Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante mexicano em ambiente noturno permanente à beira do rio dentro da pirâmide mexicana. Vista para a atração Gran Fiesta Tour. Culinária mexicana autêntica.',
    priceRange: '$$$',
    highlights: [
      'Dentro da pirâmide mexicana',
      'Ambiente noturno único',
      'Vista para o rio',
      'Culinária mexicana autêntica'
    ],
    menu: {
      mainCourses: [
        'Mole Poblano',
        'Carne Asada',
        'Enchiladas',
        'Pescado Veracruzana'
      ],
      drinks: ['Margaritas', 'Tequila Selection']
    },
    images: ['https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800'],
    reservations: true
  },
  {
    id: 'chefs-de-france',
    name: 'Chefs de France',
    category: 'disney',
    park: 'Epcot',
    address: 'France Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Autêntica brasserie francesa com chefs renomados. Culinária francesa clássica em ambiente elegante. Vista para o Pavilhão da França.',
    priceRange: '$$$',
    highlights: [
      'Culinária francesa autêntica',
      'Chefs franceses',
      'Ambiente de brasserie',
      'Excelente carta de vinhos'
    ],
    menu: {
      mainCourses: [
        'Boeuf Bourguignon',
        'Coq au Vin',
        'Ratatouille',
        'Escargots'
      ],
      desserts: ['Crème Brûlée', 'Profiteroles']
    },
    images: ['https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800'],
    reservations: true
  },
  {
    id: 'biergarten',
    name: 'Biergarten Restaurant',
    category: 'disney',
    park: 'Epcot',
    address: 'Germany Pavilion, World Showcase, Epcot, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Buffet alemão com música ao vivo e dança tradicional. Ambiente de festa Oktoberfest durante todo o ano. Cervejas alemãs autênticas.',
    priceRange: '$$',
    highlights: [
      'Buffet alemão',
      'Música ao vivo',
      'Ambiente Oktoberfest',
      'Cervejas alemãs'
    ],
    menu: {
      mainCourses: [
        'Schnitzel',
        'Bratwurst',
        'Roasted Chicken',
        'German Potato Salad'
      ]
    },
    images: ['https://images.unsplash.com/photo-1568600156848-cde4d0c9b8b5?w=800'],
    reservations: true
  },

  // HOLLYWOOD STUDIOS
  {
    id: 'hollywood-brown-derby',
    name: 'The Hollywood Brown Derby',
    category: 'disney',
    park: 'Hollywood Studios',
    address: 'Hollywood Boulevard, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Réplica do icônico restaurante de Hollywood dos anos dourados. Famoso pela Cobb Salad original e grapefruit cake. Ambiente elegante de Golden Age.',
    priceRange: '$$$$',
    highlights: [
      'Réplica do Hollywood original',
      'Famosa Cobb Salad',
      'Culinária americana refinada',
      'Ambiente anos dourados'
    ],
    menu: {
      appetizers: ['Original Cobb Salad'],
      mainCourses: [
        'Filet Mignon',
        'Pan-roasted Chicken Breast',
        'Derby Grouper',
        'Plant-based "Steak"'
      ],
      desserts: ['Grapefruit Cake']
    },
    images: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'sci-fi-dine-in',
    name: 'Sci-Fi Dine-In Theater Restaurant',
    category: 'disney',
    park: 'Hollywood Studios',
    address: 'Commissary Lane, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante único onde você janta em carros clássicos assistindo a filmes sci-fi antigos. Experiência nostálgica dos drive-ins dos anos 50.',
    priceRange: '$$',
    highlights: [
      'Jante em carros clássicos',
      'Filmes sci-fi clássicos',
      'Tema drive-in dos anos 50',
      'Experiência única'
    ],
    menu: {
      mainCourses: [
        'Angus Cheeseburger',
        'Fried Shrimp',
        'BBQ Pork Ribs',
        'Plant-based Burger'
      ]
    },
    images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: '50s-prime-time',
    name: "50's Prime Time Café",
    category: 'disney',
    park: 'Hollywood Studios',
    address: 'Echo Lake, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Jante na cozinha da vovó nos anos 50! Garçons interagem como membros da família. Comida caseira americana com muito entretenimento.',
    priceRange: '$$',
    highlights: [
      'Tema anos 50',
      'Garçons interativos',
      'Comida caseira americana',
      'Experiência divertida'
    ],
    menu: {
      mainCourses: [
        "Mom's Traditional Pot Roast",
        'Fried Chicken',
        "Aunt Liz's Golden Fried Chicken",
        'Chicken Pot Pie'
      ],
      desserts: ["Dad's Brownie Sundae", 'Chocolate Peanut Butter Pie']
    },
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    reservations: true
  },
  {
    id: 'docking-bay-7',
    name: 'Docking Bay 7 Food and Cargo',
    category: 'disney',
    park: 'Hollywood Studios',
    address: "Star Wars: Galaxy's Edge, Hollywood Studios, Walt Disney World, Lake Buena Vista, FL 32830",
    description: 'Principal restaurante de Star Wars: Galaxy\'s Edge. Pratos inspirados em diferentes planetas da saga. Ambiente imersivo de hangar espacial.',
    priceRange: '$$',
    highlights: [
      'Tema Star Wars',
      'Pratos de planetas diferentes',
      'Ambiente de Galaxy\'s Edge',
      'Quick service gourmet'
    ],
    menu: {
      mainCourses: [
        'Smoked Kaadu Ribs',
        'Fried Endorian Tip-Yip',
        'Braised Shaak Roast',
        'Felucian Garden Spread (vegetariano)'
      ],
      desserts: ['Batuu-bon', 'Oi-oi Puff']
    },
    images: ['https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800'],
    reservations: false
  },

  // ANIMAL KINGDOM
  {
    id: 'tiffins',
    name: 'Tiffins Restaurant',
    category: 'disney',
    park: 'Animal Kingdom',
    address: 'Discovery Island, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante signature com culinária inspirada nas viagens dos Imagineers. Arte das expedições nas paredes. Um dos melhores restaurantes da Disney.',
    priceRange: '$$$$',
    highlights: [
      'Culinária internacional refinada',
      'Arte dos Imagineers',
      'Menu sazonal',
      'Melhor restaurante do Animal Kingdom'
    ],
    menu: {
      mainCourses: [
        'Wagyu Strip Loin',
        'Sustainable Fish',
        'Braised Short Rib',
        'Plant-based Option'
      ],
      desserts: ['Passion Fruit Tapioca', 'South American Chocolate Ganache']
    },
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'satuli-canteen',
    name: "Satu'li Canteen",
    category: 'disney',
    park: 'Animal Kingdom',
    address: 'Pandora - The World of Avatar, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    description: 'Restaurante quick-service de Pandora com bowls customizáveis. Opções saudáveis e saborosas inspiradas na lua de Avatar.',
    priceRange: '$$',
    highlights: [
      'Tema de Avatar',
      'Bowls customizáveis',
      'Opções saudáveis',
      'Melhor quick-service da Disney'
    ],
    menu: {
      mainCourses: [
        'Bowls customizáveis (escolha base, proteína e molho)',
        'Cheeseburger Pods',
        'Bao Buns'
      ],
      desserts: ['Blueberry Cream Cheese Mousse']
    },
    images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'],
    reservations: false
  },
  {
    id: 'yak-and-yeti',
    name: 'Yak & Yeti Restaurant',
    category: 'disney',
    park: 'Animal Kingdom',
    address: 'Asia, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    phone: '(407) 939-3463',
    description: 'Restaurante pan-asiático em construção nepalesa. Culinária do Himalaia, China e Sudeste Asiático. Ambiente exótico e autêntico.',
    priceRange: '$$$',
    highlights: [
      'Culinária pan-asiática',
      'Arquitetura nepalesa',
      'Menu diversificado',
      'Drinks tropicais'
    ],
    menu: {
      mainCourses: [
        'Crispy Honey Chicken',
        'Mahi Mahi',
        'Korean Beef',
        'Lo Mein'
      ]
    },
    images: ['https://images.unsplash.com/photo-1516685304269-cbdb6a46bd67?w=800'],
    reservations: true
  },
  {
    id: 'flame-tree',
    name: 'Flame Tree Barbecue',
    category: 'disney',
    park: 'Animal Kingdom',
    address: 'Discovery Island, Animal Kingdom, Walt Disney World, Lake Buena Vista, FL 32830',
    description: 'Melhor quick-service de churrasco americano da Disney. Costelas defumadas, frango e pulled pork. Vista para a água.',
    priceRange: '$',
    highlights: [
      'Churrasco americano',
      'Costelas defumadas',
      'Vista para o rio',
      'Ótimo custo-benefício'
    ],
    menu: {
      mainCourses: [
        'St. Louis-style Ribs',
        'Smoked Half Chicken',
        'Pulled Pork Sandwich',
        'Baked Chicken Sandwich'
      ]
    },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    reservations: false
  },

  // DISNEY SPRINGS
  {
    id: 'morimoto-asia',
    name: 'Morimoto Asia',
    category: 'disney',
    park: 'Disney Springs',
    address: '1600 E Buena Vista Dr, Lake Buena Vista, FL 32830',
    phone: '(407) 939-6686',
    description: 'Restaurante do famoso chef Masaharu Morimoto (Iron Chef). Culinária pan-asiática de alto nível com sushi bar excepcional. Dois andares com vistas espetaculares.',
    priceRange: '$$$',
    highlights: [
      'Chef celebrity Morimoto',
      'Sushi excepcional',
      'Culinária pan-asiática',
      'Ambiente sofisticado'
    ],
    menu: {
      mainCourses: [
        'Peking Duck',
        'Spare Ribs',
        'Rock Shrimp Tempura',
        'Signature Sushi Rolls'
      ]
    },
    images: ['https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'homecomin',
    name: "Homecomin' Florida Kitchen",
    category: 'disney',
    park: 'Disney Springs',
    address: '1601 E Buena Vista Dr, Lake Buena Vista, FL 32830',
    phone: '(407) 560-0100',
    description: 'Comida caseira da Flórida pelo chef Art Smith (chef pessoal de Oprah). Famoso pelo frango frito e biscoitos. Ambiente acolhedor de fazenda.',
    priceRange: '$$',
    highlights: [
      'Chef Art Smith',
      'Melhor frango frito de Orlando',
      'Culinária do sul dos EUA',
      'Hush Puppies famosos'
    ],
    menu: {
      mainCourses: [
        'Fried Chicken',
        'Church Lady Deviled Eggs',
        'Shrimp & Grits',
        'Thigh High Chicken Biscuits'
      ],
      desserts: ['Hummingbird Cake', 'Shine Cake']
    },
    images: ['https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800'],
    reservations: true
  },
  {
    id: 'jaleo',
    name: 'Jaleo by José Andrés',
    category: 'disney',
    park: 'Disney Springs',
    address: '1600 E Buena Vista Dr, Lake Buena Vista, FL 32830',
    phone: '(407) 934-3900',
    description: 'Tapas espanholas do renomado chef José Andrés. Paellas tradicionais, jamón ibérico e vinhos espanhóis. Ambiente vibrante e autêntico.',
    priceRange: '$$$',
    highlights: [
      'Chef José Andrés',
      'Tapas autênticas',
      'Paellas tradicionais',
      'Jamón ibérico'
    ],
    menu: {
      mainCourses: [
        'Paella Valenciana',
        'Jamón Ibérico de Bellota',
        'Pulpo a la Gallega',
        'Croquetas de Pollo'
      ]
    },
    images: ['https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800'],
    reservations: true
  },
  {
    id: 'the-polite-pig',
    name: 'The Polite Pig',
    category: 'disney',
    park: 'Disney Springs',
    address: '1620 E Buena Vista Dr, Lake Buena Vista, FL 32830',
    phone: '(407) 938-7900',
    description: 'Churrasco moderno e craft beers dos criadores do The Ravenous Pig. Menu sofisticado de carnes defumadas e acompanhamentos gourmet.',
    priceRange: '$$',
    highlights: [
      'Churrasco artesanal',
      'Craft beers on tap',
      'Menu moderno',
      'Carnes defumadas na casa'
    ],
    menu: {
      mainCourses: [
        'Smoked Pork Shoulder',
        'Smoked Brisket',
        'Smoked Wings',
        'Bourbon Barrel Smoked Ribs'
      ]
    },
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800'],
    reservations: false
  },

  // DISNEY RESORTS
  {
    id: 'victoria-alberts',
    name: "Victoria & Albert's",
    category: 'disney',
    park: 'Grand Floridian Resort',
    address: "4401 Floridian Way, Disney's Grand Floridian Resort & Spa, Lake Buena Vista, FL 32830",
    phone: '(407) 939-3862',
    description: 'Único restaurante da Disney com estrela Michelin. Menu degustação exclusivo de 7 a 10 pratos. Código de vestimenta elegante obrigatório. Experiência gastronômica inesquecível.',
    priceRange: '$$$$',
    highlights: [
      'Estrela Michelin',
      'Menu degustação',
      'Apenas adultos (+10 anos)',
      'Serviço impecável',
      'Código de vestimenta'
    ],
    menu: {
      mainCourses: [
        'Menu degustação sazonal de 7-10 pratos',
        'Harmonização de vinhos opcional',
        'Ingredientes premium'
      ]
    },
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    reservations: true,
    michelin: true,
    featured: true
  },
  {
    id: 'california-grill',
    name: 'California Grill',
    category: 'disney',
    park: 'Contemporary Resort',
    address: "4600 N World Dr, Disney's Contemporary Resort, Lake Buena Vista, FL 32830",
    phone: '(407) 939-3463',
    description: 'No 15º andar do Contemporary Resort com vista panorâmica para o Magic Kingdom. Assista aos fogos do castelo enquanto janta. Sushi premium e carnes de qualidade.',
    priceRange: '$$$$',
    highlights: [
      'Vista dos fogos do Magic Kingdom',
      'No 15º andar',
      'Sushi bar premium',
      'Culinária contemporânea'
    ],
    menu: {
      mainCourses: [
        'Sustainable Fish',
        'Oak-fired Filet Mignon',
        'Specialty Sushi Rolls',
        'Sonoma Goat Cheese Ravioli'
      ]
    },
    images: ['https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'boma',
    name: 'Boma - Flavors of Africa',
    category: 'disney',
    park: 'Animal Kingdom Lodge',
    address: "2901 Osceola Pkwy, Disney's Animal Kingdom Lodge, Bay Lake, FL 32830",
    phone: '(407) 939-3463',
    description: 'Buffet africano com mais de 50 pratos. Café da manhã e jantar. Sabores únicos da África com toque contemporâneo.',
    priceRange: '$$$',
    highlights: [
      'Buffet africano',
      'Mais de 50 pratos',
      'Sabores únicos',
      'Vista para savana'
    ],
    menu: {
      mainCourses: [
        'Carved Meats (várias opções)',
        'African-inspired Curries',
        'Seafood Selection',
        'Vegetarian Options'
      ],
      desserts: ['Zebra Domes (sobremesa exclusiva)']
    },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    reservations: true
  },

  // ========== UNIVERSAL PARKS ==========
  // UNIVERSAL STUDIOS FLORIDA
  {
    id: 'leaky-cauldron',
    name: 'The Leaky Cauldron',
    category: 'universal',
    park: 'Universal Studios Florida',
    address: 'Diagon Alley, Universal Studios Florida, 6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-4012',
    description: 'Pub rústico de Harry Potter em Diagon Alley. Réplica exata do filme com culinária britânica tradicional. Fish and chips, bangers and mash e butterbeer.',
    priceRange: '$$',
    highlights: [
      'Cenário de Harry Potter',
      'Culinária britânica',
      'Butterbeer exclusiva',
      'Ambiente autêntico do filme'
    ],
    menu: {
      mainCourses: [
        'Fish and Chips',
        'Bangers and Mash',
        'Fisherman\'s Pie',
        'Cottage Pie',
        'Toad in the Hole'
      ],
      drinks: ['Butterbeer', 'Pumpkin Juice', 'Gillywater']
    },
    images: ['https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'mels-drive-in',
    name: "Mel's Drive-In",
    category: 'universal',
    park: 'Universal Studios Florida',
    address: 'Hollywood, Universal Studios Florida, 6000 Universal Blvd, Orlando, FL 32819',
    description: 'Lanchonete retrô dos anos 50 estilo American Graffiti. Hambúrgueres clássicos, milkshakes e ambiente nostálgico com carros antigos.',
    priceRange: '$',
    highlights: [
      'Tema anos 50',
      'Carros clássicos',
      'Hambúrgueres gourmet',
      'Milkshakes cremosos'
    ],
    menu: {
      mainCourses: [
        'BBQ Brisket Burger',
        'Classic Cheeseburger',
        'Chicken Sandwich',
        'Hot Dogs'
      ],
      desserts: ['Milkshakes', 'Soft-serve Ice Cream']
    },
    images: ['https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800'],
    reservations: false
  },
  {
    id: 'finnegans',
    name: "Finnegan's Bar and Grill",
    category: 'universal',
    park: 'Universal Studios Florida',
    address: 'New York, Universal Studios Florida, 6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-3613',
    description: 'Pub irlandês autêntico com culinária irlandesa e americana. Fish and chips, shepherd\'s pie e cervejas importadas.',
    priceRange: '$$',
    highlights: [
      'Pub irlandês autêntico',
      'Cervejas importadas',
      'Culinária irlandesa',
      'Música ao vivo ocasional'
    ],
    menu: {
      mainCourses: [
        'Fish and Chips',
        'Shepherd\'s Pie',
        'Corned Beef and Cabbage',
        'Irish Stew'
      ]
    },
    images: ['https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800'],
    reservations: false
  },

  // ISLANDS OF ADVENTURE
  {
    id: 'three-broomsticks',
    name: 'Three Broomsticks',
    category: 'universal',
    park: 'Islands of Adventure',
    address: 'The Wizarding World of Harry Potter - Hogsmeade, Islands of Adventure, 6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-4012',
    description: 'Taverna de Hogsmeade com culinária britânica hearty. Great Hall com detalhes do filme. Rotisserie chicken, ribs e butterbeer.',
    priceRange: '$$',
    highlights: [
      'Cenário de Hogsmeade',
      'Great Hall autêntico',
      'Butterbeer on tap',
      'Ambiente mágico'
    ],
    menu: {
      mainCourses: [
        'Rotisserie Smoked Chicken',
        'Spare Ribs',
        'Fish and Chips',
        'Great Feast (para 4 pessoas)'
      ],
      drinks: ['Frozen Butterbeer', 'Hot Butterbeer', 'Pumpkin Juice']
    },
    images: ['https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'mythos',
    name: 'Mythos Restaurant',
    category: 'universal',
    park: 'Islands of Adventure',
    address: 'The Lost Continent, Islands of Adventure, 6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-4534',
    description: 'Restaurante premiado com arquitetura única em caverna. Menu mediterrâneo com frutos do mar, carnes e massas. Vista para o lago.',
    priceRange: '$$$',
    highlights: [
      'Arquitetura única',
      'Menu mediterrâneo',
      'Vista para o lago',
      'Premiado nacionalmente'
    ],
    menu: {
      mainCourses: [
        'Seared Ahi Tuna',
        'Beef Medallions',
        'Risotto Milanese',
        'Pan-seared Salmon'
      ]
    },
    images: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'],
    reservations: true
  },
  {
    id: 'confisco-grille',
    name: 'Confisco Grille and Backwater Bar',
    category: 'universal',
    park: 'Islands of Adventure',
    address: 'Port of Entry, Islands of Adventure, 6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-4534',
    description: 'Menu internacional eclético em ambiente de explorador. Pratos asiáticos, mediterrâneos e americanos. Bar com drinks tropicais.',
    priceRange: '$$',
    highlights: [
      'Menu internacional',
      'Drinks tropicais',
      'Tema de explorador',
      'Variedade de sabores'
    ],
    menu: {
      mainCourses: [
        'Pad Thai',
        'Fish Tacos',
        'Italian Sandwich',
        'Chicken Parmesan'
      ]
    },
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    reservations: false
  },

  // EPIC UNIVERSE (Novo Parque - 2025)
  {
    id: 'toadstool-cafe',
    name: 'Toadstool Cafe',
    category: 'universal',
    park: 'Epic Universe',
    address: 'Super Nintendo World, Epic Universe, Universal Orlando, FL 32819',
    description: 'Restaurante temático do Super Mario com comida inspirada no jogo. Decoração colorida e vibrante. Pedidos via QR code. Experiência imersiva Nintendo.',
    priceRange: '$$',
    highlights: [
      'Tema Super Mario',
      'Decoração imersiva',
      'Comida temática',
      'Pedidos por QR code'
    ],
    menu: {
      mainCourses: [
        'Mario Burger',
        'Luigi Burger',
        'Toad Mushroom Pizza',
        'Princess Peach Cake'
      ],
      desserts: ['Super Star Lemon Squash', 'Tiramisu temático']
    },
    images: ['https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800'],
    reservations: false,
    featured: true
  },

  // CITYWALK
  {
    id: 'toothsome',
    name: 'Toothsome Chocolate Emporium & Savory Feast Kitchen',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-3663',
    description: 'Fábrica de chocolate steampunk com refeições e sobremesas incríveis. Milkshakes gigantes e menu variado. Personagens interativos. Ambiente fantasioso.',
    priceRange: '$$$',
    highlights: [
      'Tema steampunk',
      'Milkshakes gigantes',
      'Personagens interativos',
      'Sobremesas espetaculares'
    ],
    menu: {
      mainCourses: [
        'Slow-roasted Prime Rib',
        'All-natural Chicken Breast',
        'Pasta Dishes',
        'Gourmet Burgers'
      ],
      desserts: [
        'Key Lime Pie Milkshake',
        'Red Velvet Milkshake',
        'Chocolate x5 (5 sobremesas de chocolate)',
        'Bacon Brittle Milkshake'
      ]
    },
    images: ['https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800'],
    reservations: true,
    featured: true
  },
  {
    id: 'cowfish',
    name: 'The Cowfish Sushi Burger Bar',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-3663',
    description: 'Conceito único que combina sushi bar e hamburgueria. Burgushi (híbrido de burger e sushi). Menu criativo e divertido.',
    priceRange: '$$',
    highlights: [
      'Conceito burger + sushi',
      'Burgushi exclusivo',
      'Menu criativo',
      'Ambiente moderno'
    ],
    menu: {
      mainCourses: [
        'Burgushi (vários sabores)',
        'Gourmet Burgers',
        'Specialty Sushi Rolls',
        'Bento Boxes'
      ]
    },
    images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'],
    reservations: true
  },
  {
    id: 'hard-rock-cafe',
    name: 'Hard Rock Cafe Orlando',
    category: 'universal',
    park: 'CityWalk',
    address: '6050 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 351-7625',
    description: 'O maior Hard Rock Cafe do mundo! Memorabilia musical incrível, incluindo traje de Elvis e óculos de Buddy Holly. Culinária americana clássica.',
    priceRange: '$$',
    highlights: [
      'Maior Hard Rock do mundo',
      'Memorabilia exclusiva',
      'Música ao vivo',
      'Ambiente icônico'
    ],
    menu: {
      mainCourses: [
        'Legendary Burger',
        'Hickory-Smoked Ribs',
        'Twisted Mac & Cheese',
        'Grilled Salmon'
      ]
    },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    reservations: false
  },
  {
    id: 'antojitos',
    name: 'Antojitos Authentic Mexican Food',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd #704, Orlando, FL 32819',
    phone: '(407) 224-3663',
    description: 'Restaurante mexicano autêntico com guacamole preparado na mesa. Música ao vivo e tequilaria. Prédio colorido icônico.',
    priceRange: '$$',
    highlights: [
      'Guacamole na mesa',
      'Música ao vivo',
      'Tequilaria',
      'Culinária mexicana autêntica'
    ],
    menu: {
      mainCourses: [
        'Carne Asada',
        'Enchiladas',
        'Tacos variados',
        'Tableside Guacamole'
      ],
      drinks: ['Margaritas artesanais', 'Seleção de tequilas']
    },
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'],
    reservations: true
  },
  {
    id: 'bigfire',
    name: 'Bigfire',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-3663',
    description: 'Restaurante americano de churrasco artesanal. S\'mores preparados na mesa. Carnes defumadas e grelhadas. Ambiente rústico elegante.',
    priceRange: '$$$',
    highlights: [
      'S\'mores na mesa',
      'Churrasco artesanal',
      'Carnes premium',
      'Craft beers'
    ],
    menu: {
      mainCourses: [
        'Wood-fired Steaks',
        'Smoked Brisket',
        'Cedar Plank Salmon',
        'Tableside S\'mores'
      ]
    },
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800'],
    reservations: true
  },
  {
    id: 'margaritaville',
    name: "Jimmy Buffett's Margaritaville",
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd #704, Orlando, FL 32819',
    phone: '(407) 224-2155',
    description: 'Restaurante tropical inspirado em Jimmy Buffett. Música ao vivo, vulcão de margarita e comida caribenha. Ambiente de ilha relaxante.',
    priceRange: '$$',
    highlights: [
      'Vulcão de margarita',
      'Música ao vivo',
      'Tema tropical',
      'Drinks caribenhos'
    ],
    menu: {
      mainCourses: [
        'Cheeseburger in Paradise',
        'Grilled Tacos',
        'Jammin\' Jambalaya',
        'Fish Sandwich'
      ],
      desserts: ['Key Lime Pie', 'Chocolate Hurricane Pie']
    },
    images: ['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800'],
    reservations: false
  },
  {
    id: 'bubba-gump-universal',
    name: 'Bubba Gump Shrimp Co.',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd Suite 735, Orlando, FL 32819',
    phone: '(407) 903-0044',
    description: 'Restaurante temático do filme Forrest Gump. Especializado em frutos do mar, especialmente camarão. Decoração divertida do filme.',
    priceRange: '$$',
    highlights: [
      'Tema Forrest Gump',
      'Especializado em camarão',
      'Decoração do filme',
      'Drinks temáticos'
    ],
    menu: {
      mainCourses: [
        'Forrest\'s Seafood Feast',
        'Shrimper\'s Heaven',
        'Bourbon Street Mahi Mahi',
        'Mama\'s Shrimp & Grits'
      ],
      desserts: ['Chocolate Chip Cookie Sundae']
    },
    images: ['https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800'],
    reservations: false
  },
  {
    id: 'vivo',
    name: 'Vivo Italian Kitchen',
    category: 'universal',
    park: 'CityWalk',
    address: '6000 Universal Blvd, Orlando, FL 32819',
    phone: '(407) 224-3663',
    description: 'Cozinha italiana moderna à beira d\'água. Massas frescas, pizzas artesanais e risottos. Vista para o lago. Ambiente elegante.',
    priceRange: '$$',
    highlights: [
      'Vista para o lago',
      'Massas frescas',
      'Pizzas artesanais',
      'Culinária italiana moderna'
    ],
    menu: {
      mainCourses: [
        'Handmade Pasta',
        'Wood-fired Pizzas',
        'Osso Buco',
        'Risotto varieties'
      ]
    },
    images: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'],
    reservations: true
  },

  // ========== RESTAURANTES FORA DOS PARQUES ==========
  // CHURRASCARIAS BRASILEIRAS
  {
    id: 'fogo-de-chao',
    name: 'Fogo de Chão Brazilian Steakhouse',
    category: 'fora-parques',
    subcategory: 'Churrascaria',
    address: '8282 International Dr, Orlando, FL 32819',
    phone: '(407) 370-0711',
    description: 'Renomada rede brasileira de churrascaria com cortes premium. Sistema rodízio tradicional gaúcho. Salad bar gourmet espetacular. Bar Fogo com happy hour.',
    priceRange: '$$$$',
    highlights: [
      'Rodízio tradicional',
      '15 tipos de carne',
      'Salad bar gourmet',
      'Happy hour no Bar Fogo',
      'Carnes de qualidade AAA'
    ],
    menu: {
      mainCourses: [
        'Picanha',
        'Filet Mignon',
        'Costela de Cordeiro',
        'Fraldinha',
        'Alcatra',
        'Linguiça',
        'Chicken Wrapped in Bacon'
      ]
    },
    images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800'],
    website: 'https://fogodechao.com',
    reservations: true,
    featured: true
  },
  {
    id: 'texas-de-brazil',
    name: 'Texas de Brazil',
    category: 'fora-parques',
    subcategory: 'Churrascaria',
    address: '5259 International Dr, Orlando, FL 32819',
    phone: '(407) 355-0355',
    description: 'Churrascaria autêntica com gaúchos servindo carnes no espeto. All-you-can-eat com mais de 15 cortes. Salad bar com mais de 50 itens gourmet.',
    priceRange: '$$$',
    highlights: [
      'Gaúchos tradicionais',
      'Mais de 15 cortes',
      'Salad bar com 50+ itens',
      'Happy hour 4:30-6pm',
      'Estacionamento com valet'
    ],
    menu: {
      mainCourses: [
        'Picanha',
        'Filet Mignon',
        'Ribeye',
        'Lamb Chops',
        'Brazilian Sausage',
        'Bacon-wrapped Chicken',
        'Parmesan Pork'
      ]
    },
    images: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'],
    website: 'https://texasdebrazil.com',
    reservations: true,
    featured: true
  },
  {
    id: 'soseki',
    name: 'Soseki',
    category: 'fora-parques',
    subcategory: 'Japonês',
    address: '426 Plant St, Winter Park, FL 32789',
    phone: '(407) 960-8838',
    description: 'Experiência omakase de alto nível com 2 estrelas Michelin. Apenas 10 lugares. Menu muda mensalmente com foco em produtos da Flórida.',
    priceRange: '$$$$',
    highlights: [
      '2 Estrelas Michelin',
      'Omakase com 10 lugares',
      'Menu mensal sazonal',
      'Sommelier premiado',
      'Produtos da Flórida'
    ],
    menu: {
      mainCourses: [
        'Menu omakase degustação (varia mensalmente)',
        'Nigiri peça por peça',
        'Ingredientes locais da Flórida'
      ]
    },
    images: ['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'],
    website: 'https://sosekiorlando.com',
    reservations: true,
    michelin: true,
    featured: true
  },
  {
    id: 'shake-shack',
    name: 'Shake Shack',
    category: 'fora-parques',
    subcategory: 'Americano',
    address: 'Várias localizações: Florida Mall, Mall at Millenia, Icon 360',
    description: 'Rede premium de fast-food de Nova York. Hambúrgueres com carne fresca, batatas crinkle-cut e milkshakes densos. Ingredientes frescos e qualidade superior.',
    priceRange: '$$',
    highlights: [
      'Hambúrgueres premium',
      'Batata crinkle famosa',
      'Milkshakes densos',
      'Várias localizações',
      'Qualidade superior'
    ],
    menu: {
      mainCourses: [
        'ShackBurger',
        'SmokeShack',
        'Shroom Burger (vegetariano)',
        'Crinkle-cut Fries',
        'Cheese Fries'
      ],
      desserts: ['Shakes', 'Concretes']
    },
    images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'five-guys',
    name: 'Five Guys',
    category: 'fora-parques',
    subcategory: 'Americano',
    address: 'Várias localizações incluindo Florida Mall',
    description: 'Eleito melhor hambúrguer de Orlando e dos EUA. Hambúrgueres frescos customizáveis com 15+ toppings grátis. Batatas fritas com amendoins grátis.',
    priceRange: '$$',
    highlights: [
      'Melhor hambúrguer de Orlando',
      '15+ toppings grátis',
      'Batatas frescas',
      'Amendoins grátis',
      'Várias localizações'
    ],
    menu: {
      mainCourses: [
        'Hamburger (1 ou 2 carnes)',
        'Cheeseburger',
        'Bacon Burger',
        'Little Burger (menor)',
        'Cajun Fries'
      ]
    },
    images: ['https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'cheesecake-factory',
    name: 'The Cheesecake Factory',
    category: 'fora-parques',
    subcategory: 'Americano',
    address: '4200 Conroy Rd, Mall at Millenia, Orlando, FL 32839',
    phone: '(407) 226-0333',
    description: 'Restaurante favorito no Mall at Millenia. Pratos grandes e deliciosos. Menu extenso com mais de 250 itens. Famoso por mais de 30 tipos de cheesecake.',
    priceRange: '$$',
    highlights: [
      'Mais de 30 cheesecakes',
      'Pratos grandes',
      'Menu extenso (250+ itens)',
      'Excelente qualidade',
      'No Mall at Millenia'
    ],
    menu: {
      mainCourses: [
        'Chicken Madeira',
        'Pasta da Vinci',
        'Factory Nachos',
        'Bang Bang Chicken & Shrimp'
      ],
      desserts: ['30+ variedades de Cheesecake']
    },
    images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'olive-garden',
    name: 'Olive Garden',
    category: 'fora-parques',
    subcategory: 'Italiano',
    address: 'Várias localizações em Orlando',
    description: 'Rede italiana com ótimo custo-benefício. Famosa pelos breadsticks ilimitados e salada. Pratos grandes e saborosos. Popular entre brasileiros.',
    priceRange: '$$',
    highlights: [
      'Breadsticks ilimitados',
      'Salada ilimitada',
      'Pratos grandes',
      'Ótimo custo-benefício',
      'Never Ending Pasta Bowl'
    ],
    menu: {
      mainCourses: [
        'Fettuccine Alfredo',
        'Lasagna Classico',
        'Chicken Parmigiana',
        'Tour of Italy',
        'Never Ending Pasta Bowl (promoção)'
      ],
      desserts: ['Tiramisu', 'Black Tie Mousse Cake']
    },
    images: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800'],
    reservations: false,
    featured: true
  },
  {
    id: 'the-ravenous-pig',
    name: 'The Ravenous Pig',
    category: 'fora-parques',
    subcategory: 'Americana Contemporânea',
    address: '565 W Fairbanks Ave, Winter Park, FL 32789',
    phone: '(407) 628-2333',
    description: 'Gastropub premiado em Winter Park. Criado por finalistas do James Beard Award. Menu sazonal com ingredientes locais. Craft beers.',
    priceRange: '$$$',
    highlights: [
      'Finalistas James Beard',
      'Menu sazonal',
      'Gastropub de alto nível',
      'Craft beers',
      'Em Winter Park'
    ],
    menu: {
      mainCourses: [
        'Seasonal dishes',
        'House-made charcuterie',
        'Local ingredients',
        'Daily specials'
      ]
    },
    images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    website: 'https://theravenouspig.com',
    reservations: true,
    featured: true
  },
  {
    id: 'red-lobster',
    name: 'Red Lobster',
    category: 'fora-parques',
    subcategory: 'Frutos do Mar',
    address: 'Várias localizações em Orlando',
    description: 'Rede especializada em frutos do mar. Famosa pelos Cheddar Bay Biscuits ilimitados. Lagosta, camarão e pratos variados de pescados.',
    priceRange: '$$',
    highlights: [
      'Cheddar Bay Biscuits ilimitados',
      'Especialista em frutos do mar',
      'Pratos de lagosta',
      'Endless Shrimp (promoção)',
      'Várias localizações'
    ],
    menu: {
      mainCourses: [
        'Lobster',
        'Endless Shrimp',
        'Crab Legs',
        'Fish & Chips',
        'Seafood Platters'
      ],
      desserts: ['Key Lime Pie']
    },
    images: ['https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800'],
    reservations: false
  },
  {
    id: 'pf-changs',
    name: "P.F. Chang's",
    category: 'fora-parques',
    subcategory: 'Asiático',
    address: 'Várias localizações em Orlando',
    description: 'Culinária pan-asiática em ambiente sofisticado. Dim sum, sushi e pratos tradicionais chineses. Lettuce Wraps famosos.',
    priceRange: '$$',
    highlights: [
      'Lettuce Wraps icônicos',
      'Culinária pan-asiática',
      'Ambiente elegante',
      'Happy hour',
      'Dim sum'
    ],
    menu: {
      mainCourses: [
        'Chang\'s Lettuce Wraps',
        'Dynamite Shrimp',
        'Mongolian Beef',
        'Kung Pao Chicken',
        'Orange Peel Chicken'
      ]
    },
    images: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'],
    reservations: true
  }
];
