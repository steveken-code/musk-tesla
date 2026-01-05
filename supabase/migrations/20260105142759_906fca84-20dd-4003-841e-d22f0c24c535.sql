-- Create table for logging admin login attempts
CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text NOT NULL DEFAULT 'unknown',
  success boolean NOT NULL DEFAULT false,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON public.admin_login_attempts FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert (edge functions)
CREATE POLICY "Service role can insert login attempts"
ON public.admin_login_attempts FOR INSERT
WITH CHECK (true);

-- Create table for 2FA codes
CREATE TABLE public.admin_2fa_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '5 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_2fa_codes ENABLE ROW LEVEL SECURITY;

-- No direct user access to 2FA codes
CREATE POLICY "No direct user access to 2FA codes"
ON public.admin_2fa_codes FOR ALL
USING (false);

-- Create index for faster lookups
CREATE INDEX idx_admin_login_attempts_email_created ON public.admin_login_attempts(email, created_at DESC);
CREATE INDEX idx_admin_login_attempts_ip_created ON public.admin_login_attempts(ip_address, created_at DESC);
CREATE INDEX idx_admin_2fa_codes_email_code ON public.admin_2fa_codes(email, code);