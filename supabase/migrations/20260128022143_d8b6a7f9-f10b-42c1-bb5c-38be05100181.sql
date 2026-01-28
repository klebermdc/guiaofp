-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(50), -- 'nature', 'sports', 'entertainment', 'cultural', 'relaxation'
  type VARCHAR(50), -- 'beach', 'spring', 'golf', 'show', 'spa', etc
  color VARCHAR(20), -- cor da tag
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  duration INTEGER, -- em minutos
  cost DECIMAL(10,2),
  description TEXT,
  image_url TEXT,
  tips TEXT,
  website_url TEXT,
  reservation_required BOOLEAN DEFAULT false,
  best_time VARCHAR(100), -- melhor época/horário para visitar
  distance_from_parks VARCHAR(50), -- distância aproximada dos parques
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activities_category ON public.activities(category);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_slug ON public.activities(slug);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Anyone can view activities (public data)
CREATE POLICY "Anyone can view activities"
  ON public.activities
  FOR SELECT
  USING (true);

-- Only guides/admins can manage activities
CREATE POLICY "Guides can manage activities"
  ON public.activities
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Cultural / Museums
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks, reservation_required) VALUES
('Kennedy Space Center', 'kennedy-space-center', 'cultural', 'museum', '#10B981', 360, 75.00, 
 'Space Commerce Way, Merritt Island, FL 32953', 
 'Reserve o dia inteiro. Almoce no Rocket Garden. O tour ao Launch Pad é imperdível!', '1 hora', true),
('ICON Park Orlando', 'icon-park', 'entertainment', 'attraction', '#F59E0B', 120, 28.00,
 '8375 International Drive, Orlando, FL 32819',
 'The Wheel (roda gigante) tem vista incrível ao pôr do sol. Combo com Sea Life e Madame Tussauds.', '10 minutos', false),
('Fun Spot America', 'fun-spot-orlando', 'entertainment', 'theme_park', '#EF4444', 180, 54.99,
 '5700 Fun Spot Way, Orlando, FL 32819',
 'Montanhas-russas Go-Karts ilimitados. Bom para dia de descanso dos parques grandes.', '15 minutos', false),
('WonderWorks', 'wonderworks', 'entertainment', 'museum', '#8B5CF6', 150, 34.99,
 '9067 International Drive, Orlando, FL 32819',
 'Museu interativo de ciências. Ótimo para crianças. Prédio de cabeça pra baixo!', '10 minutos', false);

-- Nature / Beaches
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks, best_time) VALUES
('Clearwater Beach', 'clearwater-beach', 'nature', 'beach', '#06B6D4', 240, 0.00,
 'Clearwater Beach, FL',
 'Melhor praia da Flórida! Areia branca e água cristalina. Pier 60 ao pôr do sol é mágico.', '1h30 de carro', 'Manhã cedo ou final de tarde'),
('Cocoa Beach', 'cocoa-beach', 'nature', 'beach', '#06B6D4', 240, 0.00,
 'Cocoa Beach, FL',
 'Praia do surfe! Combine com visita ao Kennedy Space Center. Ron Jon Surf Shop é icônica.', '1 hora', 'Qualquer horário'),
('New Smyrna Beach', 'new-smyrna-beach', 'nature', 'beach', '#06B6D4', 240, 0.00,
 'New Smyrna Beach, FL',
 'Menos turística, mais local. Pode dirigir na praia! Cuidado: capital mundial de ataques de tubarão.', '1 hora', 'Manhã'),
('Blue Spring State Park', 'blue-spring', 'nature', 'spring', '#22D3EE', 180, 6.00,
 '2100 W French Ave, Orange City, FL 32763',
 'Peixes-boi no inverno (Nov-Mar)! Águas cristalinas 22°C o ano todo. Chegue cedo.', '45 minutos', 'Nov-Mar para peixes-boi'),
('Rock Springs at Kelly Park', 'rock-springs', 'nature', 'spring', '#22D3EE', 180, 5.00,
 '400 E Kelly Park Rd, Apopka, FL 32712',
 'Tubing no rio! Água gelada e cristalina. Leve boia ou alugue lá. Lota rápido nos fins de semana.', '40 minutos', 'Chegue antes das 9h');

