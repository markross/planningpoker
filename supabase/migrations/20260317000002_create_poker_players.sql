create table poker_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references poker_sessions (id) on delete cascade,
  user_id uuid not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create index idx_poker_players_session on poker_players (session_id);
