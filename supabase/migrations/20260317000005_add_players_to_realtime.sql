-- Enable realtime for players table so new joins are broadcast
alter publication supabase_realtime add table poker_players;
