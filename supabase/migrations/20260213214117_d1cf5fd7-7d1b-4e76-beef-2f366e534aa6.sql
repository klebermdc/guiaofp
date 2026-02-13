
-- Add AI validation columns to user_documents
ALTER TABLE public.user_documents
  ADD COLUMN IF NOT EXISTS ai_validation_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ai_validation_message text,
  ADD COLUMN IF NOT EXISTS ai_extracted_dates jsonb,
  ADD COLUMN IF NOT EXISTS ai_validated_at timestamp with time zone;

-- Add comment for clarity
COMMENT ON COLUMN public.user_documents.ai_validation_status IS 'pending, valid, warning, error';
COMMENT ON COLUMN public.user_documents.ai_validation_message IS 'Human-readable validation result message';
COMMENT ON COLUMN public.user_documents.ai_extracted_dates IS 'Dates extracted from the document by AI';
