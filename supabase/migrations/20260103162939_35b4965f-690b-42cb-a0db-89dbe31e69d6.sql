-- Create a table to store custom password reset tokens
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Only the system (via service role) can manage tokens
-- No user-facing policies needed as this is handled by edge functions

-- Create index for faster token lookups
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);

-- Auto-cleanup expired tokens (optional trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() OR used = true;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_old_tokens
AFTER INSERT ON public.password_reset_tokens
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_tokens();