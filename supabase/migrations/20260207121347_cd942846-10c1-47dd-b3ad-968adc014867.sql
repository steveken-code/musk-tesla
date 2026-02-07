
-- Allow authenticated users to read payment-related settings (crypto_settings, payment_settings)
CREATE POLICY "Users can read payment settings"
ON public.admin_settings
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND setting_key IN ('crypto_settings', 'payment_settings')
);
