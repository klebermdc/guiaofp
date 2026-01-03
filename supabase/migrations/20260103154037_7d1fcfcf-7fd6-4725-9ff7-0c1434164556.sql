-- Adicionar coluna para tipo de passe nas atrações
ALTER TABLE public.content_items 
ADD COLUMN pass_type text;