

# Fix Chat Widget UI and Standardize Email Templates

## Part 1: Chat Widget Fixes

### 1A. Match chat bubble size to WhatsApp button
The chat bubble is currently `w-14 h-14` (56px) while WhatsApp is `w-12 h-12` (48px). Will make the chat bubble `w-12 h-12` to match.

### 1B. Add tap/hover animation to both icons
Add `active:scale-95` press effect and improve the hover animation on both the chat bubble and WhatsApp/Telegram buttons so they feel interactive when tapped.

### 1C. Remove glassmorphism from chat header
The blue header currently has:
- `border-2 border-white/40` on the avatar container -- causing a bright white ring
- The gradient + white borders create a washed-out glassmorphism look

Will change to a solid, clean blue header:
- Remove `border-white/40` from avatar, use a subtle `border-white/20` or no border
- Keep the gradient solid without transparency effects

### 1D. Clean up the mask-image fade at top of messages area
The messages area has a `maskImage` gradient that fades to transparent at the top 8%, which creates a white/bright fade effect near the header. Will reduce or adjust this so the transition between header and messages is clean.

---

## Part 2: Email Template Standardization

After reviewing all email templates, most follow the standard (Tesla Red header, white bg, 650px). Two templates have issues:

### 2A. `send-investment-confirmation` -- Convert from dark theme to light theme
Currently uses a dark theme (#000000 bg, green header, 600px width) which is inconsistent with every other email. Will convert to the standard:
- White background (#f3f4f6 outer, #ffffff card)
- Tesla Red gradient header
- 650px width
- Standard greeting style ("Hello Name,")
- Electric Blue section headers
- Green for money values only

### 2B. `send-withdrawal-status` -- Remove logo image reference
This template references a `TESLA_LOGO_URL` for an image in the header, while all other templates use text-only headers. Will align it to use the same text-only Tesla Red gradient header for consistency and reliability (no broken image risks).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LiveChatWidget.tsx` | Resize bubble to w-12 h-12, add active:scale-95, remove white border from header avatar, adjust mask-image fade |
| `src/components/SupportButtons.tsx` | Add active:scale-95 press effect to WhatsApp and Telegram buttons |
| `supabase/functions/send-investment-confirmation/index.ts` | Convert dark theme to standard light theme with Tesla Red header |
| `supabase/functions/send-withdrawal-status/index.ts` | Remove logo image, use standard text-only Tesla Red header |

