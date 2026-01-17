-- Create table for tracking user login attempts
CREATE TABLE public.user_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT 'unknown',
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_login_attempts ENABLE ROW LEVEL SECURITY;

-- Admins can view all login attempts
CREATE POLICY "Admins can view all user login attempts"
ON public.user_login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert login attempts (from edge functions)
CREATE POLICY "Service role can insert user login attempts"
ON public.user_login_attempts
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_user_login_attempts_created_at ON public.user_login_attempts(created_at DESC);
CREATE INDEX idx_user_login_attempts_user_id ON public.user_login_attempts(user_id);