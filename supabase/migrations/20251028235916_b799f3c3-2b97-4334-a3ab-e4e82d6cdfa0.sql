-- Add new mentorship roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentorship_diy';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentorship_guided';