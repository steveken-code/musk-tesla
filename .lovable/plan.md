

## Professional Tier Plans + Chat Fixes + Admin Mobile Responsiveness

This plan covers 5 major areas: Investment Tier Plans, AI chat improvements, admin mobile responsiveness, specialist avatar fix, and minor chat UX polish.

---

### 1. Investment Tier Plans System

Based on your preference: **Auto-tier detection with $500 minimum, admin-editable tiers, displayed on both homepage and dashboard.**

**How it works:**
- 3 default tiers: Starter ($500), Regular ($7,000), Gold ($15,000)
- Users enter any amount starting from $500 (replacing the current $100 minimum)
- The system automatically assigns them to the matching tier based on the amount
- Each tier has a name, minimum amount, and expected profit range
- Tiers are stored in `admin_settings` so admin can edit names, amounts, and profit ranges

**Tier assignment logic:**
- $500 - $6,999 = Starter Plan
- $7,000 - $14,999 = Regular Plan
- $15,000+ = Gold Plan

**UI changes:**

**Homepage (landing page):** Add a new `InvestmentPlans` section between existing sections showing 3 professional plan cards styled like the reference image -- dark cards with medal icons, plan names, minimum amounts, bullet-point features, and expected profit ranges. Includes a CTA button linking to signup.

**Dashboard invest form:** Above the amount input, show the 3 tier cards as selectable options. When a user clicks a tier, the minimum amount pre-fills. The currently matched tier highlights as the user types an amount. The form minimum changes from $100 to $500.

**Admin panel:** Add a "Tier Plans" management section (new tab or within settings) where admin can:
- Edit each tier's name, minimum amount, and profit range (min/max)
- Save changes to `admin_settings` under `tier_plans_settings`
- Changes reflect in real-time on homepage and dashboard

**Database:** Store tier configuration in `admin_settings` table (no schema changes needed). Add an RLS policy so all users can read `tier_plans_settings`.

---

### 2. AI Chat Agent Reliability

The AI suggestion function in `AdminChatPanel.tsx` is already implemented and calls the `ai-chat-suggest` edge function. The issue may be that the edge function needs redeployment or the `LOVABLE_API_KEY` secret needs verification.

**Fix:** Redeploy the `ai-chat-suggest` edge function and verify it works by testing it directly. Add better error handling and a retry mechanism in the admin panel so the AI suggestion auto-retries once on failure.

---

### 3. Admin Mobile Responsiveness

**Current issues:**
- The admin chat panel has a fixed `height: 600px` which doesn't work well on mobile
- The conversation list and chat area use `hidden md:flex` toggling but the chat input area needs mobile optimization
- Image upload button needs to work on mobile

**Fixes in `AdminChatPanel.tsx`:**
- Change the fixed `600px` height to `h-[calc(100vh-200px)] sm:h-[600px]` so it fills the screen on mobile
- Ensure the file input (gallery button) works on mobile by keeping `accept="image/*"` 
- Make the settings panel scrollable on small screens
- Ensure the conversation list items are touch-friendly with appropriate padding

**Fixes in `Admin.tsx`:**
- Ensure the tab bar scrolls horizontally on mobile
- Add responsive padding adjustments

---

### 4. Specialist Avatar Fix

**Problem:** When a specialist uploads their profile image, the header circle in the chat widget shows a white background gap because `object-contain` is used with `p-0.5`.

**Fix in `LiveChatWidget.tsx`:**
- When `specialistJoined` is true and `specialistImageUrl` exists, use `object-cover` instead of `object-contain` and remove the padding so the specialist's photo fills the entire circle
- Keep `object-contain` with padding only for the default support icon (which is a logo/icon, not a photo)
- Apply the same fix to the small avatar circles next to admin messages in the chat

---

### 5. Minor Fixes Summary

- **Investment minimum**: Update from $100 to $500 across the form validation, rules modal, and error messages
- **ActionsPanel rules**: Update the investment rules to reflect new $500 minimum and tier-based returns
- **RLS policy**: Add read policy for `tier_plans_settings` key on `admin_settings` table

---

### Technical Details

**Files to create:**
- `src/components/InvestmentPlans.tsx` -- Tier plan cards component for homepage and dashboard

**Files to modify:**
- `src/pages/Index.tsx` -- Add InvestmentPlans section to homepage
- `src/pages/Dashboard.tsx` -- Add tier selection above invest form, update $100 min to $500
- `src/pages/Admin.tsx` -- Add Tier Plans management tab/section
- `src/components/dashboard/ActionsPanel.tsx` -- Update investment rules to reflect new minimum and tiers
- `src/components/admin/AdminChatPanel.tsx` -- Mobile responsive height, ensure image upload works on mobile
- `src/components/LiveChatWidget.tsx` -- Fix specialist avatar display (object-cover vs object-contain)

**Database migration:**
- Add RLS policy for `tier_plans_settings` read access on `admin_settings`

**Edge function:**
- Redeploy `ai-chat-suggest` to ensure it's active

