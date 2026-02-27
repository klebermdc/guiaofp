
-- Cache entries table for intelligent caching
CREATE TABLE public.cache_entries (
  key text PRIMARY KEY,
  data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read cache (public data)
CREATE POLICY "Anyone can read cache" ON public.cache_entries
  FOR SELECT USING (true);

-- Authenticated users can insert/update cache
CREATE POLICY "Authenticated users can write cache" ON public.cache_entries
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cache" ON public.cache_entries
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Index for expiration cleanup
CREATE INDEX idx_cache_entries_expires_at ON public.cache_entries (expires_at);

-- Cleanup function for expired entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.cache_entries WHERE expires_at < now();
END;
$$;
