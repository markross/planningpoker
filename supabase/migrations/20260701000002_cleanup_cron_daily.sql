-- Move idle-session cleanup back to once a day at midnight UTC. The hourly
-- cadence was only ever intended for testing (see 20260318000004).
select cron.unschedule('cleanup-expired-sessions');

select cron.schedule(
  'cleanup-expired-sessions',
  '0 0 * * *',
  'select cleanup_expired_sessions()'
);
