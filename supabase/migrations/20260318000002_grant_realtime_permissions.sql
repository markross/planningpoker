-- Grant SELECT to anon role for Realtime Postgres Changes
-- Supabase Realtime uses the anon role internally to listen for changes
grant select on poker_sessions to anon;
grant select on poker_players to anon;
grant select on poker_votes to anon;
