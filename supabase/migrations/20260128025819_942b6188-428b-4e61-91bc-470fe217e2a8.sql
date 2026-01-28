-- Add Planejador Manual to plan_page_access table
INSERT INTO public.plan_page_access (page_key, page_name, page_icon, basic_visible, premium_visible, sort_order)
VALUES ('planner_manual', 'Planejador Manual', 'Calendar', true, true, 115)
ON CONFLICT (page_key) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  page_icon = EXCLUDED.page_icon,
  basic_visible = EXCLUDED.basic_visible,
  premium_visible = EXCLUDED.premium_visible,
  sort_order = EXCLUDED.sort_order;