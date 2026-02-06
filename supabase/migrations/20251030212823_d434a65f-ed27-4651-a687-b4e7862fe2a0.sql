-- Add phone number field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number text;