-- Wildlife / Nature
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks) VALUES
('Gatorland', 'gatorland', 'nature', 'zoo', '#84CC16', 180, 32.99,
 '14501 S Orange Blossom Trail, Orlando, FL 32837',
 'Capital mundial dos jacarés! Zip line sobre os gators. Show de jacarés imperdível.', '20 minutos'),
('Wild Florida Airboats', 'wild-florida', 'nature', 'airboat', '#84CC16', 120, 54.00,
 '3301 Lake Cypress Rd, Kenansville, FL 34739',
 'Passeio de airboat nos Everglades. Veja jacarés selvagens! Drive-thru safari incluso.', '45 minutos'),
('Boggy Creek Airboat Adventures', 'boggy-creek', 'nature', 'airboat', '#84CC16', 90, 35.95,
 '2001 E Southport Rd, Kissimmee, FL 34746',
 'Airboat mais próximo de Orlando. Passeios de 30 ou 60 min. Jacarés garantidos!', '25 minutos');

-- Entertainment / Shows
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks, reservation_required) VALUES
('Medieval Times', 'medieval-times', 'entertainment', 'dinner_show', '#DC2626', 120, 69.95,
 '4510 W Vine St, Kissimmee, FL 34746',
 'Jantar + show medieval com cavaleiros! Crianças amam. Peça upgrade para VIP.', '15 minutos', true),
('Sleuths Mystery Dinner Shows', 'sleuths-mystery', 'entertainment', 'dinner_show', '#7C3AED', 150, 69.95,
 '8267 International Dr, Orlando, FL 32819',
 'Jantar com mistério interativo. Você ajuda a resolver o crime!', '10 minutos', true),
('Pirate''s Dinner Adventure', 'pirates-dinner', 'entertainment', 'dinner_show', '#F97316', 150, 79.95,
 '6400 Carrier Dr, Orlando, FL 32819',
 'Show de piratas com acrobacias! Jantar incluso. Interativo para crianças.', '15 minutos', true),
('TopGolf Orlando', 'topgolf-orlando', 'sports', 'golf', '#10B981', 120, 35.00,
 '9295 Universal Blvd, Orlando, FL 32819',
 'Driving range high-tech com jogos. Não precisa saber jogar golfe! Ótima comida e drinks.', '5 minutos', false);

-- Relaxation / Spa
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks, reservation_required) VALUES
('Disney''s Grand Floridian Spa', 'grand-floridian-spa', 'relaxation', 'spa', '#EC4899', 120, 175.00,
 'Disney''s Grand Floridian Resort, Lake Buena Vista, FL',
 'Spa de luxo Disney. Tratamentos temáticos. Reserve com antecedência!', 'Dentro da Disney', true),
('The Ritz-Carlton Spa Orlando', 'ritz-carlton-spa', 'relaxation', 'spa', '#EC4899', 120, 200.00,
 '4012 Central Florida Parkway, Orlando, FL 32837',
 'Spa 5 estrelas. Rooftop pool. Tratamentos exclusivos.', '15 minutos', true);

-- Day Trips
INSERT INTO public.activities (name, slug, category, type, color, duration, cost, address, tips, distance_from_parks, best_time) VALUES
('St. Augustine (Day Trip)', 'st-augustine', 'cultural', 'day_trip', '#A855F7', 480, 0.00,
 'St. Augustine, FL',
 'Cidade mais antiga dos EUA! Castillo de San Marcos, St. George Street, Lightner Museum.', '2 horas', 'Qualquer dia'),
('Tampa (Day Trip)', 'tampa-day-trip', 'cultural', 'day_trip', '#A855F7', 480, 0.00,
 'Tampa, FL',
 'Busch Gardens, aquário, Ybor City. Combine com Clearwater Beach!', '1h15', 'Fim de semana'),
('Everglades National Park', 'everglades', 'nature', 'national_park', '#16A34A', 360, 30.00,
 'Everglades National Park, FL',
 'Passeio de airboat, caminhadas, vida selvagem. Leve repelente! Melhor na estação seca.', '4 horas', 'Dez-Abr (estação seca)');