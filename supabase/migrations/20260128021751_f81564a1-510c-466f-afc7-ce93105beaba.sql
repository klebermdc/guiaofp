-- Create attractions table
CREATE TABLE public.attractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id UUID REFERENCES public.parks(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  area VARCHAR(100), -- área dentro do parque (ex: "Tomorrowland", "Fantasyland")
  type VARCHAR(50), -- 'ride', 'show', 'character_meet', 'dining', 'shopping'
  thrill_level VARCHAR(20), -- 'kid_friendly', 'mild', 'moderate', 'intense', 'extreme'
  height_requirement INTEGER, -- em cm, null se não tiver
  average_wait_time INTEGER, -- minutos (média)
  duration INTEGER, -- duração em minutos
  lightning_lane BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  icon VARCHAR(50), -- emoji ou nome do ícone
  tips TEXT,
  best_time_to_visit VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'night'
  popularity_score INTEGER, -- 1-10
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_attractions_park_id ON public.attractions(park_id);
CREATE INDEX idx_attractions_type ON public.attractions(type);
CREATE INDEX idx_attractions_slug ON public.attractions(slug);

-- Enable RLS
ALTER TABLE public.attractions ENABLE ROW LEVEL SECURITY;

-- Anyone can view attractions (public data)
CREATE POLICY "Anyone can view attractions"
  ON public.attractions
  FOR SELECT
  USING (true);

-- Only guides/admins can manage attractions
CREATE POLICY "Guides can manage attractions"
  ON public.attractions
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Magic Kingdom attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, duration, icon, best_time_to_visit, popularity_score, lightning_lane) VALUES
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Space Mountain', 'space-mountain', 'Tomorrowland', 'ride', 'intense', 3, '🚀', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Seven Dwarfs Mine Train', 'seven-dwarfs-mine-train', 'Fantasyland', 'ride', 'moderate', 3, '⛏️', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Pirates of the Caribbean', 'pirates-of-caribbean', 'Adventureland', 'ride', 'mild', 8, '🏴‍☠️', 'afternoon', 9, false),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Haunted Mansion', 'haunted-mansion', 'Liberty Square', 'ride', 'mild', 9, '👻', 'evening', 9, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Big Thunder Mountain Railroad', 'big-thunder-mountain', 'Frontierland', 'ride', 'moderate', 4, '🚂', 'morning', 9, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'TRON Lightcycle Run', 'tron-lightcycle', 'Tomorrowland', 'ride', 'extreme', 2, '🏍️', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Peter Pan''s Flight', 'peter-pan-flight', 'Fantasyland', 'ride', 'kid_friendly', 3, '🧚', 'morning', 9, true),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Mickey''s PhilharMagic', 'mickeys-philharmagic', 'Fantasyland', 'show', 'kid_friendly', 12, '🎬', 'afternoon', 7, false),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Monsters Inc. Laugh Floor', 'monsters-inc', 'Tomorrowland', 'show', 'kid_friendly', 15, '🎭', 'afternoon', 6, false),
((SELECT id FROM public.parks WHERE slug = 'magic-kingdom'), 'Jungle Cruise', 'jungle-cruise', 'Adventureland', 'ride', 'kid_friendly', 10, '🦁', 'afternoon', 8, true);

-- EPCOT attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, duration, icon, best_time_to_visit, popularity_score, lightning_lane, height_requirement) VALUES
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Guardians of the Galaxy: Cosmic Rewind', 'cosmic-rewind', 'World Discovery', 'ride', 'intense', 3, '🎸', 'morning', 10, true, 107),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Test Track', 'test-track', 'World Discovery', 'ride', 'moderate', 5, '🏎️', 'morning', 9, true, 102),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Frozen Ever After', 'frozen-ever-after', 'World Showcase', 'ride', 'kid_friendly', 5, '❄️', 'morning', 9, true, NULL),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Remy''s Ratatouille Adventure', 'remys-ratatouille', 'World Showcase', 'ride', 'kid_friendly', 5, '🐀', 'morning', 9, true, NULL),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Soarin'' Around the World', 'soarin', 'World Nature', 'ride', 'mild', 5, '🦅', 'afternoon', 9, true, 102),
((SELECT id FROM public.parks WHERE slug = 'epcot'), 'Spaceship Earth', 'spaceship-earth', 'World Celebration', 'ride', 'kid_friendly', 15, '🌐', 'afternoon', 8, false, NULL);

