-- Create email_tracking table to manage email sequences
CREATE TABLE IF NOT EXISTS email_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type text NOT NULL, -- 'post_payment_setup', 'onboarding_complete', 'failed_payment', etc.
  sequence_step integer NOT NULL DEFAULT 1,
  last_sent_at timestamp with time zone,
  next_send_at timestamp with time zone,
  completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_email_tracking_email ON email_tracking(email);
CREATE INDEX IF NOT EXISTS idx_email_tracking_user_id ON email_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_email_tracking_type ON email_tracking(email_type);
CREATE INDEX IF NOT EXISTS idx_email_tracking_next_send ON email_tracking(next_send_at) WHERE completed = false;

-- Enable RLS
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;

-- Admins can view all email tracking
CREATE POLICY "Admins can view all email tracking"
ON email_tracking FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage all email tracking
CREATE POLICY "Service role can manage email tracking"
ON email_tracking FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_email_tracking_updated_at
BEFORE UPDATE ON email_tracking
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE email_tracking IS 'Tracks email sequences and automation state for all email flows';