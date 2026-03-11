-- Add start_here_position to classes table
-- Allows admin to configure which classes appear on the Start Here page (positions 1 and 2)
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS start_here_position SMALLINT DEFAULT NULL;

ALTER TABLE public.classes
  ADD CONSTRAINT classes_start_here_position_check
    CHECK (start_here_position IN (1, 2));

-- Enforce that only one class can hold each position
CREATE UNIQUE INDEX IF NOT EXISTS classes_start_here_position_unique
  ON public.classes (start_here_position)
  WHERE start_here_position IS NOT NULL;
