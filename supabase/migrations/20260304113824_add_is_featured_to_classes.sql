-- Add is_featured flag to classes table
-- Replaces the separate featured_class denormalization table approach
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
