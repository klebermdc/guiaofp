-- Create categories table
CREATE TABLE public.content_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  color text DEFAULT 'gradient-primary',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories
CREATE POLICY "Anyone can view active categories"
ON public.content_categories
FOR SELECT
USING (is_active = true OR is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can insert categories"
ON public.content_categories
FOR INSERT
WITH CHECK (is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
ON public.content_categories
FOR UPDATE
USING (is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
ON public.content_categories
FOR DELETE
USING (is_guide_or_admin(auth.uid()));

-- Add category_id to content_items
ALTER TABLE public.content_items 
ADD COLUMN category_id uuid REFERENCES public.content_categories(id) ON DELETE SET NULL;

-- Trigger for updated_at
CREATE TRIGGER update_content_categories_updated_at
BEFORE UPDATE ON public.content_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();