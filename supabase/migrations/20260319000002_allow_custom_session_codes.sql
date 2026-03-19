alter table poker_sessions
  add constraint chk_session_code_length
  check (length(session_code) between 3 and 50);
