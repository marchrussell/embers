-- Add quick_note field to profiles for admin quick notes
ALTER TABLE public.profiles 
ADD COLUMN quick_note text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.quick_note IS 'Short admin note for quick reference about this client';