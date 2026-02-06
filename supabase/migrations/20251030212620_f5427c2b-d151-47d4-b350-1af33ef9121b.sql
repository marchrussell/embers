-- Add general mentorship notes field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentorship_notes text;