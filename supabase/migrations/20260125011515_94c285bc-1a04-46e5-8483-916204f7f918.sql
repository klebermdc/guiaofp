-- Add menu_url column to content_items for restaurant virtual menus
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS menu_url TEXT;