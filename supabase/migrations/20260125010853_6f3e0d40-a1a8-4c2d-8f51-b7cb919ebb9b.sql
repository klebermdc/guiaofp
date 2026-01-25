-- Add restaurantes page to plan_page_access
INSERT INTO plan_page_access (page_key, page_name, page_icon, basic_visible, premium_visible, sort_order)
VALUES ('restaurantes', 'Restaurantes', 'UtensilsCrossed', true, true, 85)
ON CONFLICT (page_key) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  page_icon = EXCLUDED.page_icon,
  sort_order = EXCLUDED.sort_order;