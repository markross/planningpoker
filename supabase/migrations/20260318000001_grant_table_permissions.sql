-- Grant table access to authenticated role
-- RLS policies control row-level access; this grants base table permissions
grant select, insert, update, delete on poker_sessions to authenticated;
grant select, insert, update, delete on poker_players to authenticated;
grant select, insert, update, delete on poker_votes to authenticated;
