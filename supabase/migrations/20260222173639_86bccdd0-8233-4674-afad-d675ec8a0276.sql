
-- Fix push_subscriptions: restrict guide direct access to keys
-- Guides should only access via the view, not the raw table with keys
DROP POLICY IF EXISTS "Guides can view subscription existence via view" ON public.push_subscriptions;

-- Users can only see their own subscriptions
CREATE POLICY "Users view own push subscriptions"
ON public.push_subscriptions FOR SELECT
USING (auth.uid() = user_id);
