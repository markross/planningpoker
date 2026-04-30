-- Rename cleanup function and update cron to match.
-- Also resets is_revealed on expired sessions so rejoining players don't see stale revealed state.

drop function if exists delete_expired_sessions();

create function cleanup_expired_sessions()
returns integer
language sql
as $$
  with expired as (
    select s.id from poker_sessions s
    inner join poker_votes v on v.session_id = s.id
    group by s.id
    having max(v.updated_at) < now() - interval '24 hours'

    union all

    select s.id from poker_sessions s
    left join poker_votes v on v.session_id = s.id
    where v.id is null
    and s.created_at < now() - interval '24 hours'
  ),
  -- reset_sessions executes unconditionally: Postgres runs data-modifying CTEs
  -- exactly once even when their output is not referenced by the outer query.
  reset_sessions as (
    update poker_sessions
    set is_revealed = false
    where id in (select id from expired)
    and is_revealed = true
  ),
  deleted as (
    delete from poker_players
    where session_id in (select id from expired)
    returning id
  )
  select count(*)::integer from deleted;
$$;

select cron.unschedule('delete-expired-sessions');

select cron.schedule(
  'cleanup-expired-sessions',
  '0 * * * *',
  'select cleanup_expired_sessions()'
);