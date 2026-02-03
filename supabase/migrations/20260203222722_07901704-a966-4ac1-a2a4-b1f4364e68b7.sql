
-- =============================================
-- V1 SECURITY HARDENING MIGRATION
-- =============================================

-- 1. Enable RLS on views (views inherit from base table, but we need to secure them)
-- Drop existing views and recreate with security barrier

DROP VIEW IF EXISTS public.profiles_guide_view;
DROP VIEW IF EXISTS public.push_subscriptions_guide_view;

-- Recreate profiles_guide_view with SECURITY INVOKER (respects caller's RLS)
CREATE VIEW public.profiles_guide_view 
WITH (security_invoker = true) AS
SELECT 
    id,
    user_id,
    responsible_name,
    email,
    whatsapp,
    group_size,
    travelers,
    arrival_date,
    departure_date,
    parks,
    hotel,
    hotel_type,
    has_transport,
    visited_before,
    last_visit,
    group_style,
    priority,
    completion_percentage,
    is_access_enabled,
    plan_tier,
    guide_name,
    park_dates,
    has_celebration,
    celebration_type,
    created_at,
    updated_at
FROM profiles;

-- Recreate push_subscriptions_guide_view with SECURITY INVOKER
CREATE VIEW public.push_subscriptions_guide_view 
WITH (security_invoker = true) AS
SELECT 
    id,
    user_id,
    created_at,
    updated_at
FROM push_subscriptions;

-- Grant access only to authenticated users
REVOKE ALL ON public.profiles_guide_view FROM anon;
REVOKE ALL ON public.push_subscriptions_guide_view FROM anon;

GRANT SELECT ON public.profiles_guide_view TO authenticated;
GRANT SELECT ON public.push_subscriptions_guide_view TO authenticated;

-- 2. Add comment to disney_password field warning about sensitivity
COMMENT ON COLUMN public.profiles.disney_password IS 
'SECURITY WARNING: This field stores Disney account password. Consider encrypting or removing in future versions.';

-- 3. Create index for better query performance on common filters
CREATE INDEX IF NOT EXISTS idx_profiles_guide_name ON public.profiles(guide_name) WHERE guide_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_arrival_date ON public.profiles(arrival_date) WHERE arrival_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
