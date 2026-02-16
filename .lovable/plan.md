

## Fix Chat Greeting Flow -- Professional "Greeting First, Then Type" Experience

### Problem

When a user clicks "Send us a message", the current code calls `handleLandingMessage('')` which immediately:
1. Creates a conversation
2. Injects the greeting as admin bubble
3. Sends an **empty user message** (which shows as a blank bubble)
4. Shows "Please hold while we connect you..." right away

This is not professional. The user wants the flow to work like Intercom: greeting appears first, the user types and sends their actual message, THEN the "connecting" message shows.

### New Flow

```text
1. User clicks "Send us a message"
   --> Transition to a new "compose" step (not waiting yet)
   --> Show the greeting message as an admin bubble
   --> Show the text input so user can type their first real message
   --> NO "Please hold" text yet

2. User types and sends their first message
   --> NOW create the conversation in DB
   --> Send the actual message to DB
   --> Transition to "waiting" step
   --> Show "Please hold while we connect you to a specialist"

3. Specialist joins --> transition to "chatting" as usual
```

### Changes

**File: `src/components/LiveChatWidget.tsx`**

1. **Add a new `ChatStep` value: `'compose'`** (line 59)
   - New step between landing and waiting where the greeting is shown and user types their first real message

2. **Update `handleLandingMessage`** (lines 450-457)
   - Instead of creating a conversation immediately, just transition to the `compose` step
   - For guests: still go to `name_email` first (existing flow), but after verification, go to `compose` instead of `waiting`

3. **Create `renderCompose()` function** -- a new render function for the compose step:
   - Shows the greeting message as an admin-style bubble at the top (using `getGreetingText()`)
   - Shows the message input area at the bottom (textarea + send button + image attach)
   - When user sends their first message here, THEN call `handleCreateConversationAndSend(msg)` with the actual typed message
   - No "Please hold" text on this screen

4. **Update `handleCreateConversationAndSend`** (lines 519-587)
   - Remove the empty/null message handling -- it will always receive actual user text now
   - Keep the greeting injection as the first message in the array
   - Transition to `waiting` step as before

5. **Update `renderWaiting()`** (lines 890-1017)
   - The "Please hold while we connect you to our customer support specialist" message stays here -- this is the correct place for it since the user has already sent their message

6. **Update the step rendering** (lines 1324-1328)
   - Add `{chatStep === 'compose' && renderCompose()}` 

7. **Update `handleVerifyCode`** (line 510)
   - After verification, go to `compose` step instead of directly calling `handleCreateConversationAndSend`

### Technical Details

- The `compose` step is a lightweight local-only screen (no DB calls yet) -- just the greeting bubble and a text input
- The greeting uses the existing `getGreetingText()` logic (respects admin custom/default, guest vs user)
- The conversation is only created in the database when the user actually sends their first message
- The "Please hold" connecting message only appears in the `waiting` step after the real message is sent
- No database changes needed
- No new dependencies needed
- The admin panel badges and greeting settings were already fixed in the previous iteration

