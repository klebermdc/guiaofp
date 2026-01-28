-- Create user_planners table
CREATE TABLE public.user_planners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_planners_user_id ON public.user_planners(user_id);
CREATE INDEX idx_user_planners_dates ON public.user_planners(start_date, end_date);

-- Enable RLS
ALTER TABLE public.user_planners ENABLE ROW LEVEL SECURITY;

-- Users can view their own planners
CREATE POLICY "Users can view own planners"
  ON public.user_planners
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own planners
CREATE POLICY "Users can insert own planners"
  ON public.user_planners
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own planners
CREATE POLICY "Users can update own planners"
  ON public.user_planners
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own planners
CREATE POLICY "Users can delete own planners"
  ON public.user_planners
  FOR DELETE
  USING (auth.uid() = user_id);

-- Guides can view all planners
CREATE POLICY "Guides can view all planners"
  ON public.user_planners
  FOR SELECT
  USING (is_guide_or_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_user_planners_updated_at
  BEFORE UPDATE ON public.user_planners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();