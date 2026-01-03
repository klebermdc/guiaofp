-- Create storage bucket for admin content files
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-content', 'admin-content', true);

-- Create RLS policies for storage
CREATE POLICY "Anyone can view admin content files"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-content');

CREATE POLICY "Admins can upload content files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'admin-content' AND public.is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can update content files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'admin-content' AND public.is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can delete content files"
ON storage.objects FOR DELETE
USING (bucket_id = 'admin-content' AND public.is_guide_or_admin(auth.uid()));

-- Create content items table
CREATE TABLE public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'checklist', 'tutorial', 'guide', 'image', 'other')),
    file_url TEXT,
    thumbnail_url TEXT,
    icon TEXT DEFAULT 'file',
    color TEXT DEFAULT 'gradient-primary',
    is_published BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for content_items
CREATE POLICY "Anyone can view published content"
ON public.content_items FOR SELECT
USING (is_published = true OR public.is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can insert content"
ON public.content_items FOR INSERT
WITH CHECK (public.is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can update content"
ON public.content_items FOR UPDATE
USING (public.is_guide_or_admin(auth.uid()));

CREATE POLICY "Admins can delete content"
ON public.content_items FOR DELETE
USING (public.is_guide_or_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_content_items_updated_at
BEFORE UPDATE ON public.content_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();