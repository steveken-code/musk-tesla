
-- Step 1: Drop all existing policies on chat_typing_status
DROP POLICY IF EXISTS "Admins can manage typing status" ON public.chat_typing_status;
DROP POLICY IF EXISTS "Users can upsert own typing status" ON public.chat_typing_status;
DROP POLICY IF EXISTS "Users can view typing in own conversations" ON public.chat_typing_status;

-- Step 2: Change user_id from uuid to text to support guest IDs like "guest-abc123"
ALTER TABLE public.chat_typing_status ALTER COLUMN user_id TYPE text USING user_id::text;

-- Step 3: Create new inclusive policies

-- Anyone can read typing status (ephemeral, non-sensitive data)
CREATE POLICY "Anyone can view typing status"
ON public.chat_typing_status
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can insert/update their own typing status
CREATE POLICY "Authenticated users can insert typing status"
ON public.chat_typing_status
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()::text
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Authenticated users can update typing status"
ON public.chat_typing_status
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()::text
  OR public.has_role(auth.uid(), 'admin')
);

-- Guests (anon) can insert typing status for guest conversations (user_id IS NULL)
CREATE POLICY "Guests can insert typing status"
ON public.chat_typing_status
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND chat_conversations.user_id IS NULL
  )
);

-- Guests (anon) can update typing status for guest conversations
CREATE POLICY "Guests can update typing status"
ON public.chat_typing_status
FOR UPDATE
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND chat_conversations.user_id IS NULL
  )
);

-- Admin full access for DELETE (cleanup)
CREATE POLICY "Admins can delete typing status"
ON public.chat_typing_status
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
