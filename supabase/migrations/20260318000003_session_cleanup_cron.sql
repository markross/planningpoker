-- Enable pg_cron extension (runs in pg_catalog schema)
create extension if not exists pg_cron with schema pg_catalog;

-- Function to delete expired sessions
-- Expired = last vote older than 24h, or no votes and created over 24h ago
create or replace function delete_expired_sessions()
returns integer
language sql
as $$
  with deleted as (
    delete from poker_sessions
    where id in (
      -- Sessions with votes: most recent vote older than 24h
      select s.id from poker_sessions s
      inner join poker_votes v on v.session_id = s.id
      group by s.id
      having max(v.updated_at) < now() - interval '24 hours'

      union

      -- Sessions with no votes: created more than 24h ago
      select s.id from poker_sessions s
      left join poker_votes v on v.session_id = s.id
      where v.id is null
      and s.created_at < now() - interval '24 hours'
    )
    returning id
  )
  select count(*)::integer from deleted;
$$;

-- Schedule daily at midnight UTC
select cron.schedule(
  'delete-expired-sessions',
  '0 0 * * *',
  'select delete_expired_sessions()'
);
