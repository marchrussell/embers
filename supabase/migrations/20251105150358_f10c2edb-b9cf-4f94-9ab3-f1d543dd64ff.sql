-- Phase 1: March Onboarding Database Schema

-- Create user_onboarding table to store March onboarding responses
CREATE TABLE public.user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goals TEXT[] DEFAULT '{}',
  time_availability TEXT,
  plan_type TEXT,
  accountability_enabled BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding data"
  ON public.user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding data"
  ON public.user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data"
  ON public.user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding data"
  ON public.user_onboarding FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_mood_logs table for mood tracking
CREATE TABLE public.user_mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own mood logs"
  ON public.user_mood_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs"
  ON public.user_mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all mood logs"
  ON public.user_mood_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create march_messages table for conversation history
CREATE TABLE public.march_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_from_march BOOLEAN DEFAULT false,
  step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.march_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own march messages"
  ON public.march_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own march messages"
  ON public.march_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all march messages"
  ON public.march_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add session tagging columns to classes table
ALTER TABLE public.classes 
  ADD COLUMN IF NOT EXISTS focus_tags JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS goal_fit JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS recommended_for_time TEXT;

-- Create updated_at trigger for user_onboarding
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON public.user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_user_onboarding_user_id ON public.user_onboarding(user_id);
CREATE INDEX idx_user_mood_logs_user_id ON public.user_mood_logs(user_id);
CREATE INDEX idx_march_messages_user_id ON public.march_messages(user_id);
CREATE INDEX idx_classes_tags ON public.classes USING GIN(focus_tags, goal_fit);