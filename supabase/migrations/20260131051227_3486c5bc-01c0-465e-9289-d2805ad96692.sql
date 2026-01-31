-- Add column to control which items appear in bottom navigation
ALTER TABLE public.plan_page_access 
ADD COLUMN show_in_bottom_nav boolean DEFAULT false;

-- Set current bottom nav items as default
UPDATE public.plan_page_access 
SET show_in_bottom_nav = true 
WHERE page_key IN ('dashboard', 'perfil', 'multipass', 'agenda');