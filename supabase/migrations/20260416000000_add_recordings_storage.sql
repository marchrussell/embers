-- Create the recordings bucket for live session replay videos.
-- weekly-reset replays are stored as temporary Daily.co links (7-day expiry).
-- All other session types (monthly-presence, guest-session, etc.) are uploaded here
-- for permanent hosting and browser-playable access.

INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
VALUES ('recordings', 'recordings', true, ARRAY['video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies

DROP POLICY IF EXISTS "Anyone can view recordings" ON storage.objects;

CREATE POLICY "Anyone can view recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'recordings');

-- No INSERT/UPDATE/DELETE policy for authenticated users.
-- Uploads come exclusively from the daily-fetch-recording edge function,
-- which uses the service role key and therefore bypasses RLS entirely.
