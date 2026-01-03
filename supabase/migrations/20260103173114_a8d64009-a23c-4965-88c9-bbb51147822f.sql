-- Add explicit RLS policies to password_reset_tokens table for defense-in-depth
-- Service role bypasses RLS, but this documents security intent

-- Policy: Deny all user access to password_reset_tokens
CREATE POLICY "No direct user access to password reset tokens"
ON public.password_reset_tokens
FOR ALL
USING (false);

-- Add explicit RLS policies to email_verification_tokens table as well
CREATE POLICY "No direct user access to email verification tokens"
ON public.email_verification_tokens
FOR ALL
USING (false);