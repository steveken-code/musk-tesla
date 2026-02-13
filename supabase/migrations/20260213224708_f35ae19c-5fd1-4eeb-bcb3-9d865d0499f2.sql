-- Add RLS read policy for tier_plans_settings on admin_settings
CREATE POLICY "Allow public read of tier_plans_settings"
ON public.admin_settings
FOR SELECT
TO anon, authenticated
USING (setting_key = 'tier_plans_settings');

-- Insert default tier plans settings
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('tier_plans_settings', '{
  "tiers": [
    {"name": "Starter Plan", "minAmount": 500, "maxAmount": 6999, "profitMin": 5, "profitMax": 10, "features": ["Basic portfolio tracking", "Weekly profit reports", "Email support", "Standard processing"]},
    {"name": "Regular Plan", "minAmount": 7000, "maxAmount": 14999, "profitMin": 10, "profitMax": 15, "features": ["Advanced analytics", "Daily profit reports", "Priority support", "Fast processing"]},
    {"name": "Gold Plan", "minAmount": 15000, "maxAmount": 999999, "profitMin": 15, "profitMax": 25, "features": ["VIP analytics suite", "Real-time profit tracking", "Dedicated account manager", "Instant processing"]}
  ]
}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;