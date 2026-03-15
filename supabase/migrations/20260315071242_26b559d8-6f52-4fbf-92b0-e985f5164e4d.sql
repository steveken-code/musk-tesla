
ALTER TABLE public.chat_conversations 
ADD COLUMN IF NOT EXISTS vip_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vip_persona_name text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS vip_persona_image text DEFAULT NULL;
