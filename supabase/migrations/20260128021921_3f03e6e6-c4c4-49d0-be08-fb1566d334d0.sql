-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID REFERENCES public.parks(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  type VARCHAR(50), -- 'quick_service', 'table_service', 'character_dining', 'fine_dining', 'signature'
  cuisine VARCHAR(100), -- 'american', 'italian', 'asian', 'mexican', etc
  average_cost_per_person DECIMAL(10,2),
  reservation_required BOOLEAN DEFAULT false,
  character_dining BOOLEAN DEFAULT false,
  address TEXT,
  location VARCHAR(200), -- se fora de parques
  area VARCHAR(100), -- área dentro do parque
  category VARCHAR(50), -- 'disney', 'universal', 'outlet', 'external'
  color VARCHAR(20), -- cor da tag
  operating_hours JSONB,
  menu_url TEXT,
  image_url TEXT,
  description TEXT,
  tips TEXT,
  must_try TEXT, -- pratos imperdíveis
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_restaurants_park_id ON public.restaurants(park_id);
CREATE INDEX idx_restaurants_type ON public.restaurants(type);
CREATE INDEX idx_restaurants_category ON public.restaurants(category);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone can view restaurants (public data)
CREATE POLICY "Anyone can view restaurants"
  ON public.restaurants
  FOR SELECT
  USING (true);

-- Only guides/admins can manage restaurants
CREATE POLICY "Guides can manage restaurants"
  ON public.restaurants
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Magic Kingdom restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, character_dining, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Be Our Guest Restaurant', 'be-our-guest', 'table_service', 'french', 62.00, true, false, 'Fantasyland', 'disney', '#22C55E', 'Reserve com 60 dias de antecedência. Jantar é mais elaborado que almoço.', 'French Onion Soup, The Grey Stuff'),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Cinderella''s Royal Table', 'cinderellas-royal-table', 'character_dining', 'american', 85.00, true, true, 'Fantasyland', 'disney', '#22C55E', 'Experiência única dentro do castelo. Reserve no primeiro dia disponível!', 'Prime Rib, Royal Dessert'),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Liberty Tree Tavern', 'liberty-tree-tavern', 'table_service', 'american', 42.00, true, false, 'Liberty Square', 'disney', '#22C55E', 'Jantar estilo Thanksgiving o ano todo. Ótimo custo-benefício.', 'Turkey, Pot Roast'),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Skipper Canteen', 'skipper-canteen', 'table_service', 'asian', 35.00, true, false, 'Adventureland', 'disney', '#22C55E', 'Menu criativo com opções vegetarianas. Garçons fazem piadas!', 'Perkins Thai Noodles'),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Pecos Bill Tall Tale Inn', 'pecos-bill', 'quick_service', 'mexican', 15.00, false, false, 'Frontierland', 'disney', '#22C55E', 'Melhor quick service do parque. Excelente topping bar.', 'Nachos, Fajitas'),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Columbia Harbour House', 'columbia-harbour-house', 'quick_service', 'seafood', 14.00, false, false, 'Liberty Square', 'disney', '#22C55E', 'Ambiente calmo no segundo andar. Boas opções de frutos do mar.', 'Lobster Roll, Fish & Chips');

-- EPCOT restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Space 220', 'space-220', 'signature', 'american', 79.00, true, 'World Discovery', 'disney', '#22C55E', 'Experiência imersiva no espaço. Reserve logo que abrir!', 'Filet Mignon, Blue Moon Cauliflower'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Le Cellier Steakhouse', 'le-cellier', 'signature', 'steakhouse', 65.00, true, 'Canada', 'disney', '#22C55E', 'Melhor steak da Disney. Cheddar cheese soup é lendária.', 'Canadian Cheddar Soup, Filet Mignon'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'San Angel Inn', 'san-angel-inn', 'table_service', 'mexican', 40.00, true, 'Mexico', 'disney', '#22C55E', 'Jantar dentro da pirâmide mexicana. Ambiente único!', 'Mole Poblano, Tacos'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Teppan Edo', 'teppan-edo', 'table_service', 'japanese', 45.00, true, 'Japan', 'disney', '#22C55E', 'Show de teppanyaki. Divertido para famílias.', 'Filet Mignon, Shrimp'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Via Napoli', 'via-napoli', 'table_service', 'italian', 35.00, true, 'Italy', 'disney', '#22C55E', 'Melhor pizza da Disney. Fornos importados da Itália.', 'Pizza Margherita, Arancini'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Regal Eagle Smokehouse', 'regal-eagle', 'quick_service', 'bbq', 18.00, false, 'The American Adventure', 'disney', '#22C55E', 'Melhor churrasco do EPCOT. Porções generosas.', 'Brisket, Ribs'),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Les Halles Boulangerie', 'les-halles', 'quick_service', 'french', 12.00, false, 'France', 'disney', '#22C55E', 'Padaria francesa autêntica. Croissants divinos.', 'Croissant, Quiche, Eclair');

-- Hollywood Studios restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Oga''s Cantina', 'ogas-cantina', 'table_service', 'bar', 25.00, true, 'Galaxy''s Edge', 'disney', '#22C55E', 'Bar temático de Star Wars. Reserva essencial! Limite de 45 min.', 'Fuzzy Tauntaun, Jedi Mind Trick'),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Docking Bay 7', 'docking-bay-7', 'quick_service', 'galactic', 18.00, false, 'Galaxy''s Edge', 'disney', '#22C55E', 'Comida criativa com tema espacial. Porções grandes.', 'Fried Endorian Tip-Yip, Ronto Wrap'),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), '50''s Prime Time Cafe', '50s-prime-time', 'table_service', 'american', 28.00, true, 'Echo Lake', 'disney', '#22C55E', 'Ambiente nostálgico. Garçons brincam como família.', 'Fried Chicken, Pot Roast, PB&J Shake'),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Woody''s Lunch Box', 'woodys-lunch-box', 'quick_service', 'american', 14.00, false, 'Toy Story Land', 'disney', '#22C55E', 'Sanduíches criativos e totchos famosos.', 'Totchos, Grilled Cheese');

-- Animal Kingdom restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Satu''li Canteen', 'satuli-canteen', 'quick_service', 'bowls', 18.00, false, 'Pandora', 'disney', '#22C55E', 'Melhor quick service da Disney! Bowls customizáveis.', 'Cheeseburger Pods, Blueberry Cheesecake'),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Yak & Yeti', 'yak-and-yeti', 'table_service', 'asian', 32.00, true, 'Asia', 'disney', '#22C55E', 'Fusão asiática excelente. Ambiente temático.', 'Ahi Tuna Nachos, Lo Mein'),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Flame Tree Barbecue', 'flame-tree-bbq', 'quick_service', 'bbq', 16.00, false, 'Discovery Island', 'disney', '#22C55E', 'Vista para o rio. Melhor BBQ dos parques.', 'Ribs, Pulled Pork'),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Tusker House', 'tusker-house', 'character_dining', 'african', 55.00, true, 'Africa', 'disney', '#22C55E', 'Café com personagens. Buffet africano único.', 'Bobotie, Peri-Peri Chicken');

-- Universal Studios restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'The Leaky Cauldron', 'leaky-cauldron', 'quick_service', 'british', 18.00, false, 'Diagon Alley', 'universal', '#3B82F6', 'Café da manhã inglês autêntico. Experimente a Butterbeer!', 'Fish & Chips, Butterbeer'),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Finnegan''s Bar & Grill', 'finnegans', 'table_service', 'irish', 28.00, false, 'New York', 'universal', '#3B82F6', 'Pub irlandês com música ao vivo.', 'Scotch Eggs, Fish & Chips'),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Lombard''s Seafood Grille', 'lombards', 'table_service', 'seafood', 35.00, true, 'San Francisco', 'universal', '#3B82F6', 'Vista para a lagoa. Reserva recomendada.', 'Clam Chowder, Lobster Roll');

