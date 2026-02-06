-- Add active status and deactivation tracking to user_roles
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS deactivated_at timestamp with time zone;

-- Create index for faster queries on active roles
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(active, user_id);