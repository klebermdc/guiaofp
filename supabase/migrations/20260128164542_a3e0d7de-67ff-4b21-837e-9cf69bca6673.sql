-- Add hotel_address column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hotel_address text DEFAULT '';

-- Create user_documents table for digital wallet
CREATE TABLE public.user_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_documents
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_documents
CREATE POLICY "Users can view own documents"
ON public.user_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
ON public.user_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
ON public.user_documents FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Guides can view all documents"
ON public.user_documents FOR SELECT
USING (is_guide_or_admin(auth.uid()));

-- Create storage bucket for user documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user documents bucket
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Guides can view all user documents storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-documents' 
  AND is_guide_or_admin(auth.uid())
);