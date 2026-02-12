

# Use 24/7 Chat Icon for Welcome, Agent Avatar for Replies

## What Changes

### 1. New 24/7 Chat Icon Asset
Copy the uploaded purple 24/7 speech bubble icon into the project as `src/assets/chat-247-icon.png`. This replaces the current support avatar on the **floating chat bubble** and the **welcome card only**.

### 2. Floating Chat Bubble (bottom-right corner)
- Currently shows the support agent avatar
- **Change to**: The 24/7 chat icon -- clearly visible, polished, with a clean white background and subtle border
- This is what guests see before opening the chat, so the 24/7 branding builds trust

### 3. Welcome Card (empty state inside chat)
- Currently shows the support agent avatar in a large circle
- **Change to**: The 24/7 chat icon as the centerpiece
- Keep the support name and "Typically replies under..." text below it
- Keep the "Start a conversation" prompt

### 4. Admin Reply Messages -- Use Agent Avatar
When the admin sends a message, the small avatar next to their message bubble will show:
- The **admin-configured support avatar** (from Admin > Support Profile settings)
- Falls back to the `support-avatar.png` if no custom URL is set
- This creates a natural flow: **24/7 icon greets you, then a real agent (with name and photo) joins the conversation**

### 5. Proactive Greeting + Typing Indicator
- The initial proactive typing dots and greeting message will also use the **24/7 icon** (since it's the system greeting, not a specific agent)
- Once admin replies, those messages use the agent avatar

## Summary of Avatar Usage

| Location | Current | New |
|----------|---------|-----|
| Floating chat bubble | Agent avatar | 24/7 icon |
| Welcome card (empty state) | Agent avatar | 24/7 icon |
| Proactive typing dots | Agent avatar | 24/7 icon |
| Proactive greeting message | Agent avatar | 24/7 icon |
| Admin reply messages | Agent avatar | Agent avatar (no change) |
| Admin typing indicator | Agent avatar | Agent avatar (no change) |
| Chat header | Agent avatar | Agent avatar (no change) |

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/assets/chat-247-icon.png` | Copy the uploaded 24/7 icon into the project |
| `src/components/LiveChatWidget.tsx` | Import the 24/7 icon, use it for bubble + welcome + proactive greeting; keep `avatarSrc` for admin messages and header |

### No database changes needed
This is purely a frontend asset swap with conditional avatar logic.

