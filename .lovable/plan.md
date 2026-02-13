

## Fix Notification Badge Visibility + Verify Timeout Logic

---

### 1. Notification Badge Hidden by `overflow-hidden`

**Problem:** The chat bubble button (line 1135) has `overflow-hidden` in its className, which clips the unread count badge positioned at `-top-2 -right-2` (outside the button bounds). This makes the badge partially or fully invisible.

**Fix in `LiveChatWidget.tsx`:**
- Remove `overflow-hidden` from the chat bubble button's className
- Increase badge offset slightly to ensure it sits clearly outside the circle with good visibility
- Keep the existing `ring-2 ring-white` for contrast

---

### 2. Timeout Logic Verification

The timeout logic is correctly implemented:
- Timers start when `conversationId` exists and `chatStep` is `'waiting'` or `'chatting'`
- Warning fires at `sessionTimeoutMs - 3 minutes`
- Timeout fires at `sessionTimeoutMs`, sets `sessionTimedOut = true`, inserts a system message, and closes the conversation
- Activity resets timers on user interaction via `trackActivity()`
- The "Start New Chat" button (already added) properly resets `sessionTimedOut`

No bugs found in the timeout logic itself -- it should work correctly.

---

### Technical Details

**File to modify:**
- `src/components/LiveChatWidget.tsx` -- Remove `overflow-hidden` from chat bubble button (line 1135)

**No database or edge function changes needed.**

