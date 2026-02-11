
-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT,
  user_email TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID,
  message TEXT,
  image_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see their own conversations
CREATE POLICY "Users can view their own conversations"
ON public.chat_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.chat_conversations FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can see all conversations
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all conversations"
ON public.chat_conversations FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for messages: users see messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_type = 'user' AND
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

-- Admins can see and send all messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
  sender_type = 'admin' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update messages"
ON public.chat_messages FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');
