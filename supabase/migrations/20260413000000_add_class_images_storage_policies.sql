-- Add RLS policies for the class-images storage bucket.
-- The bucket already exists but has no policies, causing INSERT to fail for admins.

DROP POLICY IF EXISTS "Anyone can view class images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload class images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update class images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete class images" ON storage.objects;

CREATE POLICY "Anyone can view class images"
ON storage.objects FOR SELECT
USING (bucket_id = 'class-images');

CREATE POLICY "Admins can upload class images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'class-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can update class images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'class-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can delete class images"
ON storage.objects FOR DELETE
USING (bucket_id = 'class-images' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));
