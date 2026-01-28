-- Add Disney credentials columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS disney_email text DEFAULT '',
ADD COLUMN IF NOT EXISTS disney_password text DEFAULT '';