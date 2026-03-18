-- Step 1: Rename the existing video_url column to audio_url
-- (the column stored audio URLs but was named video_url from the original schema)
ALTER TABLE public.classes RENAME COLUMN video_url TO audio_url;

-- Step 2: Make audio_url nullable (classes can have video instead of audio)
ALTER TABLE public.classes ALTER COLUMN audio_url DROP NOT NULL;

-- Step 3: Add video_url column for actual video content
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Create storage bucket for class videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-video', 'class-video', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: public read
CREATE POLICY "Class videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'class-video');

-- RLS: admin upload
CREATE POLICY "Admins can upload class videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'class-video' AND
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- RLS: admin update
CREATE POLICY "Admins can update class videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'class-video' AND
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- RLS: admin delete
CREATE POLICY "Admins can delete class videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'class-video' AND
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
   auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);
