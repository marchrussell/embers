-- Add columns for Daily.co guest link integration
ALTER TABLE public.guest_teachers 
ADD COLUMN IF NOT EXISTS linked_session_id UUID REFERENCES public.live_sessions(id),
ADD COLUMN IF NOT EXISTS guest_join_url TEXT;