-- Add actioned status tracking to feedback table
ALTER TABLE public.feedback
ADD COLUMN IF NOT EXISTS actioned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS actioned_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS actioned_by uuid REFERENCES auth.users(id);

-- Create index for faster queries on actioned feedback
CREATE INDEX IF NOT EXISTS idx_feedback_actioned ON public.feedback(actioned, created_at DESC);