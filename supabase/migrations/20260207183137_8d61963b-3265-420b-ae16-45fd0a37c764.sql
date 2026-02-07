
-- Dining alerts table
CREATE TABLE public.dining_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT,
  desired_date DATE NOT NULL,
  meal_time TEXT DEFAULT 'any',
  party_size INT DEFAULT 4,
  status TEXT DEFAULT 'active',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dining_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts" ON public.dining_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON public.dining_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.dining_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.dining_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_dining_alerts_updated_at BEFORE UPDATE ON public.dining_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Availability log table
CREATE TABLE public.availability_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  park TEXT,
  available_date DATE NOT NULL,
  party_size INT DEFAULT 4,
  is_available BOOLEAN DEFAULT true,
  available_times JSONB,
  source TEXT DEFAULT 'automated',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_log ENABLE ROW LEVEL SECURITY;

-- Availability log is read by authenticated users, written by service role (edge function)
CREATE POLICY "Authenticated users can view availability" ON public.availability_log FOR SELECT TO authenticated USING (true);

-- Notifications sent table
CREATE TABLE public.notifications_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID REFERENCES public.dining_alerts(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT DEFAULT 'email',
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications_sent FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.dining_alerts WHERE dining_alerts.id = notifications_sent.alert_id AND dining_alerts.user_id = auth.uid())
);
