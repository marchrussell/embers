-- Add image_url column to sessions table for session thumbnails
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for session images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-images', 'session-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view session images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload session images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update session images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete session images" ON storage.objects;

-- Create RLS policies for session images bucket
CREATE POLICY "Anyone can view session images"
ON storage.objects FOR SELECT
USING (bucket_id = 'session-images');

CREATE POLICY "Admins can upload session images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'session-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can update session images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'session-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can delete session images"
ON storage.objects FOR DELETE
USING (bucket_id = 'session-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));
