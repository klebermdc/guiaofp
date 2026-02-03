-- Schedule wait time collection every 5 minutes (8:00 AM to 11:00 PM Orlando time)
SELECT cron.schedule(
  'collect-wait-times-frequent',
  '*/5 8-23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qjfhyqjgqutkabxaeopi.supabase.co/functions/v1/collect-wait-times',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Schedule daily analytics processing at 11:59 PM Orlando time (04:59 UTC)
SELECT cron.schedule(
  'process-daily-analytics',
  '59 4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://qjfhyqjgqutkabxaeopi.supabase.co/functions/v1/process-daily-analytics',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);