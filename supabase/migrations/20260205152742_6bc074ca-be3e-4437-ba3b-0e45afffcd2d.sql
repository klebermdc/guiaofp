-- Table for partner coupons
CREATE TABLE public.partner_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coupon_code TEXT,
  partner_name TEXT NOT NULL,
  partner_logo_url TEXT,
  location TEXT,
  address TEXT,
  website_url TEXT,
  discount_value TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_coupons ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active coupons
CREATE POLICY "Authenticated users can view active coupons"
  ON public.partner_coupons
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- Guides/admins can manage all coupons
CREATE POLICY "Guides can manage partner coupons"
  ON public.partner_coupons
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_partner_coupons_updated_at
  BEFORE UPDATE ON public.partner_coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for public read
CREATE POLICY "Public can view partner logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'partner-logos');

-- Storage policy for admin upload
CREATE POLICY "Guides can upload partner logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'partner-logos' AND is_guide_or_admin(auth.uid()));

-- Storage policy for admin delete
CREATE POLICY "Guides can delete partner logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'partner-logos' AND is_guide_or_admin(auth.uid()));