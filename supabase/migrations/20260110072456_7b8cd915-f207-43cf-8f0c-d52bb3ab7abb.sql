-- Add referral_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create index for faster referral code lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

-- Create referral settings in admin_settings if not exists
INSERT INTO public.admin_settings (setting_key, setting_value)
VALUES ('referral_settings', '{"referralCode": "TATY-8492", "referralEmail": "tanyusha.pilipyak@mail.ru"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;