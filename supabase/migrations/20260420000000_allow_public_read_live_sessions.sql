-- Allow unauthenticated users to read session metadata for scheduled/live sessions.
-- Required so guest teachers (who have no Supabase account) can load /live/{id} pages.
-- Subscription and guest token validation still happen server-side in daily-get-token.
CREATE POLICY "Public can view scheduled and live sessions"
ON public.live_sessions
FOR SELECT
TO public
USING (status IN ('scheduled', 'live'));
