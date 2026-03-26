-- Revoke INSERT on user_roles for anon (defense-in-depth)
REVOKE INSERT ON public.user_roles FROM anon;

-- Restrict discount_coupons to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active coupons by code" ON public.discount_coupons;
CREATE POLICY "Authenticated can view active coupons"
  ON public.discount_coupons
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Restrict tracking_config to authenticated users only
DROP POLICY IF EXISTS "Anyone can read tracking config" ON public.tracking_config;
CREATE POLICY "Authenticated can read tracking config"
  ON public.tracking_config
  FOR SELECT
  TO authenticated
  USING (true);