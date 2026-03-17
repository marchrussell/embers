ALTER TABLE public.live_sessions
  ADD COLUMN session_type TEXT
  CHECK (session_type IN ('weekly-reset', 'monthly-presence', 'guest-session'));
