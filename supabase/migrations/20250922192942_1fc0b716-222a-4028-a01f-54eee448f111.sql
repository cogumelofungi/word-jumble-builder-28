-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the cleanup function daily at 2 AM
SELECT cron.schedule(
  'cleanup-inactive-apps-daily',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://jboartixfhvifdecdufq.supabase.co/functions/v1/cleanup-inactive-apps',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2FydGl4Zmh2aWZkZWNkdWZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Nzg5OCwiZXhwIjoyMDcxMjczODk4fQ.D2xBgYCWbXNgRhF1MJ4pAnMOTv_vWL-aKxUQeJ-9mTM"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Insert default settings for auto cleanup if they don't exist
INSERT INTO admin_settings (key, value) VALUES 
  ('auto_cleanup_enabled', 'true'),
  ('auto_cleanup_days', '30'),
  ('cleanup_notification_enabled', 'true'),
  ('cleanup_notification_days', '7')
ON CONFLICT (key) DO NOTHING;