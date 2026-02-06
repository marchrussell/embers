-- Create table to track module unlocks per user
CREATE TABLE IF NOT EXISTS public.user_module_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL REFERENCES public.mentorship_modules(id) ON DELETE CASCADE,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  unlocked_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.user_module_unlocks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all unlocks
CREATE POLICY "Admins can manage module unlocks"
ON public.user_module_unlocks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own unlocks
CREATE POLICY "Users can view own module unlocks"
ON public.user_module_unlocks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_module_unlocks_user_id ON public.user_module_unlocks(user_id);
CREATE INDEX idx_user_module_unlocks_module_id ON public.user_module_unlocks(module_id);