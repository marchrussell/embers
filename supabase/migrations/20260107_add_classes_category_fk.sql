-- Add category_id column to classes table with foreign key constraint
-- This enables direct category assignment to classes (independent of programs)
-- and allows Supabase PostgREST to perform relational queries

ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_category_id ON public.classes(category_id);
