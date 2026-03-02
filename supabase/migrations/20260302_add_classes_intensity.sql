ALTER TABLE public.classes
  ADD COLUMN intensity TEXT CHECK (
    intensity IN ('Gentle–Moderate', 'Moderate', 'Moderate–Strong', 'Strong')
  );
