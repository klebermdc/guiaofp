-- Create shopping table
CREATE TABLE public.shopping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  type VARCHAR(50), -- 'outlet', 'mall', 'store', 'specialty'
  category VARCHAR(50), -- 'outlet', 'shopping', 'walmart', 'target', 'disney_store'
  color VARCHAR(20), -- cor da tag
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  operating_hours JSONB,
  average_visit_duration INTEGER, -- em minutos
  description TEXT,
  brands TEXT[], -- array de marcas principais
  image_url TEXT,
  tips TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_shopping_category ON public.shopping(category);
CREATE INDEX idx_shopping_type ON public.shopping(type);
CREATE INDEX idx_shopping_slug ON public.shopping(slug);

-- Enable RLS
ALTER TABLE public.shopping ENABLE ROW LEVEL SECURITY;

-- Anyone can view shopping (public data)
CREATE POLICY "Anyone can view shopping"
  ON public.shopping
  FOR SELECT
  USING (true);

-- Only guides/admins can manage shopping
CREATE POLICY "Guides can manage shopping"
  ON public.shopping
  FOR ALL
  USING (is_guide_or_admin(auth.uid()));

-- Premium Outlets
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, brands, tips) VALUES
('Orlando International Premium Outlets', 'premium-outlets-international', 'outlet', 'outlet', '#A855F7', '4951 International Drive, Orlando, FL 32819', 180, 
 ARRAY['Nike', 'Adidas', 'Coach', 'Kate Spade', 'Michael Kors', 'Tommy Hilfiger', 'Calvin Klein', 'Polo Ralph Lauren', 'Under Armour', 'Levi''s'],
 'Maior outlet de Orlando. Vá cedo para evitar multidões. Baixe o app para cupons extras.'),
('Orlando Vineland Premium Outlets', 'premium-outlets-vineland', 'outlet', 'outlet', '#A855F7', '8200 Vineland Avenue, Orlando, FL 32821', 180,
 ARRAY['Gucci', 'Prada', 'Burberry', 'Tory Burch', 'Armani', 'Versace', 'Valentino', 'Balenciaga', 'Jimmy Choo', 'Salvatore Ferragamo'],
 'Outlet premium com marcas de luxo. Mais próximo dos parques Disney. Guest Services oferece cupons adicionais.');

-- Malls
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, brands, tips) VALUES
('The Florida Mall', 'florida-mall', 'mall', 'shopping', '#EC4899', '8001 S Orange Blossom Trail, Orlando, FL 32809', 180,
 ARRAY['Apple Store', 'Macy''s', 'Dillard''s', 'JCPenney', 'Zara', 'H&M', 'Forever 21', 'Sephora', 'Victoria''s Secret'],
 'Maior mall de Orlando. Possui M&M World e Crayola Experience dentro.'),
('The Mall at Millenia', 'mall-millenia', 'mall', 'shopping', '#EC4899', '4200 Conroy Road, Orlando, FL 32839', 150,
 ARRAY['Louis Vuitton', 'Gucci', 'Chanel', 'Tiffany & Co', 'Apple', 'Bloomingdale''s', 'Neiman Marcus', 'Macy''s'],
 'Mall de luxo. Melhor Apple Store de Orlando. Excelente praça de alimentação.');

-- Disney Springs Stores
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, tips) VALUES
('World of Disney', 'world-of-disney', 'store', 'disney_store', '#22C55E', 'Disney Springs, Orlando, FL', 60,
 'Maior loja Disney do mundo! Personalização de orelhinhas e produtos exclusivos.'),
('Disney''s Days of Christmas', 'days-of-christmas', 'specialty', 'disney_store', '#22C55E', 'Disney Springs, Orlando, FL', 30,
 'Natal o ano todo. Enfeites personalizados com seu nome.'),
('The LEGO Store', 'lego-store-disney', 'store', 'disney_store', '#22C55E', 'Disney Springs, Orlando, FL', 45,
 'Peças LEGO exclusivas Disney. Parede de Pick-a-Brick.');

-- Universal CityWalk Stores
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, tips) VALUES
('Universal Studios Store', 'universal-store-citywalk', 'store', 'universal_store', '#3B82F6', 'Universal CityWalk, Orlando, FL', 45,
 'Produtos de todas as franquias Universal. Harry Potter, Minions, Jurassic.'),
('The Wizarding World of Harry Potter Store', 'harry-potter-store', 'specialty', 'universal_store', '#3B82F6', 'Universal CityWalk, Orlando, FL', 60,
 'Varinhas interativas, roupas de Hogwarts, doces do mundo bruxo.');

-- Supermercados e Lojas de Conveniência
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, tips) VALUES
('Walmart Supercenter (International Dr)', 'walmart-idrive', 'store', 'walmart', '#0EA5E9', '5991 International Drive, Orlando, FL 32819', 60,
 'Aberto 24h. Ótimo para snacks, água e produtos básicos. Farmácia dentro.'),
('Walmart Supercenter (Vineland)', 'walmart-vineland', 'store', 'walmart', '#0EA5E9', '8990 Turkey Lake Road, Orlando, FL 32819', 60,
 'Próximo aos parques. Bom para compras de última hora.'),
('Target (International Dr)', 'target-idrive', 'store', 'target', '#EF4444', '4795 International Drive, Orlando, FL 32819', 45,
 'Mais organizado que Walmart. Bons preços em eletrônicos e roupas.'),
('Publix (Lake Buena Vista)', 'publix-lbv', 'store', 'grocery', '#4ADE80', '12133 Apopka Vineland Rd, Orlando, FL 32836', 30,
 'Supermercado premium. Padaria excelente. Subs são lendários!'),
('Whole Foods (Dr Phillips)', 'whole-foods-drphillips', 'store', 'grocery', '#22C55E', '8003 Turkey Lake Road, Orlando, FL 32819', 30,
 'Produtos orgânicos e naturais. Hot bar para refeições rápidas.');

-- Specialty Stores
INSERT INTO public.shopping (name, slug, type, category, color, address, average_visit_duration, tips) VALUES
('Bass Pro Shops', 'bass-pro-shops', 'specialty', 'specialty', '#84CC16', '5156 International Drive, Orlando, FL 32819', 90,
 'Loja de outdoor impressionante. Aquários gigantes, tigres e área de pesca indoor.'),
('Bath & Body Works (Outlets)', 'bath-body-works', 'store', 'specialty', '#F472B6', 'Premium Outlets International, Orlando, FL', 30,
 'Promoções de Semi-Annual Sale são imperdíveis. Kits exclusivos.'),
('Ross Dress for Less', 'ross-idrive', 'store', 'discount', '#F59E0B', 'International Drive, Orlando, FL', 45,
 'Descontos em marcas famosas. Requer paciência para garimpar.'),
('Costco (Orlando)', 'costco-orlando', 'store', 'warehouse', '#E11D48', '4696 Millenia Plaza Way, Orlando, FL 32839', 60,
 'Precisa de membership. Eletrônicos, roupas e snacks em quantidade.');