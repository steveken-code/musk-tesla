
-- Allow null user_id for guest conversations
ALTER TABLE chat_conversations ALTER COLUMN user_id DROP NOT NULL;

-- Anon policies for chat_conversations
CREATE POLICY "Anon can create guest conversations"
  ON chat_conversations FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon can view guest conversations"
  ON chat_conversations FOR SELECT TO anon
  USING (user_id IS NULL);

CREATE POLICY "Anon can update guest conversations"
  ON chat_conversations FOR UPDATE TO anon
  USING (user_id IS NULL);

-- Anon policies for chat_messages
CREATE POLICY "Anon can send messages in guest conversations"
  ON chat_messages FOR INSERT TO anon
  WITH CHECK (
    sender_type = 'user' AND
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id IS NULL
    )
  );

CREATE POLICY "Anon can view messages in guest conversations"
  ON chat_messages FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
      AND user_id IS NULL
    )
  );

-- Anon storage policy for chat-images bucket
CREATE POLICY "Anon can upload chat images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'chat-images');
