-- Create table for AI knowledge base management
CREATE TABLE public.ai_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage knowledge base"
ON public.ai_knowledge_base
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Public read for edge functions (via service role)
CREATE POLICY "Public read for knowledge base"
ON public.ai_knowledge_base
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_knowledge_base_updated_at
BEFORE UPDATE ON public.ai_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default knowledge base sections from existing data
INSERT INTO public.ai_knowledge_base (section_key, section_title, content, sort_order) VALUES
('parks_info', 'Informações dos Parques', 'Informações gerais sobre os parques de Orlando, horários de funcionamento, melhores épocas para visitar, dicas de economia e estratégias para aproveitar ao máximo cada parque.', 1),
('economy_guide', 'Guia de Economia', 'Dicas práticas para economizar em Orlando: melhores épocas para comprar ingressos, onde comer barato, hospedagem econômica, cupons de desconto e estratégias de compras.', 2),
('fastpass_services', 'Serviços Orlando Fast Pass', 'Informações sobre os serviços oferecidos pela Orlando Fast Pass: roteiros personalizados, guiamento remoto, suporte via WhatsApp, planejamento de viagem completo.', 3),
('remote_guidance_faq', 'FAQ Guiamento Remoto', 'Perguntas frequentes sobre o serviço de guiamento remoto: como funciona, horários de atendimento, comunicação via WhatsApp, ajustes em tempo real durante visita ao parque.', 4);