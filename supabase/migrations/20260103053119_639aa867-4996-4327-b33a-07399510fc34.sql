-- Add attraction technical sheet fields to content_items
ALTER TABLE public.content_items
ADD COLUMN attraction_name text,
ADD COLUMN attraction_description text,
ADD COLUMN min_height text,
ADD COLUMN thrill_level integer CHECK (thrill_level >= 1 AND thrill_level <= 5);