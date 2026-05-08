-- Fix class-video storage RLS policies.
-- The original policies checked JWT metadata for admin role, but admin roles
-- are stored in the user_roles table, not JWT claims. Use has_role() instead,
-- matching the pattern used for the class-images bucket.

DROP POLICY IF EXISTS "Admins can upload class videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update class videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete class videos" ON storage.objects;

CREATE POLICY "Admins can upload class videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'class-video' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can update class videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'class-video' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));

CREATE POLICY "Admins can delete class videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'class-video' AND (
  SELECT has_role(auth.uid(), 'admin'::app_role)
));
