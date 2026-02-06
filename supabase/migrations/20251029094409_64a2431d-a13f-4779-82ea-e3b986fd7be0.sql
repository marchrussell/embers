-- Add teacher_name column to classes table
ALTER TABLE public.classes
ADD COLUMN teacher_name TEXT;