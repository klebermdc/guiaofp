-- Create abandoned_carts table for cart recovery system
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  cart_type TEXT NOT NULL CHECK (cart_type IN ('tickets', 'hotels', 'car_rentals', 'mixed')),
  total_value_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'recovered', 'expired', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  abandoned_at TIMESTAMPTZ,
  recovery_attempts INTEGER NOT NULL DEFAULT 0,
  last_recovery_email_at TIMESTAMPTZ,
  recovered_at TIMESTAMPTZ,
  recovery_coupon_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for efficient queries
CREATE INDEX idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_abandoned_at ON public.abandoned_carts(abandoned_at);
CREATE INDEX idx_abandoned_carts_last_activity ON public.abandoned_carts(last_activity_at);

-- Enable Row Level Security
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own carts
CREATE POLICY "Users can view their own carts"
ON public.abandoned_carts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own carts"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own carts"
ON public.abandoned_carts
FOR UPDATE
USING (auth.uid() = user_id);

-- Guides and admins can view all carts for analytics
CREATE POLICY "Guides can view all carts"
ON public.abandoned_carts
FOR SELECT
USING (public.is_guide_or_admin(auth.uid()));

-- Create function to auto-mark carts as abandoned after 24 hours
CREATE OR REPLACE FUNCTION public.mark_abandoned_carts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.abandoned_carts
  SET 
    status = 'abandoned',
    abandoned_at = now()
  WHERE 
    status = 'active'
    AND last_activity_at < now() - interval '24 hours'
    AND total_value_cents > 0;
END;
$$;

-- Create trigger to update last_activity_at on cart changes
CREATE OR REPLACE FUNCTION public.update_cart_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_abandoned_cart_activity
BEFORE UPDATE ON public.abandoned_carts
FOR EACH ROW
WHEN (OLD.cart_items IS DISTINCT FROM NEW.cart_items OR OLD.total_value_cents IS DISTINCT FROM NEW.total_value_cents)
EXECUTE FUNCTION public.update_cart_activity();