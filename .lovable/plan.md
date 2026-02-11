

# Live Chat Widget Updates

## Changes

### 1. Replace support icon with 24/7 headset image
- Copy `user-uploads://support-removebg-preview.png` to `src/assets/live-support-icon.png` (overwrite the current one)
- This will automatically update everywhere it's imported (chat bubble, header avatar, empty state)

### 2. Replace native scrollbar with hidden/modern scrollbar
- Hide the default browser scrollbar on the messages container using Tailwind's `scrollbar-hide` approach (custom CSS)
- Add a thin, subtle custom scrollbar using CSS that only appears on hover -- giving a clean, modern look
- Add the custom scrollbar styles to `src/index.css`

### 3. Fix file picker dismiss behavior
- The file picker popup currently has an overlay (`z-[59]`) to close on outside click, but it's positioned outside the chat window context. When the file picker is open, clicking anywhere outside it (including within the chat messages area) should dismiss it
- Move the dismiss overlay inside the chat widget's render scope and ensure it covers the full chat window area so tapping on messages or anywhere else closes the picker

---

## Technical Details

### Files to modify
- **Copy**: `user-uploads://support-removebg-preview.png` to `src/assets/live-support-icon.png`
- **Modify**: `src/index.css` -- add custom modern scrollbar CSS
- **Modify**: `src/components/LiveChatWidget.tsx` -- apply custom scrollbar class to messages container, adjust file picker dismiss logic

### Custom scrollbar CSS (added to index.css)
```css
/* Modern thin scrollbar for chat */
.chat-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.chat-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.chat-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
}
.chat-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
/* Firefox */
.chat-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(128,128,128,0.3) transparent;
}
```

### Messages container update
Replace the current `overflow-y-auto` div with the `chat-scrollbar` class applied for the modern slim scrollbar appearance.

### File picker dismiss
The existing overlay at `z-[59]` already handles outside clicks. No structural change needed -- just verify it works properly when clicking inside the chat area (messages, header, etc.). The current implementation is correct.

