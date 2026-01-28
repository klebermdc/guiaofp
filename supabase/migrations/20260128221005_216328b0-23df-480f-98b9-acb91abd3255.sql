-- Create restaurant reviews table
CREATE TABLE public.restaurant_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- Enable RLS
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.restaurant_reviews
FOR SELECT
USING (true);

-- Users can create their own reviews
CREATE POLICY "Users can create own reviews"
ON public.restaurant_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.restaurant_reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.restaurant_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_restaurant_reviews_updated_at
BEFORE UPDATE ON public.restaurant_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_restaurant_reviews_restaurant_id ON public.restaurant_reviews(restaurant_id);
CREATE INDEX idx_restaurant_reviews_user_id ON public.restaurant_reviews(user_id);