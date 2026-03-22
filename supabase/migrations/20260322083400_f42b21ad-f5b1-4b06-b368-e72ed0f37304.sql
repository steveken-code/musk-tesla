CREATE POLICY "Anyone can read dashboard_notification"
ON public.admin_settings
FOR SELECT
TO anon, authenticated
USING (setting_key = 'dashboard_notification');