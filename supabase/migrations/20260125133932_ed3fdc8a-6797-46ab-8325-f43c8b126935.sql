-- Add schedule column for shows and character meets
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS schedule text;

-- Add a comment explaining the column usage
COMMENT ON COLUMN public.content_items.schedule IS 'Operating hours or show times for POIs (e.g., "10:00, 14:00, 18:00" or "9:00 - 17:00")';