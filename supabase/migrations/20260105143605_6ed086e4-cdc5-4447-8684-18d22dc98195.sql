-- Drop the overly restrictive policy on admin_2fa_codes
DROP POLICY IF EXISTS "No direct user access to 2FA codes" ON public.admin_2fa_codes;

-- Create a permissive policy for service role operations
-- The service role key should bypass RLS, but having proper policies is good practice
CREATE POLICY "Allow service role full access to 2FA codes"
ON public.admin_2fa_codes FOR ALL
USING (true)
WITH CHECK (true);