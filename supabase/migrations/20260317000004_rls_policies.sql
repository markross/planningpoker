-- Enable RLS on all tables
alter table poker_sessions enable row level security;
alter table poker_players enable row level security;
alter table poker_votes enable row level security;

-- Enable realtime for votes table
alter publication supabase_realtime add table poker_votes;

-- Sessions: any authenticated user can CRUD
create policy "Anyone can create sessions"
  on poker_sessions for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Anyone can read sessions"
  on poker_sessions for select
  to authenticated
  using (true);

create policy "Anyone can update sessions"
  on poker_sessions for update
  to authenticated
  using (true);

-- Players: insert self, read all in session, delete self
create policy "Players can join sessions"
  on poker_players for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Anyone can read players"
  on poker_players for select
  to authenticated
  using (true);

create policy "Players can leave sessions"
  on poker_players for delete
  to authenticated
  using (auth.uid() = user_id);

-- Votes: insert/update own, read all, delete all (for clear)
create policy "Players can insert own votes"
  on poker_votes for insert
  to authenticated
  with check (
    player_id in (
      select id from poker_players where user_id = auth.uid()
    )
  );

create policy "Players can update own votes"
  on poker_votes for update
  to authenticated
  using (
    player_id in (
      select id from poker_players where user_id = auth.uid()
    )
  );

create policy "Anyone can read votes"
  on poker_votes for select
  to authenticated
  using (true);

create policy "Anyone can delete votes in session"
  on poker_votes for delete
  to authenticated
  using (true);
