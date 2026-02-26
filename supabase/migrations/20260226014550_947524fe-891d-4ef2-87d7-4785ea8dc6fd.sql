
-- Table for Top 3 Travel Mode recommendations
CREATE TABLE public.travel_mode_top3 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  park_id text NOT NULL,
  park_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('doces', 'restaurantes', 'snacks')),
  item_name text NOT NULL,
  location text NOT NULL,
  area text NOT NULL,
  price text,
  description text NOT NULL,
  emoji text NOT NULL DEFAULT '🍽️',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_mode_top3 ENABLE ROW LEVEL SECURITY;

-- Anyone can read active items
CREATE POLICY "Anyone can view active top3 items"
ON public.travel_mode_top3
FOR SELECT
USING (is_active = true OR is_guide_or_admin(auth.uid()));

-- Guides can manage
CREATE POLICY "Guides can manage top3 items"
ON public.travel_mode_top3
FOR ALL
USING (is_guide_or_admin(auth.uid()));

-- Auto-update updated_at
CREATE TRIGGER update_travel_mode_top3_updated_at
BEFORE UPDATE ON public.travel_mode_top3
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
