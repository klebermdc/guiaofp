-- Create table for plan pricing configuration
CREATE TABLE public.plan_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE,
  plan_name TEXT NOT NULL,
  subtitle TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plan_pricing ENABLE ROW LEVEL SECURITY;

-- Everyone can read active plans (for checkout page)
CREATE POLICY "Anyone can view active plans"
ON public.plan_pricing
FOR SELECT
USING (is_active = true);

-- Only guides/admins can manage plans
CREATE POLICY "Guides can manage plans"
ON public.plan_pricing
FOR ALL
USING (public.is_guide_or_admin(auth.uid()));

-- Insert default plans
INSERT INTO public.plan_pricing (plan_key, plan_name, subtitle, price_cents, features, sort_order)
VALUES 
  ('basic', 'Básico', 'Ideal para quem quer planejar', 4990, '["Perfil de viagem completo", "Seleção de atrações favoritas", "Mapas dos parques", "Checklists personalizados", "Suporte por email"]', 1),
  ('premium', 'Guia Premium', 'Experiência completa com guia', 14990, '["Tudo do plano Básico", "Guiamento remoto em tempo real", "Agenda personalizada do guia", "Contato direto com o guia", "Roteiros otimizados por IA", "Suporte prioritário via WhatsApp"]', 2);

-- Create trigger for updated_at
CREATE TRIGGER update_plan_pricing_updated_at
BEFORE UPDATE ON public.plan_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();