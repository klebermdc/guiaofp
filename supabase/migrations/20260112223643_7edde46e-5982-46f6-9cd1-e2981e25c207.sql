-- Remover política permissiva e criar uma mais restritiva
DROP POLICY IF EXISTS "Service role can insert contracts" ON public.contracts;

-- Apenas guias/admins podem inserir contratos (via edge function com service role)
CREATE POLICY "Guides can insert contracts"
ON public.contracts FOR INSERT
WITH CHECK (is_guide_or_admin(auth.uid()));