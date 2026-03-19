-- Change cleanup cron from daily to hourly for testing
select cron.unschedule('delete-expired-sessions');

select cron.schedule(
  'delete-expired-sessions',
  '0 * * * *',
  'select delete_expired_sessions()'
);
