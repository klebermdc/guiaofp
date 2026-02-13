
-- Table to store park map overlay images (official park maps positioned over Google Maps)
CREATE TABLE public.park_map_overlays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  park_id TEXT NOT NULL, -- matches content_categories ID from PARKS constant
  park_name TEXT NOT NULL,
  image_url TEXT NOT NULL, -- URL to the overlay PNG image
  north DOUBLE PRECISION NOT NULL,
  south DOUBLE PRECISION NOT NULL,
  east DOUBLE PRECISION NOT NULL,
  west DOUBLE PRECISION NOT NULL,
  opacity DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.park_map_overlays ENABLE ROW LEVEL SECURITY;

-- Everyone can read overlays (public data)
CREATE POLICY "Overlays are publicly readable"
  ON public.park_map_overlays
  FOR SELECT
  USING (true);

-- Only admins can manage overlays
CREATE POLICY "Admins can manage overlays"
  ON public.park_map_overlays
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.plan_tier = 'admin'
    )
  );

-- Create storage bucket for map overlay images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('map-overlays', 'map-overlays', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for map overlay images
CREATE POLICY "Map overlay images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'map-overlays');

-- Admins can upload map overlay images
CREATE POLICY "Admins can upload map overlay images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'map-overlays'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.plan_tier = 'admin'
    )
  );

-- Admins can update map overlay images
CREATE POLICY "Admins can update map overlay images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'map-overlays'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.plan_tier = 'admin'
    )
  );

-- Admins can delete map overlay images
CREATE POLICY "Admins can delete map overlay images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'map-overlays'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.plan_tier = 'admin'
    )
  );
