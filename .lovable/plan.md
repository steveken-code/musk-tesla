

# Live Chat Widget Enhancement Plan

## Issues Identified

1. **Notification email goes to wrong address** -- The `send-chat-notification` edge function pulls admin email from `referral_settings` which has `b951577777@gmail.com` (extra 7). Need to use a dedicated chat notification email setting, or update the existing one.

2. **Image viewing broken** -- Images open in a new tab pointing to the raw storage URL. The URL works (public bucket), but the UX needs improvement -- images should open in a lightbox/modal overlay instead.

3. **Chat header text overflows** -- "We typically reply instantly" collapses in the small header. Need to fix text sizing and layout.

4. **Message input too tight** -- Single-line `<input>` should become a resizable `<textarea>` that scrolls for long messages, with more padding.

5. **Image upload sends automatically** -- Images should be staged (previewed) before sending so the user can add a caption text.

6. **No typing indicators** -- Need real-time typing indicators for both user and admin sides.

7. **Chat bubble icon** -- Replace the generic `MessageCircle` icon with the uploaded live support agent image.

8. **File picker options** -- The image button should offer Photo Library / Take Photo / Choose File options (use `capture` attribute on mobile).

9. **Live chat not on homepage for logged-out users** -- Currently `LiveChatWidget` returns null if no user. It already exists in `Index.tsx`, but it's hidden for non-logged-in visitors. We should still show it on the homepage (the widget is already imported there).

10. **Mobile responsiveness** -- Ensure chat widget works well on all screen sizes.

---

## Implementation Steps

### Step 1: Copy the support agent image
- Copy `user-uploads://live_img-removebg-preview.png` to `src/assets/live-support-icon.png`
- Use this as the chat bubble icon and header avatar

### Step 2: Database migration for typing indicators
- Add a `chat_typing_status` table with columns: `id`, `conversation_id`, `user_id`, `is_typing`, `updated_at`
- Enable realtime on this table
- Add RLS policies so users can manage their own typing status and admins can manage theirs

### Step 3: Rewrite `LiveChatWidget.tsx`
- **Header**: Use the support agent image as avatar, fix text layout so "Live Support" and "We typically reply instantly" don't overflow
- **Textarea input**: Replace `<input type="text">` with a scrollable `<textarea>` that auto-grows, with comfortable padding
- **Image staging**: When user picks an image, show a preview with option to add caption text before sending (don't auto-send)
- **File picker**: Add `capture="environment"` support for mobile camera; keep standard file picker for desktop
- **Typing indicator**: Subscribe to `chat_typing_status` table; show animated dots when admin is typing; broadcast user's typing status
- **Send button**: Styled professionally, no character limit indicator shown
- **Responsiveness**: Full-width on mobile (< 420px), proper bottom positioning to not overlap WhatsApp button
- **Logged-out users**: Allow viewing the widget but show a "Please log in to chat" prompt instead of hiding entirely
- **Image lightbox**: When clicking a sent/received image, show it in a full-screen overlay modal instead of opening a new tab

### Step 4: Update `AdminChatPanel.tsx`
- **Image staging**: Same image preview + caption flow before sending
- **Typing indicator**: Show when user is typing; broadcast admin typing status
- **Image lightbox**: Modal overlay for viewing images instead of new tab
- **Textarea**: Replace single-line input with scrollable textarea for longer replies

### Step 5: Update `send-chat-notification` edge function
- Change the admin email lookup to use a dedicated `notification_email` field, or look for the admin's profile email directly
- Ensure the hardcoded fallback matches the correct email `b95157777@gmail.com`

### Step 6: Responsive and positioning fixes
- Position chat bubble above the WhatsApp button without overlapping
- On mobile, chat window takes near-full width with proper safe area padding
- Ensure z-index layering is correct (chat above support buttons)

---

## Technical Details

### Typing Status Table Schema
```sql
CREATE TABLE public.chat_typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS + realtime enabled
```

### Image Staging Flow
```text
User clicks image button
  -> File picker opens (Photo Library / Camera / File)
  -> Image selected
  -> Preview shown in input area with X to cancel
  -> User can type optional caption
  -> User clicks Send to upload + send both image and text
```

### Typing Indicator Flow
```text
User starts typing
  -> Upsert typing status (is_typing = true)
  -> Debounce: after 3s of no typing, set is_typing = false
  -> Other side subscribes to realtime changes
  -> Shows "typing..." animation
```

### Files to Create/Modify
- **Create**: `src/assets/live-support-icon.png` (copy from upload)
- **Create**: Migration for `chat_typing_status` table
- **Modify**: `src/components/LiveChatWidget.tsx` (major rewrite)
- **Modify**: `src/components/admin/AdminChatPanel.tsx` (typing + image staging)
- **Modify**: `supabase/functions/send-chat-notification/index.ts` (fix email)

