-- Criar tabela de contratos
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  external_contract_id TEXT, -- ID do contrato vindo do sistema externo
  parks JSONB NOT NULL DEFAULT '[]', -- Array com parques e datas
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own contracts"
ON public.contracts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Guides can view all contracts"
ON public.contracts FOR SELECT
USING (is_guide_or_admin(auth.uid()));

CREATE POLICY "Service role can insert contracts"
ON public.contracts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update contracts"
ON public.contracts FOR UPDATE
USING (is_guide_or_admin(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();