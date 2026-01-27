-- Create storage bucket for itinerary tickets
INSERT INTO storage.buckets (id, name, public)
VALUES ('itinerary-tickets', 'itinerary-tickets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own tickets
CREATE POLICY "Users can upload their own tickets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'itinerary-tickets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own tickets
CREATE POLICY "Users can view their own tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'itinerary-tickets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own tickets
CREATE POLICY "Users can delete their own tickets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'itinerary-tickets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);