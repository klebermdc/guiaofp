-- Create table for marker icon configuration
CREATE TABLE public.marker_icon_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poi_type TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  fallback_emoji TEXT NOT NULL DEFAULT '📍',
  marker_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marker_icon_config ENABLE ROW LEVEL SECURITY;

-- Anyone can view marker configs
CREATE POLICY "Anyone can view marker configs"
ON public.marker_icon_config
FOR SELECT
USING (true);

-- Guides can manage marker configs
CREATE POLICY "Guides can manage marker configs"
ON public.marker_icon_config
FOR ALL
USING (is_guide_or_admin(auth.uid()));

-- Insert default configurations
INSERT INTO public.marker_icon_config (poi_type, fallback_emoji, marker_color) VALUES
  ('restaurant', '🍽️', '#f97316'),
  ('shop', '🛍️', '#8b5cf6'),
  ('restroom', '🚻', '#0ea5e9'),
  ('first_aid', '🏥', '#ef4444'),
  ('show', '🎭', '#ec4899');

-- Trigger for updated_at
CREATE TRIGGER update_marker_icon_config_updated_at
BEFORE UPDATE ON public.marker_icon_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();