-- Add missing RLS policies for event_bookings, mentorship_calls, and newsletter_subscribers
-- These were referenced but never created in previous migrations
-- Using DROP POLICY IF EXISTS to make this migration idempotent

-- ============================================
-- EVENT_BOOKINGS - Add missing update/delete policies
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can update own event bookings" ON public.event_bookings;
DROP POLICY IF EXISTS "Users can delete own event bookings" ON public.event_bookings;
DROP POLICY IF EXISTS "Admin manage event bookings" ON public.event_bookings;

-- Users can update their own bookings (e.g., update attendee info)
CREATE POLICY "Users can update own event bookings"
ON public.event_bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete/cancel their own bookings
CREATE POLICY "Users can delete own event bookings"
ON public.event_bookings
FOR DELETE
USING (auth.uid() = user_id);

-- Admin full access policy for event bookings (covers insert/update/delete)
CREATE POLICY "Admin manage event bookings"
ON public.event_bookings
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- MENTORSHIP_CALLS - Add missing insert/update policies
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own calls" ON public.mentorship_calls;
DROP POLICY IF EXISTS "Users view own mentorship calls" ON public.mentorship_calls;
DROP POLICY IF EXISTS "Users can insert own mentorship calls" ON public.mentorship_calls;
DROP POLICY IF EXISTS "Users update own mentorship calls" ON public.mentorship_calls;
DROP POLICY IF EXISTS "Admins can manage all calls" ON public.mentorship_calls;
DROP POLICY IF EXISTS "Admin manage mentorship calls" ON public.mentorship_calls;

-- Users can view their own mentorship calls
CREATE POLICY "Users view own mentorship calls"
ON public.mentorship_calls
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert mentorship calls (for booking)
CREATE POLICY "Users can insert own mentorship calls"
ON public.mentorship_calls
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own mentorship calls (e.g., add notes)
CREATE POLICY "Users update own mentorship calls"
ON public.mentorship_calls
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admin full access for mentorship calls
CREATE POLICY "Admin manage mentorship calls"
ON public.mentorship_calls
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- NEWSLETTER_SUBSCRIBERS - Improve admin access
-- ============================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;

-- Only admins can view all subscribers
CREATE POLICY "Admins can view all newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can manage (update/delete) subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'));
