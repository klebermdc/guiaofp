-- Add plan tier column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN plan_tier text NOT NULL DEFAULT 'basic';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.plan_tier IS 'User plan tier: basic (Planejador Inteligente) or premium (Roteiro com Guia)';