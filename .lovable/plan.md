

## Fix: Payment Details Not Showing + Specialist Join Notification

### Issue 1: Payment Details Not Appearing for $400

**Root Cause:** The payment details are hardcoded to only appear when the investment amount is **$500 or more**, but the platform's actual minimum investment is **$100**. So entering $400 correctly hides the payment details based on current code -- but this threshold is wrong.

**Fix:** Change all `>= 500` checks to `>= 100` across `Dashboard.tsx` so payment details show for any valid investment amount ($100+). There are **5 places** where this threshold is used:
- Line 596: localStorage restore check
- Line 673: localStorage persist check  
- Line 767: Payment details display effect
- Line 1530: RUB conversion display (Russia-specific)
- Also the initial state function

### Issue 2: Specialist Join Notification for Users/Guests

**Current State:** When a specialist joins, a small gray system message pill appears saying "[Name] joined the conversation." This is subtle and easy to miss.

**Enhancement:** Replace the generic system message with a professional, visually prominent notification card that includes:
- The specialist's avatar/photo
- Their name
- A "joined the conversation" label
- A subtle animation (fade-in) to draw attention
- A distinct visual style (not just a gray pill) -- using a bordered card with the specialist's branding

This will be implemented in `LiveChatWidget.tsx` by detecting system messages that contain "joined the conversation" and rendering them as a styled specialist card instead of the plain gray pill.

---

### Technical Changes

**File: `src/pages/Dashboard.tsx`**
- Replace all `>= 500` threshold checks with `>= 100` (5 occurrences)

**File: `src/components/LiveChatWidget.tsx`**
- Update the system message rendering in both `renderWaiting` and `renderChatting` sections
- When a system message contains "joined the conversation", render a professional card with:
  - Specialist avatar (already available via `specialistProfile.specialistImageUrl`)
  - Specialist name
  - "has joined the conversation" text
  - Styled with a green/teal accent border and subtle background
  - Animated entrance

