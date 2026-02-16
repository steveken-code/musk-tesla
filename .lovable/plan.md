

## Fix Admin Panel Visibility + Chat Greeting Flow

### Issues Identified

1. **Investment/Withdrawal notification badges are tight and numbers not visible** -- The tab notification badges (`w-5 h-5`) are too small and overlap the button edges, making the count hard to read on both desktop and mobile.

2. **Join Greeting settings panel on mobile uses white background** -- The `AdminChatPanel.tsx` greeting settings panel uses `bg-white/95 dark:bg-slate-800` but on mobile it renders in white, breaking the dark theme consistency. It should use the same dark slate theme as desktop.

3. **Greeting message shows immediately when chat opens** -- Currently, when a user/guest clicks the chat bubble, the proactive greeting message appears right away on the landing screen. The user wants the greeting to only appear AFTER they click "Send us a message" and enter the conversation flow (waiting/chatting step), so the landing screen stays clean like Intercom.

### Changes

**File: `src/pages/Admin.tsx` (lines 1727-1790)**

- Increase notification badge size from `w-5 h-5` to `w-6 h-6` with larger text (`text-[11px]`) for Investments, Withdrawals, and KYC tabs
- Add more right-padding (`pr-5`) to tab buttons that have badges so the number doesn't overlap the text
- Ensure badges are clearly visible with better positioning (`-top-2.5 -right-2.5`)

**File: `src/components/admin/AdminChatPanel.tsx` (line 537)**

- Change the greeting settings panel background from `bg-white/95 dark:bg-slate-800` to `bg-slate-800` consistently (no white variant)
- Ensure all child labels and text use `text-white` or `text-slate-300` consistently without relying on dark mode selectors that may not apply on mobile

**File: `src/components/LiveChatWidget.tsx` (lines 415-444 and 790-803)**

- Remove the proactive greeting from the landing step entirely -- the landing screen should be clean with just the "Welcome!" hero, the conversation card, and the "Send us a message" button
- Move the greeting message display to AFTER the conversation starts: when the user clicks "Send us a message" and transitions to the `waiting` step, inject the greeting as the first message in the chat (either as a system-style bubble or an admin-style bubble) so it feels like a real support agent sending the welcome
- Remove the `proactiveMessage` display from `renderLanding()`
- Instead, after `handleCreateConversationAndSend` creates the conversation, insert the greeting as a local message (not a DB insert) so the user sees it as the first thing in the chat thread

### Technical Details

- The greeting text logic (custom vs default, guest vs user) stays the same -- just moves from landing screen to the chat/waiting screen
- The greeting appears as a styled message bubble (admin-style, left-aligned with the support avatar) at the top of the message list when the conversation starts
- No database changes needed
- No new dependencies needed

