CREATE TABLE public.concierge_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  category_label TEXT NOT NULL,
  category_icon TEXT NOT NULL,
  category_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  brand TEXT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_concierge_places_category ON public.concierge_places(category_id, display_order);
CREATE INDEX idx_concierge_places_active ON public.concierge_places(active) WHERE active = true;

ALTER TABLE public.concierge_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active places"
  ON public.concierge_places
  FOR SELECT
  USING (active = true OR is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can manage places"
  ON public.concierge_places
  FOR ALL
  USING (is_guide_or_admin(auth.uid()))
  WITH CHECK (is_guide_or_admin(auth.uid()));

CREATE TRIGGER update_concierge_places_updated_at
  BEFORE UPDATE ON public.concierge_places
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();