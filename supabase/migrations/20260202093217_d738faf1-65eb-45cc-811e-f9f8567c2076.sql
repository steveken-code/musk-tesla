-- Create a secure function to validate referral codes
-- This handles the UUID-to-text conversion server-side since PostgREST can't do type casting
CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_normalized_code text;
  v_referrer_id uuid;
BEGIN
  -- Normalize the code (uppercase, no dashes)
  v_normalized_code := UPPER(REPLACE(p_code, '-', ''));
  
  -- Find a profile whose user_id starts with this code
  SELECT user_id INTO v_referrer_id
  FROM profiles
  WHERE UPPER(REPLACE(LEFT(user_id::text, 8), '-', '')) = v_normalized_code
  LIMIT 1;
  
  RETURN v_referrer_id;
END;
$$;