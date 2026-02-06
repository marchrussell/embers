-- Create table to track subscriptions before user creates their account
CREATE TABLE IF NOT EXISTS public.pending_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins can view all pending subscriptions
CREATE POLICY "Admins can view all pending subscriptions"
ON public.pending_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Service role can manage all pending subscriptions
CREATE POLICY "Service role can manage pending subscriptions"
ON public.pending_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create index for faster email lookups
CREATE INDEX idx_pending_subscriptions_email ON public.pending_subscriptions(email);
CREATE INDEX idx_pending_subscriptions_stripe_customer ON public.pending_subscriptions(stripe_customer_id);