-- Create session feedback table for post-session check-ins
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  helped_with_goal BOOLEAN,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, class_id, created_at)
);

-- Enable RLS
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own feedback"
  ON public.session_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
  ON public.session_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
  ON public.session_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_feedback_user_id ON public.session_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_class_id ON public.session_feedback(class_id);
CREATE INDEX IF NOT EXISTS idx_session_feedback_created_at ON public.session_feedback(created_at DESC);

-- Add learning patterns to user_preferences engagement_patterns
COMMENT ON COLUMN public.user_preferences.engagement_patterns IS 'Stores learning patterns like completion rates, favorite session times, and success metrics';