create table poker_votes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references poker_sessions (id) on delete cascade,
  player_id uuid not null references poker_players (id) on delete cascade,
  estimate text,
  updated_at timestamptz not null default now(),
  unique (session_id, player_id)
);

create index idx_poker_votes_session on poker_votes (session_id);
