-- Allow admins to upload support avatars to the avatars bucket
CREATE POLICY "Admins can upload support avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update support avatars
CREATE POLICY "Admins can update support avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete support avatars
CREATE POLICY "Admins can delete support avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND has_role(auth.uid(), 'admin'::app_role)
);