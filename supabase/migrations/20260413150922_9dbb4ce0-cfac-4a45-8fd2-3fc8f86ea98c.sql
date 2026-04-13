
CREATE TABLE public.concierge_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address_normalized TEXT NOT NULL UNIQUE,
  address_original TEXT NOT NULL,
  recommendations JSONB NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_concierge_cache_address ON public.concierge_cache (address_normalized);
CREATE INDEX idx_concierge_cache_expires ON public.concierge_cache (expires_at);

-- Enable RLS
ALTER TABLE public.concierge_cache ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can read concierge cache"
ON public.concierge_cache
FOR SELECT
TO public
USING (true);

-- Deny client writes (only service_role can write)
CREATE POLICY "Deny client inserts on concierge_cache"
ON public.concierge_cache
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Deny client updates on concierge_cache"
ON public.concierge_cache
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny client deletes on concierge_cache"
ON public.concierge_cache
FOR DELETE
TO anon, authenticated
USING (false);

-- Auto-update updated_at
CREATE TRIGGER update_concierge_cache_updated_at
BEFORE UPDATE ON public.concierge_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
