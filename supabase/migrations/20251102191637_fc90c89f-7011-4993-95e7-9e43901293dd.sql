-- Add image_url column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for category images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Category images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update category images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete category images" ON storage.objects;

-- Create storage policies for category images
CREATE POLICY "Category images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'category-images' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'category-images' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'category-images' AND
  auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
);
