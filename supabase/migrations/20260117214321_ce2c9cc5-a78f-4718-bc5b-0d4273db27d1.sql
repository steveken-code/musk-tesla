-- Fix admin 2FA flow: allow service-role Edge Functions to manage codes while keeping table inaccessible to normal clients

-- Remove the overly-restrictive policy that blocks inserts (and therefore breaks 2FA generation)
DROP POLICY IF EXISTS "No direct access to 2FA codes" ON public.admin_2fa_codes;

-- Allow ONLY service-role requests (Edge Functions using the service key) to read/write 2FA codes
-- Everyone else remains blocked because RLS is enabled and no other policies exist.
CREATE POLICY "Service role can manage 2FA codes"
ON public.admin_2fa_codes
FOR ALL
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
)
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);