-- Islands of Adventure restaurants
INSERT INTO public.restaurants (park_id, name, slug, type, cuisine, average_cost_per_person, reservation_required, area, category, color, tips, must_try) VALUES
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Three Broomsticks', 'three-broomsticks', 'quick_service', 'british', 18.00, false, 'Hogsmeade', 'universal', '#3B82F6', 'Ambiente mágico de Hogwarts. Butterbeer gelada!', 'Great Feast, Butterbeer'),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Mythos Restaurant', 'mythos', 'table_service', 'mediterranean', 40.00, true, 'The Lost Continent', 'universal', '#3B82F6', 'Já foi eleito melhor restaurante de parque temático.', 'Pad Thai, Mediterranean Pasta'),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Confisco Grille', 'confisco-grille', 'table_service', 'american', 28.00, false, 'Port of Entry', 'universal', '#3B82F6', 'Bom café da manhã. Menu variado.', 'Burgers, Pad Thai');

-- CityWalk restaurants (sem park_id)
INSERT INTO public.restaurants (name, slug, type, cuisine, average_cost_per_person, reservation_required, location, category, color, tips, must_try) VALUES
('Toothsome Chocolate Emporium', 'toothsome', 'table_service', 'american', 35.00, false, 'CityWalk', 'universal', '#3B82F6', 'Milkshakes enormes! Steampunk theme.', 'Milkshakes, Steak'),
('Vivo Italian Kitchen', 'vivo-italian', 'table_service', 'italian', 30.00, true, 'CityWalk', 'universal', '#3B82F6', 'Italiano autêntico. Ótimas massas.', 'Pasta, Tiramisu'),
('The Cowfish', 'cowfish', 'table_service', 'sushi-burger', 28.00, false, 'CityWalk', 'universal', '#3B82F6', 'Fusão única de sushi e hamburger.', 'Burgushi, Prime Time Burger');

-- Disney Springs restaurants (sem park_id)
INSERT INTO public.restaurants (name, slug, type, cuisine, average_cost_per_person, reservation_required, location, category, color, tips, must_try) VALUES
('Morimoto Asia', 'morimoto-asia', 'signature', 'asian', 50.00, true, 'Disney Springs', 'disney', '#22C55E', 'Do Iron Chef Morimoto. Excelente!', 'Peking Duck, Ribs'),
('The Boathouse', 'boathouse', 'signature', 'seafood', 55.00, true, 'Disney Springs', 'disney', '#22C55E', 'Vista para o lago. Passeios de barco disponíveis.', 'Lobster, Filet Mignon'),
('Wine Bar George', 'wine-bar-george', 'table_service', 'american', 45.00, true, 'Disney Springs', 'disney', '#22C55E', 'Master Sommelier. Excelente carta de vinhos.', 'Cheese Board, Skirt Steak'),
('Chef Art Smith''s Homecomin''', 'homecomin', 'table_service', 'southern', 35.00, true, 'Disney Springs', 'disney', '#22C55E', 'Comida sulista autêntica. Thigh High Chicken é lendário.', 'Fried Chicken, Church Lady Cake'),
('Jaleo', 'jaleo', 'signature', 'spanish', 55.00, true, 'Disney Springs', 'disney', '#22C55E', 'Do chef José Andrés. Tapas espetaculares.', 'Paella, Jamón Ibérico');