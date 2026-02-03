-- Create terms_acceptances table for storing user consent records
CREATE TABLE public.terms_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  document_version TEXT NOT NULL DEFAULT '1.0',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can view their own acceptances
CREATE POLICY "Users can view own terms acceptances" 
ON public.terms_acceptances 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can insert acceptances (via edge function)
CREATE POLICY "Service role can insert terms acceptances" 
ON public.terms_acceptances 
FOR INSERT 
WITH CHECK (true);

-- Guides/admins can view all acceptances for audit
CREATE POLICY "Guides can view all terms acceptances" 
ON public.terms_acceptances 
FOR SELECT 
USING (is_guide_or_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_terms_acceptances_user_id ON public.terms_acceptances(user_id);
CREATE INDEX idx_terms_acceptances_transaction_id ON public.terms_acceptances(transaction_id);