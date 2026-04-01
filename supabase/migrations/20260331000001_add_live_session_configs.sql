-- Create live_session_configs table for managing recurring session type templates
CREATE TABLE public.live_session_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_type TEXT NOT NULL UNIQUE
    CHECK (session_type IN ('weekly-reset', 'monthly-presence', 'guest-session')),
  title TEXT NOT NULL,
  subtitle TEXT,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'nthWeekday')),
  weekdays INTEGER[],      -- for weekly: array of weekday numbers (0=Sun, 1=Mon, ...)
  weekday INTEGER,         -- for nthWeekday: the weekday (0=Sun, 1=Mon, ...)
  nth INTEGER,             -- for nthWeekday: which occurrence (1=1st, 2=2nd, ...)
  time TEXT,               -- "HH:MM" 24h format
  timezone TEXT NOT NULL DEFAULT 'GMT',
  duration TEXT,           -- e.g. "30 mins", "90 mins"
  recurrence_label TEXT,   -- human-readable label e.g. "Every Tuesday"
  cta_label TEXT,          -- e.g. "Enter Space"
  event_type TEXT CHECK (event_type IN ('free', 'paid', 'studio-member')),
  format TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_session_configs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active configs
CREATE POLICY "Anyone can view active live session configs"
ON public.live_session_configs
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all configs
CREATE POLICY "Admins can manage live session configs"
ON public.live_session_configs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_live_session_configs_updated_at
BEFORE UPDATE ON public.live_session_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data from existing hardcoded experiencesData.ts values
INSERT INTO public.live_session_configs
  (session_type, title, subtitle, recurrence_type, weekdays, time, timezone, duration, recurrence_label, cta_label, event_type, format)
VALUES
  (
    'weekly-reset',
    'Weekly Reset',
    'A live space to pause, settle your system, and realign mid-week.',
    'weekly',
    ARRAY[2],  -- Tuesday (0=Sun, 1=Mon, 2=Tue)
    '19:00',
    'GMT',
    '30 mins',
    'Every Tuesday',
    'Enter Space',
    'studio-member',
    'For Studio Members'
  ),
  (
    'monthly-presence',
    'Monthly Breath & Presence',
    'A longer, spacious session to soften tension and reconnect with yourself.',
    'nthWeekday',
    NULL,      -- not used for nthWeekday
    '19:30',
    'GMT',
    '90 mins',
    'Every 2nd Sunday',
    'Enter Space',
    'studio-member',
    'For Studio Members'
  ),
  (
    'guest-session',
    'Guest Session',
    'A special session with a guest teacher.',
    NULL,      -- no fixed recurrence for guest sessions
    NULL,
    NULL,
    'GMT',
    NULL,
    NULL,
    'Enter Space',
    'studio-member',
    'For Studio Members'
  );

-- Set nth and weekday for monthly-presence separately for clarity
UPDATE public.live_session_configs
SET weekday = 0, nth = 2  -- 2nd Sunday (0=Sun)
WHERE session_type = 'monthly-presence';
