-- Create transactions table for tracking payment history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  plan_key TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'pix', 'boleto', 'credit_card'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed', 'cancelled', 'refunded'
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  asaas_invoice_url TEXT,
  asaas_pix_qr_code TEXT,
  asaas_pix_payload TEXT,
  asaas_boleto_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow insert from edge functions (service role) - no auth context
CREATE POLICY "Service role can insert transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (true);

-- Allow update from edge functions (service role)
CREATE POLICY "Service role can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (true);

-- Admins and guides can view all transactions
CREATE POLICY "Admins and guides can view all transactions"
  ON public.transactions
  FOR SELECT
  USING (public.is_guide_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();