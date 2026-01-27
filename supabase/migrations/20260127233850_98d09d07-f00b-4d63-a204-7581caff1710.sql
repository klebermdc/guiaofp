-- Create storage bucket for hotel vouchers
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-vouchers', 'hotel-vouchers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own vouchers
CREATE POLICY "Users can upload their own hotel vouchers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotel-vouchers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own vouchers
CREATE POLICY "Users can view their own hotel vouchers"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'hotel-vouchers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own vouchers
CREATE POLICY "Users can delete their own hotel vouchers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotel-vouchers' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);