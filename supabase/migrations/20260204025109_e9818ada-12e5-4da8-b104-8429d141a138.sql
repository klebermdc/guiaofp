-- Create tracking_config table for storing analytics IDs
CREATE TABLE public.tracking_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracking_config ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (needed for frontend to load tracking scripts)
CREATE POLICY "Anyone can read tracking config"
  ON public.tracking_config
  FOR SELECT
  USING (true);

-- Only admins can modify
CREATE POLICY "Only admins can insert tracking config"
  ON public.tracking_config
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update tracking config"
  ON public.tracking_config
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete tracking config"
  ON public.tracking_config
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_tracking_config_updated_at
  BEFORE UPDATE ON public.tracking_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tracking keys
INSERT INTO public.tracking_config (config_key, config_value, description) VALUES
  ('ga4_measurement_id', '', 'Google Analytics 4 Measurement ID (ex: G-XXXXXXXXXX)'),
  ('fb_pixel_id', '', 'Facebook Pixel ID (ex: 1234567890123456)'),
  ('gtm_container_id', '', 'Google Tag Manager Container ID (ex: GTM-XXXXXXX)');