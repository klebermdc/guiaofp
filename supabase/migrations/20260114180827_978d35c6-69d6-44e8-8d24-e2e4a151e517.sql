-- Create table to store user attraction preferences
CREATE TABLE public.attraction_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  park_name TEXT NOT NULL,
  attraction_name TEXT NOT NULL,
  priority INTEGER DEFAULT 1, -- 1 = must do, 2 = would like, 3 = if time permits
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, park_name, attraction_name)
);

-- Enable RLS
ALTER TABLE public.attraction_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for clients (can manage their own preferences)
CREATE POLICY "Users can view own preferences"
ON public.attraction_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
ON public.attraction_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
ON public.attraction_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
ON public.attraction_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Policies for guides (can view all preferences)
CREATE POLICY "Guides can view all preferences"
ON public.attraction_preferences
FOR SELECT
USING (is_guide_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_attraction_preferences_updated_at
BEFORE UPDATE ON public.attraction_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();