-- Create live_sessions table
CREATE TABLE public.live_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  daily_room_name TEXT,
  daily_room_url TEXT,
  host_token TEXT,
  guest_token TEXT,
  guest_link_expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  access_level TEXT NOT NULL DEFAULT 'members',
  recording_enabled BOOLEAN DEFAULT false,
  recording_url TEXT,
  notes TEXT,
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all live sessions
CREATE POLICY "Admins can manage live sessions"
ON public.live_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Authenticated users can view scheduled/live sessions
CREATE POLICY "Members can view live sessions"
ON public.live_sessions
FOR SELECT
USING (
  status IN ('scheduled', 'live') 
  AND auth.uid() IS NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER update_live_sessions_updated_at
BEFORE UPDATE ON public.live_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create live_session_attendance table for tracking
CREATE TABLE public.live_session_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID,
  role TEXT NOT NULL DEFAULT 'audience',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on attendance
ALTER TABLE public.live_session_attendance ENABLE ROW LEVEL SECURITY;

-- Admins can view all attendance
CREATE POLICY "Admins can manage attendance"
ON public.live_session_attendance
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can insert their own attendance
CREATE POLICY "Users can insert own attendance"
ON public.live_session_attendance
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
ON public.live_session_attendance
FOR SELECT
USING (auth.uid() = user_id);