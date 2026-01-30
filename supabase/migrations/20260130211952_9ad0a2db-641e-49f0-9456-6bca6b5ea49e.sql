-- Create table for editable banners/content blocks
CREATE TABLE public.editable_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL DEFAULT 'text',
  title TEXT,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_url TEXT,
  image_url TEXT,
  badge_text TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key)
);

-- Enable RLS
ALTER TABLE public.editable_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read active content
CREATE POLICY "Anyone can read active content"
ON public.editable_content
FOR SELECT
USING (is_active = true);

-- Only guides/admins can modify content
CREATE POLICY "Guides and admins can manage content"
ON public.editable_content
FOR ALL
USING (public.is_guide_or_admin(auth.uid()))
WITH CHECK (public.is_guide_or_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_editable_content_updated_at
BEFORE UPDATE ON public.editable_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for Landing Page
INSERT INTO public.editable_content (page_key, section_key, content_type, title, subtitle, description, badge_text, button_text) VALUES
('landing', 'hero', 'hero', 'Menos filas.', 'Mais magia.', 'Roteiros inteligentes que transformam seu dia de parque em uma experiência inesquecível.', '✨ Planejador Inteligente de Parques', 'Escolher meu plano'),
('landing', 'how_it_works', 'section', 'Como funciona', 'Simples e poderoso', NULL, NULL, NULL),
('landing', 'plans', 'section', 'Dois jeitos de planejar', 'Escolha seu caminho', NULL, NULL, NULL),
('landing', 'cta', 'cta', 'Pronto para a viagem dos sonhos?', 'Comece agora mesmo', NULL, NULL, 'Falar com especialista'),
('dashboard', 'welcome', 'hero', 'Área Exclusiva', 'Sua viagem está sendo preparada ✨', NULL, NULL, NULL),
('dashboard', 'help_cta', 'cta', 'Precisa de ajuda?', 'está disponível para tirar todas as suas dúvidas em tempo real.', NULL, NULL, 'Falar no WhatsApp');