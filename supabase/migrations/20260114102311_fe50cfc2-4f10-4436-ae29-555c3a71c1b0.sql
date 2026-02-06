-- Fix videos bucket storage policies - make admin-only for upload/update/delete
-- This prevents any authenticated user from modifying class content videos

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own videos" ON storage.objects;

-- Create admin-only upload policy
CREATE POLICY "Only admins can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND active = true
  )
);

-- Create admin-only update policy
CREATE POLICY "Only admins can update videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND active = true
  )
);

-- Create admin-only delete policy
CREATE POLICY "Only admins can delete videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
    AND active = true
  )
);