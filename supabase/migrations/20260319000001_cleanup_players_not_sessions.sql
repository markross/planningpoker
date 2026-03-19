
-- Update cleanup function to evict players from inactive sessions
-- rather than deleting the sessions themselves.
-- Cascade on poker_votes.player_id handles vote cleanup automatically.
create or replace function delete_expired_sessions()
returns integer
language sql
as $$
  with deleted as (
    delete from poker_players
    where session_id in (
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