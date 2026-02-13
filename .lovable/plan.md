

## Professional Chat System Upgrades

This plan covers 7 major improvements to make the support chat system fully professional.

---

### 1. Fix Duplicate Messages (User/Guest side)

**Problem**: When a user sends a message, an optimistic message with a `temp-` ID is added immediately. When the realtime subscription receives the actual inserted message (with a real UUID), it doesn't match the temp ID, so the message appears twice.

**Fix**: Update the realtime handler in `LiveChatWidget.tsx` to detect and replace optimistic (`temp-`) messages when the real message arrives, matching by `sender_type`, `message` content, and close timestamp.

---

### 2. Scrollable Chat Area (Not Main Page)

**Problem**: When the chat widget is open, scrolling inside the chat can sometimes scroll the main webpage behind it.

**Fix**: Add `overflow: hidden` to `document.body` when the chat widget is open, and restore it when closed. Also ensure the chat messages container uses proper `overflow-y-auto` with `overscroll-behavior: contain` to trap scroll events inside the widget.

---

### 3. Auto-Join Greeting Message for Admin

When the admin clicks "Join", automatically send a configurable greeting message like:
> "Hello! My name is [Specialist Name], your dedicated support specialist. How can I assist you today?"

**Implementation**:
- Add an editable "Join Greeting" text field in the admin specialist settings section
- Store it in `admin_settings` under the existing `specialist_settings` key
- When admin clicks "Join", after the system message, auto-populate the reply textarea with this greeting so admin can review and hit send (not auto-send, giving admin control to edit first)

---

### 4. Session Timeout with Warning

**Timeout duration**: 15 minutes of inactivity (appropriate for a support chat on an investment platform -- keeps sessions secure without being too aggressive).

**Implementation**:
- Track last activity timestamp (message sent/received, typing) in `LiveChatWidget.tsx`
- At 12 minutes: show a warning banner inside the chat: "Your session will time out in 3 minutes due to inactivity."
- At 15 minutes: display a timeout message: "Your session has timed out due to inactivity. For your security, please start a new chat to continue." Then close the conversation.
- Insert a system message so admin can also see the timeout occurred.

---

### 5. AI Agent Suggested Replies for Admin

When a user or guest sends a message, an AI agent will automatically generate a suggested reply and pre-fill the admin's reply textarea.

**Implementation**:
- Create a new edge function `supabase/functions/ai-chat-suggest/index.ts` that:
  - Receives the conversation history and latest user message
  - Calls Lovable AI (google/gemini-3-flash-preview) with a system prompt instructing it to reply as a professional Tesla Stock Platform support specialist
  - Returns the suggested reply text
- In `AdminChatPanel.tsx`:
  - When a new user message arrives (via realtime), automatically call the edge function
  - Show a small "AI Suggesting..." indicator
  - Pre-fill the reply textarea with the AI suggestion
  - Admin reviews, optionally edits, then hits Send manually
  - The AI never sends automatically -- admin always has final control

---

### 6. Typing Indicators (Bouncing Dots) -- Both Directions

**Current state**: Admin already sees user typing dots. User side has `adminTyping` state but needs verification that the bouncing dots render is present.

**Fixes**:
- Ensure the user/guest chat widget shows 3 bouncing dots when admin is typing (verify the render exists in the chatting view)
- Ensure the admin panel shows 3 bouncing dots when user/guest is typing (already implemented at line 504-519)
- Both sides already broadcast typing via `chat_typing_status` table -- just need to confirm the UI renders in all chat states

---

### 7. Increase User/Guest Message Input Size

Make the message input textarea in the user/guest chat widget slightly larger for a better typing experience, matching the admin's updated input size.

---

### Technical Details

**Files to create:**
- `supabase/functions/ai-chat-suggest/index.ts` -- AI suggestion edge function

**Files to modify:**
- `src/components/LiveChatWidget.tsx` -- Fix duplicates, scroll lock, timeout logic, typing dots, input size
- `src/components/admin/AdminChatPanel.tsx` -- AI suggestion integration, auto-join greeting, join greeting settings UI

**Edge function approach (AI suggestions):**
- Uses `LOVABLE_API_KEY` (already configured)
- Model: `google/gemini-3-flash-preview`
- System prompt tailored as a professional support specialist for a Tesla stock investment platform
- Non-streaming (simple invoke) since we just need the full suggested text

**Database**: No schema changes needed. All new settings stored in existing `admin_settings` table.

