-- Create a function that runs as SECURITY DEFINER (bypasses RLS)
-- This automatically creates referral records when a user signs up with a referral code
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_referral_code text;
  v_referrer_id uuid;
BEGIN
  -- Get the referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  -- Exit if no referral code
  IF v_referral_code IS NULL OR v_referral_code = '' THEN
    RETURN NEW;
  END IF;
  
  -- Normalize the code (remove dashes, uppercase)
  v_referral_code := UPPER(REPLACE(v_referral_code, '-', ''));
  
  -- Find the referrer by matching their user_id prefix
  SELECT user_id INTO v_referrer_id
  FROM profiles
  WHERE UPPER(REPLACE(LEFT(user_id::text, 8), '-', '')) = v_referral_code
    AND user_id != NEW.user_id
  LIMIT 1;
  
  -- If found, create the referral record
  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO referrals (
      referrer_user_id,
      referred_user_id,
      referral_code,
      status,
      bonus_amount,
      referred_bonus
    ) VALUES (
      v_referrer_id,
      NEW.user_id,
      NEW.referral_code,
      'pending',
      500,
      100
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
-- Fires when a profile is inserted or when referral_code is updated
DROP TRIGGER IF EXISTS on_profile_referral_signup ON profiles;

CREATE TRIGGER on_profile_referral_signup
  AFTER INSERT OR UPDATE OF referral_code ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NOT NULL AND NEW.referral_code != '')
  EXECUTE FUNCTION handle_referral_signup();