-- Create parks table
CREATE TABLE public.parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'theme_park', 'water_park', 'other'
  color VARCHAR(20) NOT NULL, -- cor hex para tags
  logo_url TEXT,
  description TEXT,
  address TEXT,
  operating_hours JSONB, -- {"monday": "09:00-22:00", ...}
  typical_visit_duration INTEGER, -- em horas
  average_cost DECIMAL(10,2),
  official_website TEXT,
  early_entry BOOLEAN DEFAULT false,
  extended_hours BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.parks ENABLE ROW LEVEL SECURITY;

-- Anyone can view parks (public data)
CREATE POLICY "Anyone can view parks"
  ON public.parks
  FOR SELECT
  USING (true);

-- Only guides/admins can manage parks
CREATE POLICY "Guides can manage parks"
  ON public.parks
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Insert initial parks data
INSERT INTO public.parks (name, slug, category, color, typical_visit_duration, average_cost) VALUES
('Magic Kingdom', 'magic-kingdom', 'theme_park', '#22C55E', 12, 159.00),
('EPCOT', 'epcot', 'theme_park', '#22C55E', 10, 159.00),
('Hollywood Studios', 'hollywood-studios', 'theme_park', '#22C55E', 10, 159.00),
('Animal Kingdom', 'animal-kingdom', 'theme_park', '#22C55E', 10, 159.00),
('Universal Studios', 'universal-studios', 'theme_park', '#3B82F6', 10, 154.00),
('Islands of Adventure', 'islands-of-adventure', 'theme_park', '#3B82F6', 10, 154.00),
('Epic Universe', 'epic-universe', 'theme_park', '#3B82F6', 10, 154.00),
('Volcano Bay', 'volcano-bay', 'water_park', '#3B82F6', 8, 89.00),
('SeaWorld', 'seaworld', 'theme_park', '#06B6D4', 8, 99.00),
('Busch Gardens', 'busch-gardens', 'theme_park', '#F59E0B', 10, 99.00),
('Legoland', 'legoland', 'theme_park', '#EAB308', 8, 89.00),
('Discovery Cove', 'discovery-cove', 'theme_park', '#14B8A6', 8, 179.00);