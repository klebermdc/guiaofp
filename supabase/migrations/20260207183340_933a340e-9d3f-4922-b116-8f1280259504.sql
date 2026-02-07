
-- Add performance indexes (tables already exist)
CREATE INDEX IF NOT EXISTS idx_alerts_user ON public.dining_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_restaurant_date ON public.dining_alerts(restaurant_id, desired_date);
CREATE INDEX IF NOT EXISTS idx_availability_date ON public.availability_log(available_date);

-- Add error_message column to notifications_sent
ALTER TABLE public.notifications_sent ADD COLUMN IF NOT EXISTS error_message TEXT;
