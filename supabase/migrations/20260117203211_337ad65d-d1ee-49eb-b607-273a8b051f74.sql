-- Fix permissive RLS policy on admin_2fa_codes table
-- Replace overly permissive policy with restrictive one
-- Service role bypasses RLS anyway, so this maintains functionality while documenting secure intent

DROP POLICY IF EXISTS "Allow service role full access to 2FA codes" ON public.admin_2fa_codes;

CREATE POLICY "No direct access to 2FA codes"
  ON public.admin_2fa_codes FOR ALL
  USING (false)
  WITH CHECK (false);

COMMENT ON POLICY "No direct access to 2FA codes" 
  ON public.admin_2fa_codes IS 
  'Service role bypasses RLS for Edge Functions. Regular users have no access to 2FA codes.';