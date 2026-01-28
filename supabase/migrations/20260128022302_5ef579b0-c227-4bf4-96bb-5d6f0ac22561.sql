-- Create planner_items table
CREATE TABLE public.planner_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID REFERENCES public.user_planners(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  time_slot VARCHAR(20), -- 'morning', 'afternoon', 'evening', 'night', 'all_day'
  start_time TIME, -- horário específico (opcional)
  end_time TIME, -- horário de término (opcional)
  item_type VARCHAR(50) NOT NULL, -- 'park', 'attraction', 'restaurant', 'shopping', 'activity', 'hotel', 'custom'
  item_id UUID, -- referência para a tabela correspondente (nullable para custom)
  item_name VARCHAR(200) NOT NULL, -- nome do item
  category VARCHAR(50) NOT NULL, -- 'disney', 'universal', 'outlet', 'walmart', etc
  color VARCHAR(20) NOT NULL, -- cor da tag
  icon VARCHAR(50), -- emoji ou ícone
  duration INTEGER, -- em minutos
  notes TEXT,
  order_index INTEGER DEFAULT 0, -- ordem dentro do time_slot
  completed BOOLEAN DEFAULT false,
  reservation_confirmed BOOLEAN DEFAULT false,
  reservation_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_planner_items_planner_id ON public.planner_items(planner_id);
CREATE INDEX idx_planner_items_date ON public.planner_items(date);
CREATE INDEX idx_planner_items_type ON public.planner_items(item_type);

-- Enable RLS
ALTER TABLE public.planner_items ENABLE ROW LEVEL SECURITY;

-- Users can view items from their own planners
CREATE POLICY "Users can view own planner items"
  ON public.planner_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_planners 
      WHERE user_planners.id = planner_items.planner_id 
      AND user_planners.user_id = auth.uid()
    )
  );

-- Users can insert items into their own planners
CREATE POLICY "Users can insert own planner items"
  ON public.planner_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_planners 
      WHERE user_planners.id = planner_items.planner_id 
      AND user_planners.user_id = auth.uid()
    )
  );

-- Users can update items in their own planners
CREATE POLICY "Users can update own planner items"
  ON public.planner_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_planners 
      WHERE user_planners.id = planner_items.planner_id 
      AND user_planners.user_id = auth.uid()
    )
  );

-- Users can delete items from their own planners
CREATE POLICY "Users can delete own planner items"
  ON public.planner_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_planners 
      WHERE user_planners.id = planner_items.planner_id 
      AND user_planners.user_id = auth.uid()
    )
  );

-- Guides can view all planner items
CREATE POLICY "Guides can view all planner items"
  ON public.planner_items
  FOR SELECT
  USING (is_guide_or_admin(auth.uid()));