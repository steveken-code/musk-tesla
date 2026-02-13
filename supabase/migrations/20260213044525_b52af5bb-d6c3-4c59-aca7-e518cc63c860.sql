
-- Add new columns to chat_conversations for specialist tracking
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS guest_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS guest_name text,
ADD COLUMN IF NOT EXISTS specialist_joined boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS specialist_joined_at timestamp with time zone;

-- Create chat_verification_codes table for guest email verification
CREATE TABLE public.chat_verification_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert verification codes (needed for guest flow)
CREATE POLICY "Anyone can insert verification codes"
ON public.chat_verification_codes
FOR INSERT
WITH CHECK (true);

-- Allow anon to select verification codes (for checking their own code)
CREATE POLICY "Anyone can view verification codes"
ON public.chat_verification_codes
FOR SELECT
USING (true);

-- Allow anon to update verification codes (to mark as verified)
CREATE POLICY "Anyone can update verification codes"
ON public.chat_verification_codes
FOR UPDATE
USING (true);

-- Allow admins full access
CREATE POLICY "Admins can manage verification codes"
ON public.chat_verification_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin_settings read policy for specialist settings (anon needs to read it for chat widget)
CREATE POLICY "Anyone can read specialist settings"
ON public.admin_settings
FOR SELECT
USING (setting_key = 'specialist_settings');

-- Enable realtime for chat_verification_codes
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_verification_codes;
