-- ==================================================
-- WAIT TIME RECORDS TABLE
-- Stores minute-by-minute wait time data from parks API
-- ==================================================
CREATE TABLE public.wait_time_records (
  id BIGSERIAL PRIMARY KEY,
  attraction_id UUID REFERENCES public.attractions(id) ON DELETE CASCADE,
  attraction_name TEXT NOT NULL,
  park_name TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  day_of_week INTEGER NOT NULL DEFAULT EXTRACT(DOW FROM CURRENT_DATE),
  wait_time_minutes INTEGER,
  status TEXT DEFAULT 'Operating',
  weather_condition TEXT,
  temperature_f DECIMAL(4, 1),
  is_raining BOOLEAN DEFAULT FALSE,
  is_holiday BOOLEAN DEFAULT FALSE,
  crowd_level INTEGER CHECK (crowd_level BETWEEN 1 AND 10),
  data_source TEXT DEFAULT 'themeparks-wiki',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_wait_time_attraction_date ON public.wait_time_records(attraction_name, date);
CREATE INDEX idx_wait_time_date_time ON public.wait_time_records(date, time);
CREATE INDEX idx_wait_time_park_timestamp ON public.wait_time_records(park_name, timestamp);
CREATE INDEX idx_wait_time_day_of_week ON public.wait_time_records(day_of_week);

-- Enable RLS
ALTER TABLE public.wait_time_records ENABLE ROW LEVEL SECURITY;

-- Public read access for wait time data
CREATE POLICY "Anyone can read wait time records"
ON public.wait_time_records FOR SELECT
USING (true);

-- Only service role can insert
CREATE POLICY "Service role can insert wait time records"
ON public.wait_time_records FOR INSERT
WITH CHECK (true);

-- ==================================================
-- DAILY ANALYTICS TABLE
-- Aggregated daily statistics per attraction
-- ==================================================
CREATE TABLE public.daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_name TEXT NOT NULL,
  park_name TEXT NOT NULL,
  date DATE NOT NULL,
  day_of_week INTEGER NOT NULL,
  opening_time TIME,
  closing_time TIME,
  avg_wait_time DECIMAL(6, 2),
  median_wait_time DECIMAL(6, 2),
  min_wait_time INTEGER,
  max_wait_time INTEGER,
  std_deviation DECIMAL(6, 2),
  peak_time TIME,
  peak_wait_time INTEGER,
  best_time TIME,
  best_wait_time INTEGER,
  total_operating_minutes INTEGER,
  data_points_collected INTEGER,
  data_completeness_percent DECIMAL(5, 2),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  weather_summary TEXT,
  is_holiday BOOLEAN DEFAULT FALSE,
  special_event TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attraction_name, park_name, date)
);

-- Indexes
CREATE INDEX idx_daily_analytics_attraction ON public.daily_analytics(attraction_name, park_name);
CREATE INDEX idx_daily_analytics_date ON public.daily_analytics(date);
CREATE INDEX idx_daily_analytics_day_of_week ON public.daily_analytics(day_of_week);
CREATE INDEX idx_daily_analytics_confidence ON public.daily_analytics(confidence_score DESC);

-- Enable RLS
ALTER TABLE public.daily_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read daily analytics"
ON public.daily_analytics FOR SELECT
USING (true);

-- Service role can insert/update
CREATE POLICY "Service role can manage daily analytics"
ON public.daily_analytics FOR ALL
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_daily_analytics_updated_at
  BEFORE UPDATE ON public.daily_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ==================================================
-- OPTIMAL WINDOWS TABLE
-- Best 10-minute windows to visit each attraction
-- ==================================================
CREATE TABLE public.optimal_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_name TEXT NOT NULL,
  park_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time_window_start TIME NOT NULL,
  time_window_end TIME NOT NULL,
  avg_wait_time DECIMAL(6, 2) NOT NULL,
  min_wait_time INTEGER,
  max_wait_time INTEGER,
  std_deviation DECIMAL(6, 2),
  confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  sample_size INTEGER NOT NULL DEFAULT 0,
  ranking INTEGER CHECK (ranking BETWEEN 1 AND 100),
  is_recommended BOOLEAN DEFAULT FALSE,
  notes TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(attraction_name, park_name, day_of_week, time_window_start)
);

-- Indexes
CREATE INDEX idx_optimal_windows_attraction ON public.optimal_windows(attraction_name, park_name);
CREATE INDEX idx_optimal_windows_day ON public.optimal_windows(day_of_week);
CREATE INDEX idx_optimal_windows_ranking ON public.optimal_windows(ranking);
CREATE INDEX idx_optimal_windows_recommended ON public.optimal_windows(is_recommended) WHERE is_recommended = true;

-- Enable RLS
ALTER TABLE public.optimal_windows ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read optimal windows"
ON public.optimal_windows FOR SELECT
USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage optimal windows"
ON public.optimal_windows FOR ALL
WITH CHECK (true);

-- ==================================================
-- SYSTEM HEALTH LOGS TABLE
-- Monitor data collection and processing health
-- ==================================================
CREATE TABLE public.system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'warning', 'error')),
  message TEXT,
  error_details JSONB,
  execution_time_ms INTEGER,
  parks_processed INTEGER,
  attractions_updated INTEGER,
  records_created INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for recent logs
CREATE INDEX idx_health_logs_component_date ON public.system_health_logs(component, created_at DESC);
CREATE INDEX idx_health_logs_status ON public.system_health_logs(status) WHERE status = 'error';

-- Enable RLS
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read logs
CREATE POLICY "Admins can read system health logs"
ON public.system_health_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert
CREATE POLICY "Service role can insert system health logs"
ON public.system_health_logs FOR INSERT
WITH CHECK (true);

-- ==================================================
-- Enable realtime for wait time records
-- ==================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.wait_time_records;