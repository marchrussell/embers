-- Fix critical security issues with RLS policies

-- 1. Protect newsletter_subscribers from public harvesting
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON newsletter_subscribers;

-- Newsletter subscribers: Only allow INSERT for everyone (for signup), no SELECT/UPDATE/DELETE for public
CREATE POLICY "Allow public newsletter signup"
ON newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- Admin can manage all newsletter subscribers (using user_roles table for admin check)
CREATE POLICY "Admin full access to newsletters"
ON newsletter_subscribers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Protect payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Users can view own payments" ON payments;

-- Users can view their own payments
CREATE POLICY "Users view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Only system (service_role) can insert payments
-- No policy for INSERT means only service_role can insert

-- Admin can view all payments
CREATE POLICY "Admin view all payments"
ON payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Protect user_subscriptions table
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "Users view own subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Only system (service_role) can insert/update subscriptions
-- No INSERT/UPDATE policies means only service_role can modify

-- Admin can view all subscriptions
CREATE POLICY "Admin view all subscriptions"
ON user_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Protect event_bookings table from unauthorized updates/deletes
-- SELECT and INSERT are already protected, add UPDATE/DELETE protection

-- Drop if exists
DROP POLICY IF EXISTS "Users can update own event bookings" ON event_bookings;
DROP POLICY IF EXISTS "Users can delete own event bookings" ON event_bookings;
DROP POLICY IF EXISTS "Admin manage event bookings" ON event_bookings;

CREATE POLICY "Users can update own event bookings"
ON event_bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own event bookings"
ON event_bookings FOR DELETE
USING (auth.uid() = user_id);

-- Admin can manage all event bookings
CREATE POLICY "Admin manage event bookings"
ON event_bookings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Protect mentorship_calls table
-- Already has RLS enabled, add missing policies

-- Drop if exists
DROP POLICY IF EXISTS "Users view own mentorship calls" ON mentorship_calls;
DROP POLICY IF EXISTS "Users can insert own mentorship calls" ON mentorship_calls;
DROP POLICY IF EXISTS "Users update own mentorship calls" ON mentorship_calls;
DROP POLICY IF EXISTS "Admin manage mentorship calls" ON mentorship_calls;

CREATE POLICY "Users view own mentorship calls"
ON mentorship_calls FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mentorship calls"
ON mentorship_calls FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mentorship calls"
ON mentorship_calls FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admin manage mentorship calls"
ON mentorship_calls FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));