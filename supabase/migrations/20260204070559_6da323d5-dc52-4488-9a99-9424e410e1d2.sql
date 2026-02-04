-- Security Hardening: Fix referral fraud and data harvesting vulnerabilities

-- Issue 1A: Remove dangerous INSERT policy for referrals
-- Referrals should ONLY be created by the database trigger handle_referral_signup
DROP POLICY IF EXISTS "Users can create referral for themselves" ON referrals;

-- Issue 2A: Remove overly permissive profile access policy
-- This exposed full profile (email, phone) to referrers
DROP POLICY IF EXISTS "Users can view referred user profiles" ON profiles;

-- Issue 2B: Create secure RPC function that only returns non-sensitive data
CREATE OR REPLACE FUNCTION get_referred_user_summary(p_referred_user_id uuid)
RETURNS TABLE(full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.full_name, 'User') as full_name,
    p.avatar_url
  FROM profiles p
  WHERE p.user_id = p_referred_user_id
  AND EXISTS (
    SELECT 1 FROM referrals r
    WHERE r.referrer_user_id = auth.uid()
    AND r.referred_user_id = p_referred_user_id
  );
$$;