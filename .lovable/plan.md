

## Enhance Live Chat Widget: "Hi there" + Rich Landing Content

### Changes Overview

**File:** `src/components/LiveChatWidget.tsx`

### 1. Change "Welcome!" to "Hi there"
- Line 729: Replace `Welcome! 👋` with `Hi there 👋`

### 2. Populate the Empty Space Below "Send us a message"

Add three sections below the send button to fill the blank area and make the widget feel like a real, professional support center:

**a) Recent Conversations Section**
- Query the database for the current user's (or guest's) past closed conversations
- If any exist, show a "Recent conversations" section with a list of past chats (showing last message preview, date, and status)
- Clicking a past conversation could reopen or view it
- If no past conversations, this section is hidden

**b) Quick Help / FAQ Links**
- Add a "Helpful resources" section with 3-4 clickable items styled as mini cards:
  - "How do I make an investment?" 
  - "How do I withdraw funds?"
  - "Account verification help"
  - "Contact support via WhatsApp"
- These link to relevant pages or auto-populate the chat with the question when clicked

**c) Footer Branding**
- Small subtle footer text at the bottom: "Powered by Tesla Stock Platform" with a small icon
- Matches the professional Intercom/Drift style

### 3. Make FAQ Items Interactive
- When a user clicks a FAQ item, it transitions to the compose step with the question pre-filled as the first message, making it feel like a real support experience

### Technical Details

- Add a `useEffect` to fetch recent closed conversations for the current user/guest on mount
- Add a new state `recentConversations` to hold past chat summaries
- The FAQ items array will be defined as a constant with icons and labels
- The WhatsApp link will use the existing `supportProfile` settings
- All new sections use the same white card styling with subtle borders and rounded corners
- Smooth fade-in animations using framer-motion for each section

### Visual Layout (Landing Screen)

```text
+----------------------------------+
|  Blue Hero: "Hi there 👋"       |
|  "How can we help?"              |
+----------------------------------+
|  [White Card]                    |
|  "Let's have a conversation"    |
|  [Avatars] Reply time: 30 min   |
|  [Send us a message button]     |
+----------------------------------+
|  [Recent Conversations]          |
|  (if any past chats exist)       |
|  - "Investment question" 2d ago  |
|  - "Withdrawal help" 1w ago      |
+----------------------------------+
|  [Helpful Resources]             |
|  - How to invest                 |
|  - Withdraw funds                |
|  - Verify identity               |
|  - WhatsApp support              |
+----------------------------------+
|  Powered by Tesla Stock Platform |
+----------------------------------+
```

