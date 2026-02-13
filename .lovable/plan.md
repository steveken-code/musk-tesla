

# Comprehensive Chat System Overhaul, Email Fixes, and UI Improvements

This is a large set of changes spanning the chat system, email templates, password reset, and the landing page. Here is the full breakdown organized into phases.

---

## Phase 1: Chat Support System Overhaul

### 1A. New Chat Flow (User/Guest Side)

The chat widget will be redesigned with a multi-step flow inspired by the Deriv broker reference:

**Step 1 - Support Center Landing**
- Header shows "Support Center" with the two-chats icon (uploaded image) and 2 overlapping placeholder avatars (one male, one female silhouette)
- Text: "Questions? Chat with us." with a green dot and "Typically replies under [admin-configured time]"
- Default/custom greeting bubble appears

**Step 2 - Name and Email Form**
- When user types their first message, show a form asking for Name and Email
- Logged-in users skip this step (name/email auto-filled from profile)
- Clean form layout matching the reference screenshot

**Step 3 - Email Verification (4-digit code)**
- A 4-digit code is sent to the guest's email from "Tesla Stock Platform no-reply@msktesla.net"
- Guest enters the code to verify
- Message: "If you do not see the email in your inbox, please check your spam folder"

**Step 4 - Waiting for Specialist**
- After verification: "Please hold while we connect you to our customer support specialist."
- An email notification is sent to the admin email (b95157777@gmail.com)
- The conversation is created in the database

**Step 5 - Specialist Joins**
- A divider line appears: "New" followed by "[Specialist Name] joined the conversation"
- The header changes to show the specialist's name, image, "Active" with green dot
- The specialist sends their intro message (e.g., "Hi! My name is [Name] from Tesla Stock Platform...")

**Step 6 - Chat Resolution**
- After resolving, specialist asks "Is there anything else I can help you with?"
- If user says no or doesn't reply for a configurable timeout, the chat closes
- Admin can also manually close the chat
- Once closed, it reverts to the Support Center landing screen

### 1B. Admin Panel Changes

**New Admin Settings: "Customer Support Specialist"**
- Editable specialist name (label says "Customer Support Specialist Name", not "Agent")
- Specialist image upload (reuse existing avatar upload functionality)
- These are separate from the existing "Support Profile" settings which control the Support Center defaults

**Admin Chat Panel Updates**
- When admin selects a conversation and clicks "Join", a system message "[Specialist Name] joined the conversation" is inserted
- The specialist name/image from admin settings is used
- Admin can close conversations with a "Close Chat" button

### 1C. Database Changes

New table or additions needed:
- Add `guest_verified` boolean column to `chat_conversations` (to track if guest completed email verification)
- Add `specialist_joined` boolean and `specialist_joined_at` timestamp to `chat_conversations`
- New table `chat_verification_codes` with columns: id, email, code (4-digit), conversation_id, expires_at, verified, created_at
- Add `guest_name` column to `chat_conversations` for verified guest display name

### 1D. New Edge Function: `send-chat-verification`

Sends a 4-digit verification code to the guest's email using the standard Tesla Red email template (light theme, 650px width).

---

## Phase 2: Chat Icon Update

- Copy the uploaded two-chats icon (`2_chats-removebg-preview-2.png`) to `src/assets/chat-support-icon.png`
- Use this icon for the floating chat bubble and Support Center landing
- When a specialist joins, the header switches to the specialist's image/name

---

## Phase 3: Password Reset Fix

**Root Cause Investigation**: The `complete-password-reset` edge function returns a generic "Failed to update password. Please try again." when Supabase Auth rejects the password. Supabase may enforce additional password policies (e.g., leaked password detection) that the frontend doesn't know about.

**Fix**:
- In the edge function, capture and forward the actual Supabase Auth error message (e.g., "Password is too weak" or specific policy violations) instead of hiding it
- Ensure the frontend properly displays this specific error
- The CORS in `complete-password-reset` needs to also allow lovable.app/lovableproject.com origins for testing

---

## Phase 4: Chat Message Glitch Fix

**Issue**: User's first message doesn't appear until page refresh.

**Root Cause**: When a user sends their first message, the conversation is created and the message is inserted. However, the realtime subscription is set up AFTER `setConversationId` - there's a race condition where the INSERT happens before the subscription is active.

**Fix**: After inserting the first message, immediately add it to the local `messages` state (optimistic update) instead of relying solely on the realtime subscription to catch it.

---

## Phase 5: Email Template Fixes

### 5A. Withdrawal Confirmation - Convert to Light Theme
The `send-withdrawal-confirmation` function currently uses a dark theme (black background). Convert to the standard light theme:
- White background (#f3f4f6 outer, #ffffff card)
- Tesla Red gradient header
- 650px width
- "Hello [Name]," greeting style
- Electric Blue section headers
- Green for money values

### 5B. Crypto vs Bank Withdrawal Differentiation
- Same template layout for both crypto and bank withdrawals
- Different writeup: crypto shows "USDT Wallet Address" while bank shows "Bank Account"
- The payment method field already exists - just ensure the template wording adapts

### 5C. KYC Verification Approved Email
- Review the `send-settlement-required` template to ensure it matches standard sizing (650px) and doesn't feel "tight"
- Ensure proper spacing and padding

---

## Phase 6: Landing Page Updates

### 6A. Lighten the Hero Background
- Reduce the overlay opacity from `from-background/95` to approximately `from-background/80`
- Reduce `via-background/75` to `via-background/55`
- This keeps the dark theme but lets the background images show through more

### 6B. "Create Account" to "Open Account"
- Change the button text from "Create Account" to "Open Account" in the Hero component
- When clicked, navigate to `/auth` which shows the signup form (already works this way)
- Update the translation key `createAccount` usage in Hero to use "Open Account"

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LiveChatWidget.tsx` | Major rewrite: multi-step flow, verification, specialist joining, Support Center landing |
| `src/components/admin/AdminChatPanel.tsx` | Add "Join" and "Close Chat" buttons, specialist name system messages |
| `src/pages/Admin.tsx` | Add specialist settings section in admin panel |
| `src/components/Hero.tsx` | Lighten background, change "Create Account" to "Open Account" |
| `supabase/functions/complete-password-reset/index.ts` | Forward actual Supabase Auth error, fix CORS |
| `supabase/functions/send-withdrawal-confirmation/index.ts` | Convert dark theme to standard light theme |
| `supabase/functions/send-chat-verification/index.ts` | **New** - sends 4-digit email verification code |
| Database migration | New columns on chat_conversations, new chat_verification_codes table |

### New Assets
| File | Source |
|------|--------|
| `src/assets/chat-support-icon.png` | Uploaded two-chats icon for Support Center bubble |

---

## Technical Notes

- The chat verification code uses the same Resend email service already configured
- RLS policies will be needed for the new `chat_verification_codes` table (allow anon insert/select for verification flow)
- The specialist "join" action inserts a system message with `sender_type: 'system'` (new type to add)
- Chat auto-close timeout can be stored in `admin_settings` alongside existing chat settings
- The optimistic message update for the glitch fix adds the message to local state immediately after successful insert, before the realtime subscription catches it

