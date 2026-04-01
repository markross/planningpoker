-- Allow any authenticated user to delete players in a session (for reset)
-- Replaces the restrictive "Players can leave sessions" policy
drop policy "Players can leave sessions" on poker_players;

create policy "Anyone can delete players in session"
  on poker_players for delete
  to authenticated
  using (true);