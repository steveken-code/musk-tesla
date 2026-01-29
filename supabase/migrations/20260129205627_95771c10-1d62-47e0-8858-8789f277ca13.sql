-- Drop the overly permissive insert policy and create a more restrictive one
DROP POLICY IF EXISTS "Authenticated users can insert referrals" ON public.referrals;

-- Only allow insert where the referred_user_id matches the authenticated user
-- This ensures users can only create referral records for themselves when signing up
CREATE POLICY "Users can create referral for themselves"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_user_id);