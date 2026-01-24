-- Drop the existing check constraint and add 'poi' to allowed types
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_type_check;

-- Add updated check constraint that includes 'poi'
ALTER TABLE public.content_items ADD CONSTRAINT content_items_type_check 
CHECK (type IN ('video', 'document', 'link', 'image', 'attraction', 'poi'));