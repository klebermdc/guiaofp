
-- Add Disney Springs to content_categories (for map POIs)
INSERT INTO content_categories (id, name, description, color, icon, is_active, sort_order)
VALUES (
  'e7d4a3b1-8c5f-4e2a-9d6b-3f1a2c5e8d7b',
  'Disney Springs',
  'Área de compras, restaurantes e entretenimento da Disney',
  '#7C3AED',
  'ShoppingBag',
  true,
  10
);

-- Add Disney Springs to parks table (for restaurant FK)
INSERT INTO parks (id, name, slug, category, color, description)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-123456789abc',
  'Disney Springs',
  'disney-springs',
  'disney',
  '#7C3AED',
  'Área de compras, restaurantes e entretenimento da Disney World'
);
