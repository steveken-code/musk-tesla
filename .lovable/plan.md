
## Goal
Make the Admin KYC Management modal look professional on mobile by ensuring:
- No transparency issues (already mostly addressed)
- Form fields are high-contrast and readable (dark text, opacity 1)
- Country/Currency dropdowns look solid (non-transparent), well-styled, and stack correctly
- Layout remains responsive on small screens

## What I found in the code
File: `src/components/admin/KYCManagementModal.tsx`

- Modal container is now correctly forced opaque (`bg-slate-900/100` + solid HSL fallback).
- The form controls (Input/Textarea/SelectTrigger) are currently styled as **dark fields with forced white text**:
  - `bg-slate-800 ... text-white [color:white_!important] [-webkit-text-fill-color:white]`
- You’re seeing “bright white” fields on some mobile devices, and the current forced **white text** can become unreadable when the browser renders/overrides field backgrounds (common on mobile, autofill, accessibility settings).

## Approach
Align the KYC modal form fields with the admin portal’s established “visibility standard”:
- Use **light / cool** field backgrounds (not harsh pure white)
- Force **dark text with opacity: 1** (including iOS/Safari via `WebkitTextFillColor`)
- Style dropdown menu surfaces the same way (solid background + high z-index)

## Implementation steps (single file change)

### 1) Introduce shared styling constants inside `KYCManagementModal.tsx`
Add two constants near the component body to keep styling consistent and avoid repetition:

- `const adminFieldClass = "...";` for Inputs/Textarea/SelectTrigger
- `const adminFieldStyle = { color: "#000000", WebkitTextFillColor: "#000000", opacity: 1 }`

Recommended “cool light” field styling (example):
- Background: `bg-slate-50` (cool, not harsh white)
- Border: `border-2 border-slate-300`
- Text: `text-black font-semibold`
- Placeholder: `placeholder:text-slate-500`
- Focus: `focus:border-tesla-red focus:ring-tesla-red/20`

This guarantees dark text even if a browser tries to override colors.

### 2) Update ALL form Inputs/Textarea to dark text (opacity 1)
Update these controls to use the shared class/style:
- User Name input
- Account Number input
- Tax ID input (including read-only state)
- Net Amount input
- Admin Notes textarea

Key adjustments:
- Remove `text-white` and any `[color:white_!important]` / `[-webkit-text-fill-color:white]`
- Apply `style={adminFieldStyle}` to force black text on mobile Safari
- Ensure `opacity` is not reduced for read-only fields:
  - Replace `opacity-60` with a clearer read-only look (example):
    - `bg-slate-200 text-slate-800` while keeping `opacity: 1`
  - Keep `cursor-not-allowed` for locked Tax ID, but don’t make it faint

### 3) Make Payment Method display match the new professional form style
Currently:
- `bg-slate-800 ... text-white`

Update to:
- `bg-slate-50 border-2 border-slate-300 text-slate-900 font-semibold`
So it looks like a deliberate read-only field.

### 4) Redesign Country/Currency Select styling for a professional light dropdown
Update:

**SelectTrigger**
- Use the same `adminFieldClass` + `adminFieldStyle`
- Ensure the chevron/icon remains visible (dark text theme)

**SelectContent**
- Keep the “always on top” requirement:
  - Preserve `z-[200]`
- Make it solid and clean:
  - `bg-white border-slate-300 text-slate-900 shadow-lg`
  - Add a fallback solid background if needed: `[background:#ffffff]` (optional)

**SelectItem**
- Switch from white text to dark text:
  - `text-slate-900`
- Professional hover/focus:
  - `hover:bg-slate-100`
  - `focus:bg-slate-100 focus:text-slate-900`

This directly fixes “dropdown isn’t nice” and prevents see-through menus.

### 5) Keep/verify mobile responsiveness
The form grid is already improved:
- `grid-cols-1 sm:grid-cols-2`

I’ll keep that, and if needed, slightly improve mobile spacing without changing layout intent:
- Optional: reduce label sizes or tighten gaps on very small screens (only if it still feels cramped after the contrast fix)

## Acceptance checklist (what you should see after)
1. On mobile, the KYC modal background stays solid (no transparency).
2. Form fields are cool-light (not harsh white) and text is dark, fully opaque, and readable.
3. Country/Currency dropdowns:
   - are not transparent
   - open above everything
   - have clean light background + dark text
4. Read-only Tax ID is still clearly readable (not faded out).

## Files affected
- `src/components/admin/KYCManagementModal.tsx` only

## Quick test plan (important)
- Open Admin → KYC tab → open a KYC record on mobile dimensions.
- Tap each input to ensure text remains dark (especially after focus).
- Open Country/Currency dropdowns and scroll; verify the menu is solid and not clipped/transparent.
- Test the “Tax ID locked” state: confirm it is readable and clearly marked as user-submitted.
