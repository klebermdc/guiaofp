-- Drop the old cart_type check constraint
ALTER TABLE public.abandoned_carts DROP CONSTRAINT abandoned_carts_cart_type_check;

-- Add new constraint that includes plan types
ALTER TABLE public.abandoned_carts ADD CONSTRAINT abandoned_carts_cart_type_check 
CHECK (cart_type = ANY (ARRAY['tickets'::text, 'hotels'::text, 'car_rentals'::text, 'mixed'::text, 'basic'::text, 'premium'::text, 'plan'::text]));