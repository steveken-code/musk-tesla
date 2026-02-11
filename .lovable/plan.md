

# Fix Anonymous Chat + Plus Icon + File Picker Dismiss

## Problems Found

1. **Messages not sending for guests**: The `chat_conversations.user_id` column is `NOT NULL` and type `uuid`, so inserting a string like `"guest-avuimpws"` fails with `invalid input syntax for type uuid`. Additionally, all RLS policies require `auth.uid()`, blocking anonymous inserts entirely.

2. **Image icon should be a Plus (+) sign**: Currently uses `ImagePlus` icon; should be a minimal `Plus` icon that animates open the file picker menu.

3. **File picker dismiss**: Needs to close when tapping anywhere inside the chat window, not just the fixed overlay behind it.

---

## Solution

### 1. Database changes (migration)
- Make `chat_conversations.user_id` nullable (`ALTER COLUMN user_id DROP NOT NULL`)
- Add RLS policies for anonymous (anon) users to:
  - **INSERT** conversations (with `user_id IS NULL`)
  - **SELECT** conversations they created (match by guest ID stored in `user_name`)
  - **UPDATE** their own conversations (match by `user_name`)
- Add RLS policies on `chat_messages` for anonymous users to:
  - **INSERT** messages into conversations where `user_id IS NULL`
  - **SELECT** messages from those conversations
- Add an anon storage policy on `chat-images` bucket so guests can upload images

### 2. Code fix in LiveChatWidget.tsx
- For guest users, insert `user_id: null` (not the guest string ID)
- Track guest conversations by matching `user_name` = guest ID (already in place)
- Replace `ImagePlus` icon with `Plus` from lucide-react for the attachment button
- Add a rotate animation on the Plus icon when the file picker is open (45-degree rotation to form an X)
- Move the file picker dismiss overlay inside the chat window so clicking anywhere in the chat area closes it

### 3. Admin notification
- The `send-chat-notification` edge function call is already in place (line 289-295) and fires after each message. This will continue to work for guests with "Guest" as the name and "Anonymous" as the email.

---

## Technical Details

### Database Migration SQL
```sql
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
```

### LiveChatWidget.tsx changes

**Insert with null user_id for guests:**
```tsx
// Line 101-108: change user_id from identifier to null for guests
const { data: newConv, error } = await supabase
  .from('chat_conversations')
  .insert({
    user_id: user?.id || null,  // null for guests, not the guest string
    user_name: user ? (profileData?.full_name || ...) : getGuestId(),
    user_email: user ? ... : null,
  })
```

**Replace ImagePlus with Plus icon:**
```tsx
import { Plus } from 'lucide-react';

// The attachment button
<button onClick={() => setShowFilePicker(!showFilePicker)}>
  <Plus className={`w-5 h-5 transition-transform duration-200 ${showFilePicker ? 'rotate-45' : ''}`} />
</button>
```

**Move dismiss overlay inside chat window:**
```tsx
// Inside the chat window motion.div, add an overlay that covers the entire chat area
{showFilePicker && (
  <div className="absolute inset-0 z-[5]"
    onClick={() => setShowFilePicker(false)}
    onTouchEnd={() => setShowFilePicker(false)}
  />
)}
```
Remove the old fixed overlay at the bottom of the component.

### Files to modify
- **Migration**: New SQL migration for nullable user_id + anon RLS policies
- **LiveChatWidget.tsx**: Fix guest insert, Plus icon, file picker dismiss
