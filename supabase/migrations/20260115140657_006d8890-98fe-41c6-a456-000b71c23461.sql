-- Add checklist_items column to profiles table for persisting checklist state
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS checklist_items jsonb DEFAULT '{}'::jsonb;