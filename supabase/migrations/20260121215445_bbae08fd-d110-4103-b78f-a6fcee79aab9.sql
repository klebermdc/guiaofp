-- Create table for page access configuration per plan tier
CREATE TABLE public.plan_page_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  page_name text NOT NULL,
  page_icon text DEFAULT 'file',
  basic_visible boolean DEFAULT true,
  premium_visible boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_page_access ENABLE ROW LEVEL SECURITY;

-- Only guides/admins can manage
CREATE POLICY "Guides can manage page access" ON public.plan_page_access
FOR ALL USING (is_guide_or_admin(auth.uid()));

-- All authenticated users can view (needed to check access)
CREATE POLICY "Authenticated users can view page access" ON public.plan_page_access
FOR SELECT USING (auth.role() = 'authenticated');

-- Insert default pages
INSERT INTO public.plan_page_access (page_key, page_name, page_icon, basic_visible, premium_visible, sort_order) VALUES
('dashboard', 'Dashboard', 'LayoutDashboard', true, true, 1),
('perfil', 'Perfil de Viagem', 'User', true, true, 2),
('atracoes', 'Atrações', 'Star', true, true, 3),
('agenda', 'Agenda', 'Calendar', true, true, 4),
('roteiro', 'Plano Estratégico', 'Map', false, true, 5),
('mapa', 'Mapa dos Parques', 'MapPin', true, true, 6),
('multipass', 'Lightning Lane', 'Zap', true, true, 7),
('guia', 'Guia de Viagem', 'BookOpen', true, true, 8),
('checklists', 'Checklists', 'CheckSquare', true, true, 9),
('conteudo', 'Conteúdos', 'FileText', true, true, 10),
('contato', 'Contato com Guia', 'MessageCircle', false, true, 11);

-- Trigger for updated_at
CREATE TRIGGER update_plan_page_access_updated_at
BEFORE UPDATE ON public.plan_page_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();