-- Fix remaining permissive RLS policies for service-role-only tables
-- These tables are managed by edge functions using service role (which bypasses RLS)

-- Drop the ALL policies that use WITH CHECK (true)
DROP POLICY IF EXISTS "Service role can manage daily analytics" ON public.daily_analytics;
DROP POLICY IF EXISTS "Service role can manage optimal windows" ON public.optimal_windows;