
# KYC Request Email Improvements

## Overview

This plan fixes the KYC request email template to:
1. Change the Requirements box from blue to a natural light grey color
2. Make the Requirements text color professional (white/slate instead of blue)
3. Update the sender name to "Tesla Stock Platform" with noreply email
4. Fix the verification URL to use `https://msktesla.net` instead of Lovable URLs

---

## Changes Required

### 1. Edge Function: `supabase/functions/send-kyc-request/index.ts`

**Line 85 - Fix Fallback URL:**
Change from:
```javascript
const verificationUrl = payload.verificationUrl || `https://msktesla.lovable.app/verify-identity?token=${payload.kycToken}&withdrawal_id=${payload.withdrawalId}`;
```
To:
```javascript
const verificationUrl = payload.verificationUrl || `https://msktesla.net/verify-identity?token=${payload.kycToken}&withdrawal_id=${payload.withdrawalId}`;
```

**Line 217 - Update Sender:**
Ensure the FROM_EMAIL fallback uses proper branding:
```javascript
const fromEmail = Deno.env.get("FROM_EMAIL") || "Tesla Stock Platform <noreply@teslastockplatform.com>";
```

**Lines 142-155 - Requirements Box Styling:**
Change from blue to natural light grey:

| Property | Before (Blue) | After (Light Grey) |
|----------|--------------|-------------------|
| Background | `rgba(59, 130, 246, 0.08)` | `rgba(148, 163, 184, 0.1)` |
| Border | `rgba(59, 130, 246, 0.25)` | `rgba(148, 163, 184, 0.25)` |
| Header Color | `#3b82f6` (blue) | `#e2e8f0` (slate-200, white-ish) |

---

### 2. KYC Management Modal: `src/components/admin/KYCManagementModal.tsx`

**Line 173 - Fix Verification URL Origin:**
Change from using `window.location.origin` (which gives Lovable preview URL) to hardcoded production URL:

```javascript
// Before
const verificationUrl = `${window.location.origin}/verify-identity?token=${kycToken}&withdrawal_id=${withdrawal.id}`;

// After  
const verificationUrl = `https://msktesla.net/verify-identity?token=${kycToken}&withdrawal_id=${withdrawal.id}`;
```

---

## Final Email Requirements Box Appearance

```
+------------------------------------------------------------------+
|  Background: Very subtle slate/grey tint                          |
|  Border: Light grey border                                        |
|                                                                    |
|  📋 REQUIREMENTS                                                   |
|      Color: White/light slate (not blue)                          |
|                                                                    |
|  • Government-Issued ID: Passport, National ID, or Driver's...   |
|  • Tax Identification: [Country-specific label]                   |
|      Text: Light grey for descriptions, white for emphasis        |
+------------------------------------------------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/send-kyc-request/index.ts` | Update Requirements box styling (grey bg, white text), fix fallback URL to msktesla.net |
| `src/components/admin/KYCManagementModal.tsx` | Fix verificationUrl to use msktesla.net instead of window.location.origin |

---

## Summary of Color Changes

| Element | Before | After |
|---------|--------|-------|
| Requirements box background | Blue tint `rgba(59, 130, 246, 0.08)` | Grey tint `rgba(148, 163, 184, 0.1)` |
| Requirements box border | Blue `rgba(59, 130, 246, 0.25)` | Grey `rgba(148, 163, 184, 0.25)` |
| Requirements header text | Blue `#3b82f6` | Light slate `#e2e8f0` |
| Verification link | Lovable URL | `https://msktesla.net/...` |
