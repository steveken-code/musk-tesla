-- Create trigger to prevent profile critical field updates by regular users
-- This protects email_verified and user_id from being manipulated client-side

CREATE OR REPLACE FUNCTION public.prevent_profile_critical_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent user_id changes (should never change)
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;
  
  -- Only allow email_verified changes from service role (edge functions)
  -- Regular users authenticated with anon key cannot change this
  IF NEW.email_verified IS DISTINCT FROM OLD.email_verified THEN
    -- Check if the caller has service role privileges
    IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
      -- Reset email_verified to the original value
      NEW.email_verified := OLD.email_verified;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce profile update constraints
DROP TRIGGER IF EXISTS enforce_profile_update_constraints ON public.profiles;
CREATE TRIGGER enforce_profile_update_constraints
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_critical_updates();