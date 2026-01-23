-- Create discount coupons table
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL DEFAULT 0,
  min_amount_cents INTEGER DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  applicable_plans TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active coupons by code"
ON public.discount_coupons
FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Guides can manage coupons"
ON public.discount_coupons
FOR ALL
USING (is_guide_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_discount_coupons_updated_at
BEFORE UPDATE ON public.discount_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add coupon reference to transactions
ALTER TABLE public.transactions 
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount_cents INTEGER DEFAULT 0;