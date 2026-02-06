-- Fix newsletter_subscribers RLS: Only admins can view subscribers
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON newsletter_subscribers;

CREATE POLICY "Only admins can view subscribers"
ON newsletter_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Fix payments table: Add service-role-only INSERT policy
CREATE POLICY "Only service role can create payments"
ON payments
FOR INSERT
TO service_role
WITH CHECK (true);