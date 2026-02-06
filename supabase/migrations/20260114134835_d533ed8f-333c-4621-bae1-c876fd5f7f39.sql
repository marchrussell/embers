-- Create storage bucket for site images with CDN optimization
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for public read access
CREATE POLICY "Public read access for site images"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- RLS policy for authenticated admin uploads
CREATE POLICY "Admin upload access for site images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND active = true
  )
);

-- RLS policy for authenticated admin updates
CREATE POLICY "Admin update access for site images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND active = true
  )
);

-- RLS policy for authenticated admin deletes
CREATE POLICY "Admin delete access for site images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND active = true
  )
);