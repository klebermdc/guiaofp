-- Create profiles table for travel data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Section 1 - Responsible Data
  responsible_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  
  -- Section 2 - Group Composition
  group_size INTEGER DEFAULT 1,
  travelers JSONB DEFAULT '[]'::jsonb,
  
  -- Section 3 - Trip Data
  arrival_date DATE,
  departure_date DATE,
  parks TEXT[] DEFAULT '{}',
  park_dates JSONB DEFAULT '[]'::jsonb,
  
  -- Section 4 - Accommodation
  hotel TEXT DEFAULT '',
  hotel_type TEXT DEFAULT '',
  has_transport BOOLEAN DEFAULT false,
  
  -- Section 5 - Group Profile
  preferred_language TEXT DEFAULT 'pt-BR',
  visited_before BOOLEAN DEFAULT false,
  last_visit TEXT DEFAULT '',
  group_style TEXT DEFAULT 'moderado',
  priority TEXT[] DEFAULT '{}',
  
  -- Section 6 - Disney App Access
  has_my_disney_experience BOOLEAN DEFAULT false,
  my_disney_email TEXT DEFAULT '',
  my_disney_password TEXT DEFAULT '',
  authorize_guide_access BOOLEAN DEFAULT false,
  
  -- Section 7 - Special Needs
  physical_restrictions TEXT DEFAULT '',
  food_allergies TEXT DEFAULT '',
  uses_stroller_or_wheelchair TEXT DEFAULT '',
  
  -- Section 8 - Celebrations
  has_celebration BOOLEAN DEFAULT false,
  celebration_type TEXT DEFAULT '',
  special_requests TEXT DEFAULT '',
  
  -- Section 9 - Expectations
  expectations TEXT DEFAULT '',
  concerns TEXT DEFAULT '',
  
  -- Meta
  completion_percentage INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();