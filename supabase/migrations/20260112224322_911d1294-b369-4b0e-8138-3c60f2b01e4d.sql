-- Adicionar campo guide_name na tabela contracts
ALTER TABLE public.contracts 
ADD COLUMN guide_name TEXT;