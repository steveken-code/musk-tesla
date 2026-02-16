

## Redesign Chat Landing to Match Intercom Layout

### Overview

Redesign the chat widget's landing screen to closely mirror the Intercom reference images: a **blue hero section** at the top flowing from the header with "Welcome! How can we help?", followed by a **white card section** with "Let's have a conversation", team avatars, reply time, and a prominent "Send us a message" button. This replaces the current centered-on-white layout.

### Visual Target

```text
+------------------------------------------+
| [Av1][Av2][Av3]  Support Center      [X] |  <-- existing header (kept)
|                                           |
|        (blue gradient continues)          |
|          Welcome!                         |
|       How can we help?                    |
+------------------------------------------+
|                                           |
|  +------------------------------------+  |
|  | Let's have a conversation          |  |
|  |                                    |  |
|  | [Av1][Av2][Av3]  Our usual time    |  |
|  |                  to reply           |  |
|  |                  (clock) A few min  |  |
|  |                                    |  |
|  | [> Send us a message          ]    |  |
|  +------------------------------------+  |
|                                           |
+------------------------------------------+
```

When user clicks "Send us a message", it proceeds to the name/email step (existing flow).

### Changes in Detail

**File: `src/components/LiveChatWidget.tsx`**

1. **Extend the header/blue area** -- Instead of the header ending at `py-3`, when on the `landing` step, the blue gradient extends downward to include a "Welcome! How can we help?" hero text. This can be done by making the header taller on landing, or by adding a blue section below the header that's part of `renderLanding`.

2. **Redesign `renderLanding()`** (lines 711-793):
   - Remove the current centered white layout
   - Add a **blue hero section** at the top: large "Welcome!" heading + "How can we help?" subtitle in white text on the blue gradient
   - Below that, a **white card** with rounded corners and shadow containing:
     - "Let's have a conversation" title
     - Row with team avatars (3 stacked) + "Our usual time to reply" + clock icon + reply time value
     - A "Send us a message" button (blue, with play/arrow icon) that triggers the flow to the next step
   - Remove the bottom text input bar when on landing (the "Send us a message" button replaces it)

3. **Remove the textarea/input bar from landing step** (lines 1327-1360): The landing screen should only show the "Send us a message" button inside the card, not the full message input. The input bar appears only after the user starts the conversation flow.

4. **Keep the specialist join notification** as-is (already professional with teal card, avatar, role).

### Technical Details

- The "Send us a message" button calls the existing flow transition (moves to `name_email` step for guests, or directly to `waiting`/`chatting` for authenticated users)
- Team avatars reuse the existing `teamAvatars` array
- Reply time uses existing `supportProfile.replyTime`
- The proactive typing/message indicators move into the blue hero area or are removed from landing (they'll appear in the chat step)
- No database changes needed
- No new dependencies

