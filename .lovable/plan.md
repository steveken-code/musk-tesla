

# Live Chat Widget - Mobile Fullscreen, White Theme, and Admin Panel Fixes

## Issues to Fix

1. **Mobile chat widget is too small** - currently shows as a small floating card that requires scrolling the page behind it. On mobile it should cover the full screen.
2. **Chat widget uses dark theme** - the whole site is dark, so the chat should use a **white/light background** with dark text for contrast and a fresh feel.
3. **Admin panel uses ImagePlus icon** instead of the Plus (+) icon with rotate animation like the user widget.
4. **Admin textarea text is not visible** - low contrast on mobile (white text on dark bg or dark text on dark bg). Needs bold dark text on a light input.
5. **File picker menu transparency** - animations cause transparency on mobile. Need solid backgrounds.
6. **Responsive consistency** - ensure the chat widget looks professional on all screen sizes.

## Changes

### 1. LiveChatWidget.tsx - Full Screen on Mobile + White Theme

**Chat window container (line 447):**
- Change from `fixed bottom-4 right-4 ... w-[calc(100vw-32px)] sm:w-[380px] h-[min(520px,calc(100vh-80px))]`
- To: `fixed inset-0 sm:bottom-4 sm:right-6 sm:left-auto sm:top-auto sm:inset-auto z-[60] w-full h-full sm:w-[380px] sm:h-[min(520px,calc(100vh-80px))] sm:rounded-2xl`
- This makes it fullscreen on mobile, floating card on desktop

**Messages area (line 467):**
- Change `bg-muted/30` to `bg-white` (solid white background)
- Message bubbles: admin messages use `bg-gray-100 text-gray-900` instead of `bg-card`
- User messages keep `bg-electric-blue text-white`
- Proactive greeting: `bg-gray-100 text-gray-900` with dark text
- Typing dots: `bg-gray-400` on `bg-gray-100`

**Input area (line 560):**
- Change `bg-background` to `bg-white border-gray-200`
- Textarea: `bg-gray-100 text-gray-900 placeholder:text-gray-500` with `!important` opacity
- File picker popup: `bg-white border-gray-200 text-gray-900`

**Header:**
- Keep the blue gradient header (it's the brand accent on the white body)
- On mobile, add rounded-none (fullscreen)

### 2. AdminChatPanel.tsx - Plus Icon + Text Visibility

**Replace ImagePlus with Plus icon (line 403):**
- Change `<ImagePlus className="w-5 h-5" />` to `<Plus className={...rotate-45...} />`
- Match the same rotate animation pattern from the user widget

**Textarea contrast (line 435):**
- Add explicit styles: `style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', opacity: 1 }}`
- Ensure placeholder is visible: `placeholder:text-slate-400`

**File picker menu (line 412):**
- Ensure solid `bg-slate-700` (already set, but verify no transparency from animation)
- Add `will-change: transform` to prevent transparency during animation

### 3. Import Fix in AdminChatPanel

- Add `Plus` to imports, keep `ImagePlus` as fallback or remove it

## Files to Modify

- `src/components/LiveChatWidget.tsx` - fullscreen mobile, white theme, solid backgrounds
- `src/components/admin/AdminChatPanel.tsx` - Plus icon, textarea contrast, solid file picker

