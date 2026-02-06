-- Create recommendation_history table to track user interactions with recommendations
CREATE TABLE public.recommendation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  recommended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('viewed', 'started', 'completed', 'skipped', 'favorited')),
  interaction_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;

-- Users can insert their own recommendation history
CREATE POLICY "Users can insert own recommendation history"
ON public.recommendation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own recommendation history
CREATE POLICY "Users can view own recommendation history"
ON public.recommendation_history
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all recommendation history
CREATE POLICY "Admins can view all recommendation history"
ON public.recommendation_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_preferences table for learned preferences
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_session_times JSONB DEFAULT '[]'::jsonb,
  preferred_durations JSONB DEFAULT '[]'::jsonb,
  preferred_goals JSONB DEFAULT '[]'::jsonb,
  preferred_focus_tags JSONB DEFAULT '[]'::jsonb,
  avoided_focus_tags JSONB DEFAULT '[]'::jsonb,
  engagement_patterns JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all preferences
CREATE POLICY "Admins can view all preferences"
ON public.user_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add consent tracking columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_accepted_march_data_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS march_data_consent_date TIMESTAMP WITH TIME ZONE;