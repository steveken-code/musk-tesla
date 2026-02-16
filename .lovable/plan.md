

## Fix: Typing Indicators for Guests, Users, and Admin

### The Problem

The 3 bouncing dots (typing indicator) don't work because of security policy restrictions on the `chat_typing_status` table:

- **Guests** (not logged in) can't write their typing status, so admin never sees them typing
- **Guests** can't read typing status either, so they never see the admin's bouncing dots
- **Logged-in users** can write but can only read their own conversations -- this part should work but may also be affected

### The Fix

**Step 1: Update database security policies** on `chat_typing_status` to allow guest access

Remove the restrictive policies and replace them with ones that also cover anonymous/guest users:

1. **Allow anyone to upsert typing status** for conversations they belong to (matching either `auth.uid()` or the guest_id stored in the conversation)
2. **Allow anyone to read typing status** for conversations they belong to
3. Keep admin full access as-is

New policies:
- `SELECT`: Allow reading if user owns the conversation (via `auth.uid()`) OR if the conversation's `guest_id` matches the typing user's ID (for guest access via the anon key)
- `INSERT/UPDATE`: Allow upserting if the `user_id` matches `auth.uid()`, OR allow anon role to upsert for guest IDs that match an existing conversation's `guest_id`

Since guests use the Supabase anon key (unauthenticated), we need to permit the `anon` role to interact with this table for valid conversations.

**Step 2: Simplify with broad but safe policies**

Since `chat_typing_status` is ephemeral (just flags that auto-clear after 3 seconds), we can safely use broader policies:
- Allow `anon` and `authenticated` roles to SELECT all typing statuses (the data is just conversation_id + is_typing, not sensitive)
- Allow `anon` to INSERT/UPDATE typing rows where the `user_id` matches a `guest_id` in `chat_conversations`
- Keep the existing authenticated user and admin policies

### Files Modified

- **Database migration**: Update RLS policies on `chat_typing_status`
  - Drop old restrictive policies
  - Add new policies that cover guest (anon) access
  - Allow SELECT for anyone on typing status rows tied to valid conversations
  - Allow upsert for guests using their guest_id

### No Code Changes Needed

The React code in both `LiveChatWidget.tsx` and `AdminChatPanel.tsx` already has the correct logic for broadcasting and subscribing to typing events. The only blocker is the database policies silently rejecting guest requests.
