-- Allow users to view profiles of users they referred
CREATE POLICY "Users can view referred user profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.referrals
      WHERE referrer_user_id = auth.uid()
      AND referred_user_id = profiles.user_id
    )
  );