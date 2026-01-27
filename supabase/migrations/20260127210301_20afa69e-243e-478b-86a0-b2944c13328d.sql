-- Add new columns to itineraries table
ALTER TABLE public.itineraries 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS destination text DEFAULT 'Orlando',
ADD COLUMN IF NOT EXISTS total_days integer GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
ADD COLUMN IF NOT EXISTS travelers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS questionnaire_answers jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS estimated_budget numeric,
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- Migrate existing data to new structure
UPDATE public.itineraries
SET 
  travelers = jsonb_build_object(
    'adults_count', adults_count,
    'children_count', children_count,
    'children_ages', children_ages
  ),
  questionnaire_answers = jsonb_build_object(
    'budget_level', budget_level,
    'is_first_trip', is_first_trip,
    'travel_style', travel_style,
    'parks_interest_level', parks_interest_level,
    'preferences', preferences
  )
WHERE travelers = '[]'::jsonb;

-- Drop old columns that are now in jsonb
ALTER TABLE public.itineraries
DROP COLUMN IF EXISTS adults_count,
DROP COLUMN IF EXISTS children_count,
DROP COLUMN IF EXISTS children_ages,
DROP COLUMN IF EXISTS budget_level,
DROP COLUMN IF EXISTS is_first_trip,
DROP COLUMN IF EXISTS travel_style,
DROP COLUMN IF EXISTS parks_interest_level,
DROP COLUMN IF EXISTS preferences,
DROP COLUMN IF EXISTS generated_at,
DROP COLUMN IF EXISTS generation_status;

-- RLS policies already exist, but let's ensure they cover all CRUD operations
DROP POLICY IF EXISTS "Users can view own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can insert own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can update own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can delete own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Guides can view all itineraries" ON public.itineraries;

CREATE POLICY "Users can view own itineraries" 
ON public.itineraries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own itineraries" 
ON public.itineraries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own itineraries" 
ON public.itineraries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own itineraries" 
ON public.itineraries FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Guides can view all itineraries" 
ON public.itineraries FOR SELECT 
USING (public.is_guide_or_admin(auth.uid()));