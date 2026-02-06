-- Add requires_subscription field to classes table
ALTER TABLE public.classes
ADD COLUMN requires_subscription BOOLEAN DEFAULT false;

-- Add requires_subscription field to programs table
ALTER TABLE public.programs
ADD COLUMN requires_subscription BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.classes.requires_subscription IS 'If true, users need an active subscription to access this class';
COMMENT ON COLUMN public.programs.requires_subscription IS 'If true, users need an active subscription to access this program';