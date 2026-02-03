-- Fix shop POIs: set icon to 'shop' so they appear correctly in the map
UPDATE content_items 
SET icon = 'shop'
WHERE category_id = 'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b' 
AND cuisine_type = 'shop'
AND is_published = true;