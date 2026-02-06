-- Add meeting_link column to profiles table for storing individual client meeting URLs
ALTER TABLE public.profiles 
ADD COLUMN meeting_link text;

COMMENT ON COLUMN public.profiles.meeting_link IS 'Personal Google Meet or Calendly link for each mentorship client';