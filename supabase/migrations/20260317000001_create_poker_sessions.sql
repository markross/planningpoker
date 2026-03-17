create table poker_sessions (
  id uuid primary key default gen_random_uuid(),
  session_code text unique not null,
  is_revealed boolean not null default false,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create index idx_poker_sessions_code on poker_sessions (session_code);
