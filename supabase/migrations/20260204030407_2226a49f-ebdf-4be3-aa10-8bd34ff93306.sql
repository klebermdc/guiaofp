-- First drop the policies that depend on user_id
DROP POLICY IF EXISTS "Users can insert their own carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can update their own carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can view their own carts" ON public.abandoned_carts;

-- Now change user_id column from UUID to TEXT
ALTER TABLE public.abandoned_carts ALTER COLUMN user_id TYPE TEXT;

-- Recreate policies with TEXT comparison
CREATE POLICY "Users can view their own carts"
  ON public.abandoned_carts
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own carts"
  ON public.abandoned_carts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own carts"
  ON public.abandoned_carts
  FOR UPDATE
  USING (auth.uid()::text = user_id);