-- Add stripe_session_id to pending_subscriptions table
ALTER TABLE pending_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Add index for faster lookups by session_id
CREATE INDEX IF NOT EXISTS idx_pending_subscriptions_session_id 
ON pending_subscriptions(stripe_session_id);

-- Add comment
COMMENT ON COLUMN pending_subscriptions.stripe_session_id IS 'Stripe checkout session ID for users who paid but have not completed account setup';