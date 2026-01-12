-- Adicionar campo guide_name na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN guide_name TEXT DEFAULT '';