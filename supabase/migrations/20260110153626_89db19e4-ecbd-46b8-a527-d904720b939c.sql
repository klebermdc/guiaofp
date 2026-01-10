-- Add latitude and longitude columns to content_items for map functionality
ALTER TABLE public.content_items 
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.content_items.latitude IS 'GPS latitude coordinate for map display';
COMMENT ON COLUMN public.content_items.longitude IS 'GPS longitude coordinate for map display';