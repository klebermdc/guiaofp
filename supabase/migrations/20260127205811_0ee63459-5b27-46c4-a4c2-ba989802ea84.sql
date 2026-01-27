-- Create itineraries table for personalized trip plans
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Travel dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Group info
  adults_count INTEGER NOT NULL DEFAULT 1,
  children_count INTEGER NOT NULL DEFAULT 0,
  children_ages INTEGER[] DEFAULT '{}',
  
  -- Preferences
  budget_level TEXT NOT NULL DEFAULT 'moderado',
  is_first_trip BOOLEAN NOT NULL DEFAULT true,
  travel_style TEXT NOT NULL DEFAULT 'equilibrado',
  parks_interest_level TEXT NOT NULL DEFAULT 'alto',
  
  -- Additional preferences (for future questions)
  preferences JSONB DEFAULT '{}',
  
  -- Generated itinerary
  generated_itinerary JSONB DEFAULT NULL,
  generation_status TEXT DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Users can view their own itineraries
CREATE POLICY "Users can view own itineraries"
ON public.itineraries
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own itineraries
CREATE POLICY "Users can insert own itineraries"
ON public.itineraries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own itineraries
CREATE POLICY "Users can update own itineraries"
ON public.itineraries
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own itineraries
CREATE POLICY "Users can delete own itineraries"
ON public.itineraries
FOR DELETE
USING (auth.uid() = user_id);

-- Guides can view all itineraries
CREATE POLICY "Guides can view all itineraries"
ON public.itineraries
FOR SELECT
USING (is_guide_or_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_itineraries_updated_at
BEFORE UPDATE ON public.itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();