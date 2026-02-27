
-- Add restaurant_id column to travel_mode_top3 to link items with restaurants table
ALTER TABLE public.travel_mode_top3 
ADD COLUMN restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_travel_mode_top3_restaurant_id ON public.travel_mode_top3(restaurant_id);

-- Populate restaurant_id for items that match by exact name
UPDATE public.travel_mode_top3 t
SET restaurant_id = r.id
FROM public.restaurants r
WHERE LOWER(r.name) = LOWER(t.location)
AND t.restaurant_id IS NULL;

-- Also try matching where location contains the restaurant name or vice versa
UPDATE public.travel_mode_top3 t
SET restaurant_id = r.id
FROM public.restaurants r
WHERE (LOWER(r.name) LIKE '%' || LOWER(t.location) || '%' OR LOWER(t.location) LIKE '%' || LOWER(r.name) || '%')
AND t.restaurant_id IS NULL;
