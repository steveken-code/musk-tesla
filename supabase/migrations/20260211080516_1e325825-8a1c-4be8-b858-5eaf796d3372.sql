
-- Create typing status table for real-time typing indicators
CREATE TABLE public.chat_typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.chat_typing_status ENABLE ROW LEVEL SECURITY;

-- Users can manage their own typing status
CREATE POLICY "Users can upsert own typing status"
ON public.chat_typing_status FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage their own typing status  
CREATE POLICY "Admins can manage typing status"
ON public.chat_typing_status FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can see typing status in their conversations
CREATE POLICY "Users can view typing in own conversations"
ON public.chat_typing_status FOR SELECT
USING (EXISTS (
  SELECT 1 FROM chat_conversations 
  WHERE chat_conversations.id = chat_typing_status.conversation_id 
  AND chat_conversations.user_id = auth.uid()
));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_typing_status;
