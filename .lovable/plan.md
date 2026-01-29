
# Referral Link Domain Fix & Component Cleanup

## Overview
This plan fixes the referral link to use the production domain `msktesla.net` instead of the Lovable preview URL, and simplifies the referral component for a cleaner, more professional appearance.

---

## Current Issues

1. **Wrong Domain in Referral Link**: Line 29 in `ReferralBonus.tsx` uses `window.location.origin` which shows the Lovable preview URL (e.g., `https://a300af12-49e6-4e0a-9481-dc894f791671.lovableproject.com`)
2. **Link Too Long**: The referral link display shows the full URL which looks unprofessional

---

## Changes Summary

### 1. Use Production Domain for Referral Links
**File:** `src/components/dashboard/ReferralBonus.tsx`

**Change:**
```tsx
// Before (line 29)
const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

// After - Use the production domain directly
const PRODUCTION_DOMAIN = 'https://msktesla.net';
const referralLink = `${PRODUCTION_DOMAIN}/auth?ref=${referralCode}`;
```

This ensures:
- Users always copy the correct production link
- The share functionality uses the correct domain
- Friends who click the link go to `msktesla.net`, not the preview URL

---

### 2. Simplify Referral Display
Make the referral section more compact and professional:

**Changes:**
- Show shorter, cleaner referral code display (e.g., `msktesla.net/auth?ref=ABC12345`)
- Remove some visual clutter while keeping the electric-blue styling
- Ensure the component is more compact for the sidebar

---

### 3. Verify Rules Modal is Scrollable
The rules modal already has `ScrollArea` with `max-h-[85vh]` - this is working correctly.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/ReferralBonus.tsx` | Change domain to `msktesla.net`, simplify display |

---

## Technical Implementation

```tsx
// ReferralBonus.tsx - Key changes

// Use production domain constant
const PRODUCTION_DOMAIN = 'https://msktesla.net';
const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'TESLA500';
const referralLink = `${PRODUCTION_DOMAIN}/auth?ref=${referralCode}`;

// Display shorter version for UI
const displayLink = `msktesla.net/auth?ref=${referralCode}`;
```

---

## Result After Changes

1. **Correct Domain** - Referral links always point to `msktesla.net`
2. **Professional Appearance** - Clean, short referral link display
3. **Working Functionality** - Friends can click and sign up correctly
4. **Electric Blue Styling** - Maintained with copy button and share feature
