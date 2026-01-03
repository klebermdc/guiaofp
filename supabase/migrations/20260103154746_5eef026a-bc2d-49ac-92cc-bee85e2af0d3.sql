ALTER TABLE content_items DROP CONSTRAINT content_items_type_check;

ALTER TABLE content_items ADD CONSTRAINT content_items_type_check 
CHECK (type = ANY (ARRAY['pdf'::text, 'video'::text, 'checklist'::text, 'tutorial'::text, 'guide'::text, 'image'::text, 'other'::text, 'attraction'::text]));