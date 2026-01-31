-- Attach the referral signup trigger to the profiles table
CREATE TRIGGER on_profile_referral_code_update
  AFTER INSERT OR UPDATE OF referral_code ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NOT NULL AND NEW.referral_code != '')
  EXECUTE FUNCTION public.handle_referral_signup();