ALTER TABLE public.classes
  ADD COLUMN intensity TEXT CHECK (
    intensity IN ('Gentle', 'Gentle–Moderate', 'Moderate', 'Moderate–Strong', 'Strong', 'Very Strong')
  );