-- Hollywood Studios attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, duration, icon, best_time_to_visit, popularity_score, lightning_lane, height_requirement) VALUES
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Star Wars: Rise of the Resistance', 'rise-of-resistance', 'Galaxy''s Edge', 'ride', 'moderate', 18, '⭐', 'morning', 10, true, 102),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Millennium Falcon: Smugglers Run', 'millennium-falcon', 'Galaxy''s Edge', 'ride', 'moderate', 5, '🚀', 'afternoon', 9, true, 97),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Tower of Terror', 'tower-of-terror', 'Sunset Boulevard', 'ride', 'intense', 5, '🏨', 'morning', 10, true, 102),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Rock ''n'' Roller Coaster', 'rock-n-roller-coaster', 'Sunset Boulevard', 'ride', 'extreme', 2, '🎸', 'morning', 9, true, 122),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Slinky Dog Dash', 'slinky-dog-dash', 'Toy Story Land', 'ride', 'moderate', 2, '🐕', 'morning', 9, true, 97),
((SELECT id FROM public.parks WHERE slug = 'hollywood-studios'), 'Mickey & Minnie''s Runaway Railway', 'runaway-railway', 'Hollywood Boulevard', 'ride', 'kid_friendly', 5, '🐭', 'afternoon', 8, true, NULL);

-- Animal Kingdom attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, duration, icon, best_time_to_visit, popularity_score, lightning_lane, height_requirement) VALUES
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Avatar Flight of Passage', 'flight-of-passage', 'Pandora', 'ride', 'intense', 5, '🐉', 'morning', 10, true, 112),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Na''vi River Journey', 'navi-river', 'Pandora', 'ride', 'kid_friendly', 5, '🌿', 'evening', 8, true, NULL),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Expedition Everest', 'expedition-everest', 'Asia', 'ride', 'intense', 3, '🏔️', 'morning', 9, true, 112),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'Kilimanjaro Safaris', 'kilimanjaro-safaris', 'Africa', 'ride', 'kid_friendly', 20, '🦒', 'morning', 9, true, NULL),
((SELECT id FROM public.parks WHERE slug = 'animal-kingdom'), 'DINOSAUR', 'dinosaur', 'DinoLand', 'ride', 'moderate', 4, '🦖', 'afternoon', 7, false, 102);

-- Universal Studios attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, duration, icon, best_time_to_visit, popularity_score, lightning_lane) VALUES
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Harry Potter and the Escape from Gringotts', 'gringotts', 'Diagon Alley', 'ride', 'moderate', 5, '⚡', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'The Bourne Stuntacular', 'bourne-stuntacular', 'World Expo', 'show', 'mild', 25, '🎬', 'afternoon', 7, false),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Revenge of the Mummy', 'revenge-mummy', 'New York', 'ride', 'intense', 3, '🧟', 'morning', 9, true),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Hollywood Rip Ride Rockit', 'rip-ride-rockit', 'Production Central', 'ride', 'extreme', 2, '🎸', 'morning', 8, true),
((SELECT id FROM public.parks WHERE slug = 'universal-studios'), 'Transformers: The Ride 3D', 'transformers', 'Production Central', 'ride', 'moderate', 5, '🤖', 'afternoon', 8, true);

-- Islands of Adventure attractions
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, height_requirement, duration, icon, best_time_to_visit, popularity_score, lightning_lane) VALUES
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Hagrid''s Magical Creatures Motorbike Adventure', 'hagrids-motorbike', 'Hogsmeade', 'ride', 'moderate', 122, 5, '🏍️', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'The Incredible Hulk Coaster', 'hulk-coaster', 'Marvel Super Hero Island', 'ride', 'extreme', 137, 2, '💪', 'morning', 9, true),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Jurassic World VelociCoaster', 'velocicoaster', 'Jurassic Park', 'ride', 'extreme', 130, 2, '🦖', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'Harry Potter and the Forbidden Journey', 'forbidden-journey', 'Hogsmeade', 'ride', 'moderate', 122, 5, '⚡', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'islands-of-adventure'), 'The Amazing Adventures of Spider-Man', 'spider-man', 'Marvel Super Hero Island', 'ride', 'moderate', 102, 5, '🕷️', 'afternoon', 8, true);

-- Epic Universe attractions (new park)
INSERT INTO public.attractions (park_id, name, slug, area, type, thrill_level, height_requirement, duration, icon, best_time_to_visit, popularity_score, lightning_lane) VALUES
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'Stardust Racers', 'stardust-racers', 'Celestial Park', 'ride', 'intense', 122, 3, '✨', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'Starfall Racers', 'starfall-racers', 'Celestial Park', 'ride', 'intense', 122, 3, '🌟', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'Ministry of Magic', 'ministry-of-magic', 'Wizarding World', 'ride', 'moderate', 102, 5, '🪄', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'Mario Kart: Bowser''s Challenge', 'mario-kart', 'Super Nintendo World', 'ride', 'moderate', 107, 5, '🍄', 'morning', 10, true),
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'Donkey Kong Mine Cart Madness', 'donkey-kong-mine-cart', 'Super Nintendo World', 'ride', 'moderate', 107, 3, '🦍', 'morning', 9, true),
((SELECT id FROM public.parks WHERE slug = 'epic-universe'), 'How to Train Your Dragon', 'how-to-train-dragon', 'Isle of Berk', 'ride', 'moderate', 102, 5, '🐲', 'morning', 9, true);