-- Allow admins to create referral records
CREATE POLICY "Admins can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));