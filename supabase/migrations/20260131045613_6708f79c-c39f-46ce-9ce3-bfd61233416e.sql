-- Add travel mode visibility and separate sort orders for different contexts
ALTER TABLE public.plan_page_access 
ADD COLUMN IF NOT EXISTS travel_mode_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS mobile_sort_order integer,
ADD COLUMN IF NOT EXISTS desktop_sort_order integer,
ADD COLUMN IF NOT EXISTS travel_mode_sort_order integer;

-- Initialize sort orders from existing sort_order column
UPDATE public.plan_page_access 
SET 
  mobile_sort_order = sort_order,
  desktop_sort_order = sort_order,
  travel_mode_sort_order = sort_order
WHERE mobile_sort_order IS NULL;