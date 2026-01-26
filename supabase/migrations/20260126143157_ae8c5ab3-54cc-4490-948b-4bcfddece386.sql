-- Add new columns for restaurant metadata
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS cuisine_type TEXT,
ADD COLUMN IF NOT EXISTS requires_reservation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_warning BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS warning_text TEXT;

-- Add helpful comments
COMMENT ON COLUMN public.content_items.cuisine_type IS 'Type of cuisine (e.g., Americana, Italiana, Mexicana)';
COMMENT ON COLUMN public.content_items.requires_reservation IS 'Whether the restaurant requires reservation';
COMMENT ON COLUMN public.content_items.has_warning IS 'Whether to show a warning icon';
COMMENT ON COLUMN public.content_items.warning_text IS 'Warning message to display';