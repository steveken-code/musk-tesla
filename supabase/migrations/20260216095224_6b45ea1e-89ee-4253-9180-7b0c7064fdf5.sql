
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can insert verification codes" ON public.chat_verification_codes;
DROP POLICY IF EXISTS "Anyone can view verification codes" ON public.chat_verification_codes;
DROP POLICY IF EXISTS "Anyone can update verification codes" ON public.chat_verification_codes;

-- No direct client access to verification codes (all managed by edge functions via service role)
CREATE POLICY "No direct access to verification codes"
ON public.chat_verification_codes
FOR ALL
USING (false);
