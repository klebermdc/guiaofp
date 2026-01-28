
-- Adicionar colunas faltantes na tabela restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS price_range TEXT DEFAULT '$$' CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS michelin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Criar tabela de imagens dos restaurantes
CREATE TABLE IF NOT EXISTS restaurant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de itens do menu
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('appetizers', 'mainCourses', 'desserts', 'drinks')),
  item_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu_items ENABLE ROW LEVEL SECURITY;

-- Políticas para restaurant_images
CREATE POLICY "Anyone can view restaurant images" ON restaurant_images
FOR SELECT USING (true);

CREATE POLICY "Guides can manage restaurant images" ON restaurant_images
FOR ALL USING (is_guide_or_admin(auth.uid()));

-- Políticas para restaurant_menu_items
CREATE POLICY "Anyone can view menu items" ON restaurant_menu_items
FOR SELECT USING (true);

CREATE POLICY "Guides can manage menu items" ON restaurant_menu_items
FOR ALL USING (is_guide_or_admin(auth.uid()));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_restaurant_images_restaurant_id ON restaurant_images(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_images_order ON restaurant_images(display_order);
CREATE INDEX IF NOT EXISTS idx_restaurant_menu_items_restaurant_id ON restaurant_menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
CREATE INDEX IF NOT EXISTS idx_restaurants_subcategory ON restaurants(subcategory);
CREATE INDEX IF NOT EXISTS idx_restaurants_michelin ON restaurants(michelin);
CREATE INDEX IF NOT EXISTS idx_restaurants_featured ON restaurants(featured);
