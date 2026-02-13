CREATE POLICY "Anyone can read session timeout settings"
ON public.admin_settings
FOR SELECT
USING (setting_key = 'session_timeout_settings');