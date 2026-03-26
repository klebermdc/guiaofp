
-- Restrict write access on tables that should only be written by service role (edge functions)

-- wait_time_records: only service role (collect-wait-times function) should write
DROP POLICY IF EXISTS "Anyone can insert wait times" ON public.wait_time_records;
DROP POLICY IF EXISTS "Service can insert wait times" ON public.wait_time_records;
CREATE POLICY "Deny client writes on wait_time_records"
  ON public.wait_time_records
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- system_health_logs: only service role should write
CREATE POLICY "Deny client writes on system_health_logs"
  ON public.system_health_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client updates on system_health_logs"
  ON public.system_health_logs
  FOR UPDATE
  TO authenticated, anon
  USING (false);

CREATE POLICY "Deny client deletes on system_health_logs"
  ON public.system_health_logs
  FOR DELETE
  TO authenticated, anon
  USING (false);

-- notifications_sent: only service role should write
CREATE POLICY "Deny client writes on notifications_sent"
  ON public.notifications_sent
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client updates on notifications_sent"
  ON public.notifications_sent
  FOR UPDATE
  TO authenticated, anon
  USING (false);

CREATE POLICY "Deny client deletes on notifications_sent"
  ON public.notifications_sent
  FOR DELETE
  TO authenticated, anon
  USING (false);

-- availability_log: only service role should write
CREATE POLICY "Deny client writes on availability_log"
  ON public.availability_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client updates on availability_log"
  ON public.availability_log
  FOR UPDATE
  TO authenticated, anon
  USING (false);

-- cache_entries: restrict writes to service role only
DROP POLICY IF EXISTS "Authenticated users can insert cache" ON public.cache_entries;
DROP POLICY IF EXISTS "Authenticated users can update cache" ON public.cache_entries;
CREATE POLICY "Deny client writes on cache_entries"
  ON public.cache_entries
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client updates on cache_entries"
  ON public.cache_entries
  FOR UPDATE
  TO authenticated, anon
  USING (false);
