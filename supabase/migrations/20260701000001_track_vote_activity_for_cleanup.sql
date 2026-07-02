-- Idle-session cleanup was evicting players from actively-used sessions.
--
-- "New round" (clear) deletes all of a session's votes. The previous cleanup
-- treated a session as expired when it had NO votes and was created over 24h
-- ago. A long-lived (e.g. custom-named) session that had just started a new
-- round therefore looked identical to an abandoned one, so the hourly job
-- deleted all its players mid-session — producing RLS violations on the next
-- vote (stale player_id) and duplicate players on rejoin.
--
-- Fix: track the last time a vote was cast per session in a column that is NOT
-- wiped when votes are cleared, and base cleanup on that activity timestamp
-- rather than on vote-row existence or session age.

alter table poker_sessions
  add column last_voted_at timestamptz not null default now();

-- Backfill so pre-existing sessions aren't treated as expired on first run:
-- most recent vote if any, otherwise the session's creation time.
update poker_sessions s
set last_voted_at = greatest(
  s.created_at,
  coalesce(
    (select max(v.updated_at) from poker_votes v where v.session_id = s.id),
    s.created_at
  )
);

-- Bump last_voted_at whenever a vote is cast or changed. This survives the
-- vote-row deletion that "new round" performs, so it — not the presence of
-- vote rows — is the source of truth for activity. Runs as the voting user
-- (SECURITY INVOKER); authenticated already has UPDATE on poker_sessions.
create or replace function touch_session_last_voted_at()
returns trigger
language plpgsql
as $$
begin
  update poker_sessions
  set last_voted_at = now()
  where id = new.session_id;
  return new;
end;
$$;

create trigger poker_votes_touch_session
  after insert or update on poker_votes
  for each row
  execute function touch_session_last_voted_at();

-- Cleanup now evicts players only from sessions with no voting activity for
-- 24 hours. Sessions never voted in fall back to created_at (column default /
-- backfill), so genuinely abandoned sessions are still reaped.
create or replace function cleanup_expired_sessions()
returns integer
language sql
as $$
  with expired as (
    select id from poker_sessions
    where last_voted_at < now() - interval '24 hours'
  ),
  -- Runs unconditionally: Postgres executes data-modifying CTEs exactly once
  -- even when their output is not referenced by the outer query.
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
