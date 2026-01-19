-- Fix admin_2fa_codes RLS policy - ensure service_role only with auth check
DROP POLICY IF EXISTS "Service role can manage 2FA codes" ON public.admin_2fa_codes;

CREATE POLICY "Service role can manage 2FA codes"
ON public.admin_2fa_codes FOR ALL
USING (
  auth.uid() IS NOT NULL AND 
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  ((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text
);

-- Fix admin_settings RLS policies - add auth.uid() IS NOT NULL checks
DROP POLICY IF EXISTS "Admins can view all settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;

CREATE POLICY "Only admins can view settings"
ON public.admin_settings FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can update settings"
ON public.admin_settings FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Only admins can insert settings"
ON public.admin_settings FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  has_role(auth.uid(), 'admin'::app_role)
);