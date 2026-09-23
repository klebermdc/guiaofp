CREATE INDEX IF NOT EXISTS idx_wait_time_park_date_attr
  ON public.wait_time_records (park_name, date, attraction_name)
  INCLUDE (wait_time_minutes);

CREATE INDEX IF NOT EXISTS idx_wait_time_date_status
  ON public.wait_time_records (date, status);

ANALYZE public.wait_time_records;