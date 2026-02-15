-- Remove plaintext Disney credential columns from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS disney_password;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS disney_email;