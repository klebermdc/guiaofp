-- Make user-documents bucket public so documents can be viewed
UPDATE storage.buckets SET public = true WHERE id = 'user-documents';