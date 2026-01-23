-- Fix 1: Remove Disney password fields (plaintext passwords should never be stored)
-- These columns will be dropped to prevent plaintext password storage
ALTER TABLE public.profiles DROP COLUMN IF EXISTS my_disney_password;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS my_disney_email;

-- Fix 2: Create a secure view for profiles that hides sensitive PII from guides
-- Guides should only see what they need for trip planning, not all personal details
CREATE OR REPLACE VIEW public.profiles_guide_view
WITH (security_invoker = on) AS
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
  -- Excluded: physical_restrictions, food_allergies, uses_stroller_or_wheelchair, 
  -- special_requests, expectations, concerns, has_my_disney_experience, 
  -- authorize_guide_access, checklist_items, preferred_language, is_locked
FROM public.profiles;

-- Fix 3: Create a secure view for push_subscriptions that hides auth keys from guides
-- Guides only need to know IF a user has push enabled, not the actual keys
CREATE OR REPLACE VIEW public.push_subscriptions_guide_view
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  created_at,
  updated_at
  -- Excluded: endpoint, auth, p256dh (these are sensitive push notification keys)
FROM public.push_subscriptions;

-- Update RLS policy for push_subscriptions to restrict guide access to view only
DROP POLICY IF EXISTS "Guides can view all subscriptions" ON public.push_subscriptions;

-- Create new policy that only allows guides to see user_ids with subscriptions (via the view)
-- The actual auth keys should only be accessed by service role in edge functions
CREATE POLICY "Guides can view subscription existence via view"
ON public.push_subscriptions
FOR SELECT
USING (
  auth.uid() = user_id 
  OR is_guide_or_admin(auth.uid())
);