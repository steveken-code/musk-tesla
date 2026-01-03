-- Allow admins to upload assets
CREATE POLICY "Admins can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update assets
CREATE POLICY "Admins can update assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete assets
CREATE POLICY "Admins can delete assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Drop the previous authenticated users policy and replace with admin-only
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;