

# Live Chat: Open to All Users + Pro Scrollbar + Input Polish

## Changes

### 1. Remove login requirement for chat
Currently, non-logged-in users see "Please log in to start a conversation" and the input area shows "Log in to start chatting". The chat should be open to everyone -- anonymous users included.

**Approach:**
- Allow anonymous users to create conversations by generating a temporary guest ID (stored in `localStorage`)
- When not logged in, still show the input bar and allow sending messages
- Create conversations with `user_id = null` and a guest identifier in `user_name`
- The empty state greeting shows for everyone, and tapping it opens the input

### 2. Upgrade scrollbar to premium "Pro-Scroll" style
Replace the current `.chat-scrollbar` CSS with the enhanced version:
- Thinner pill-shaped thumb (4px width)
- Appears only on hover (semi-transparent)
- Top/bottom fade mask for a premium "fade-to-transparent" edge effect
- Smooth scroll behavior for auto-scrolling to new messages

### 3. Auto-expanding textarea with smooth transition
- Add CSS `transition: height 0.2s ease-in-out` for smooth expansion
- Keep the existing max-height (120px) and auto-resize logic
- Add a subtle focus glow/border-color shift on the input container

---

## Technical Details

### Files to modify
- `src/components/LiveChatWidget.tsx` -- remove login gate, allow anonymous chat, add fade mask
- `src/index.css` -- upgrade `.chat-scrollbar` + add fade mask styles

### Anonymous chat support (LiveChatWidget.tsx)

Replace the login-gated sections:

```tsx
// Generate/retrieve a guest ID for anonymous users
const getGuestId = () => {
  let guestId = localStorage.getItem('chat-guest-id');
  if (!guestId) {
    guestId = 'guest-' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('chat-guest-id', guestId);
  }
  return guestId;
};

// In getOrCreateConversation, handle both logged-in and anonymous:
const getOrCreateConversation = useCallback(async () => {
  const identifier = user?.id || getGuestId();
  // For guests, query by user_name matching the guest ID
  // For logged-in users, query by user_id as before
  ...
});

// In sendMessage, use guest identifier when no user:
sender_id: user?.id || null,
```

**Key changes:**
- Remove the `if (!user) return null` guard from `getOrCreateConversation`
- Remove the "Log in to start chatting" bottom bar -- always show the input
- Remove the "Please log in" message from the empty state -- show the greeting for all
- For anonymous users, store `user_name` as "Guest" and use `localStorage` guest ID to track their conversation

### Upgraded scrollbar CSS (index.css)

```css
/* Pro-scroll: hidden until hover, thin pill thumb */
.chat-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  scroll-behavior: smooth;
}
.chat-scrollbar:hover {
  scrollbar-color: rgba(128,128,128,0.3) transparent;
}

/* Webkit */
.chat-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.chat-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.chat-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 20px;
  transition: background 0.3s ease;
}
.chat-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.25);
}
```

### Fade edge mask on messages container

```tsx
// Add CSS mask for top/bottom fade
<div className="flex-1 overflow-y-auto chat-scrollbar p-3 sm:p-4 space-y-3 bg-muted/30"
  style={{
    WebkitOverflowScrolling: 'touch',
    maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
  }}>
```

### Textarea smooth expansion

```tsx
// Add transition for smooth height change
className="... transition-[height] duration-200 ease-in-out ..."
```

### Input focus glow
```tsx
// The textarea already has focus:ring-1 focus:ring-electric-blue
// Add a subtle container glow on focus-within
<div className="p-3 flex items-end gap-2 transition-colors focus-within:bg-muted/20">
```

