-- Add is_quick_reset flag to classes table
-- Allows admins to mark multiple classes as "Quick Resets" for display on the Home tab
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_quick_reset BOOLEAN DEFAULT FALSE;
