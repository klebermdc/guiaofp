-- Add policy for viewing own documents (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can view own documents'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view own documents"
        ON storage.objects FOR SELECT
        USING (bucket_id = ''user-documents'' AND auth.uid()::text = (storage.foldername(name))[1])';
    END IF;
END $$;