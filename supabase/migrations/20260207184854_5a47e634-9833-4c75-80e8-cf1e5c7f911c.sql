
-- 1. Add missing columns to restaurants
ALTER TABLE public.restaurants 
  ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS meal_times text[] DEFAULT '{}'::text[];

-- 2. Create availability_cache table (different from availability_log)
CREATE TABLE IF NOT EXISTS public.availability_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
  date date NOT NULL,
  party_size integer DEFAULT 4,
  meal_time text,
  available_times jsonb,
  is_available boolean DEFAULT false,
  last_checked timestamptz DEFAULT now(),
  UNIQUE(restaurant_id, date, party_size, meal_time)
);

-- Index for fast lookups on available slots
CREATE INDEX IF NOT EXISTS idx_availability_cache_available 
ON public.availability_cache(restaurant_id, date) 
WHERE is_available = true;

-- Enable RLS
ALTER TABLE public.availability_cache ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read availability
CREATE POLICY "Anyone can view availability cache"
  ON public.availability_cache FOR SELECT
  USING (true);

-- Only service role / guides can manage cache
CREATE POLICY "Guides can manage availability cache"
  ON public.availability_cache FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- 3. Add notification_methods to dining_alerts
ALTER TABLE public.dining_alerts 
  ADD COLUMN IF NOT EXISTS notification_methods jsonb DEFAULT '["email"]'::jsonb;

-- 4. Cleanup function for old cache entries
CREATE OR REPLACE FUNCTION public.cleanup_old_availability()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.availability_cache 
  WHERE date < CURRENT_DATE - INTERVAL '1 day';
END;
$$;
