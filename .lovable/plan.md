
# Fix KYC Verification Page Issues

## Summary of Issues Identified

### 1. Tax ID Input Text Not Visible
**Current Issue in `src/pages/VerifyIdentity.tsx` (Line 391-398):**
```tsx
<Input
  className="bg-slate-700 border-slate-500 text-white font-semibold placeholder:text-slate-400 focus:border-tesla-red"
  style={{ color: '#ffffff', fontWeight: 600, opacity: 1 }}
/>
```

**Problem:** The inline `style` attribute may be overridden by CSS specificity issues. The text appears invisible or very faint when users type.

**Fix:** Add explicit inline styles with `!important` for color and opacity, plus use a lighter background for better contrast.

---

### 2. "Net Amount" Field - What It Means
**Location:** `src/components/admin/KYCManagementModal.tsx` (Line 540-553)

**Explanation for Admin:** The "Net Amount" field represents the **final disbursement amount** that will be sent to the user's bank account after any fees, taxes, or adjustments. It is:
- Pre-filled with the original withdrawal request amount
- Editable by admin if adjustments are needed
- Displayed in the Settlement Required email as the amount the user will receive

This is the amount shown in the "Transaction Summary" section of emails sent to users.

---

### 3. Settlement Required Email Template Issues
**File:** `supabase/functions/send-settlement-required/index.ts`

| Issue | Current | Fix |
|-------|---------|-----|
| Top banner color | Green-to-Red gradient (line 99) | Pure green gradient (approved = positive) |
| Transaction Summary box | Red gradient background | Light grey (professional, non-alarming) |
| "Transaction Summary" text color | Red (#dc2626) | Tesla Electric Blue (#3b82f6) |
| Mixed color riot | Multiple competing colors | Clean, consistent color scheme |
| Sender name | "Tesla Stock" | "Tesla Stock Platform" |

---

### 4. URL Display for KYC Verification
**Current:** The verification link shows `https://msktesla.net/verify-identity?token=...&withdrawal_id=...`

**Question:** "How should the URL show?"

**Options:**
- Keep as-is (msktesla.net is the production domain)
- The URL in the browser will always show the full path with query parameters - this cannot be changed without breaking the token validation
- The **email button** text can display a cleaner label like "Complete Verification" while linking to the full URL (this is already implemented)

The current setup is correct - the production domain `msktesla.net` is shown, which is professional.

---

## Implementation Plan

### Step 1: Fix Tax ID Input Visibility
**File:** `src/pages/VerifyIdentity.tsx`

Change the Tax ID input (lines 391-398) to use:
```tsx
<Input
  type="text"
  value={taxId}
  onChange={(e) => setTaxId(e.target.value)}
  placeholder={taxIdConfig.placeholder}
  className="bg-slate-800 border-slate-500 text-white font-bold placeholder:text-slate-400 focus:border-tesla-red"
  style={{ 
    color: '#ffffff', 
    fontWeight: 700, 
    opacity: 1,
    WebkitTextFillColor: '#ffffff'
  }}
/>
```

Key changes:
- Add `WebkitTextFillColor: '#ffffff'` to override browser autofill styling
- Change `bg-slate-700` to `bg-slate-800` for better contrast
- Increase `fontWeight` to 700 (bold)

### Step 2: Fix Settlement Required Email Template
**File:** `supabase/functions/send-settlement-required/index.ts`

| Change | Line | From | To |
|--------|------|------|-----|
| Header gradient | 99 | `#22c55e 0%, #16a34a 50%, #dc2626 100%` | `#22c55e 0%, #16a34a 100%` (pure green) |
| Transaction Summary box | 138 | Red gradient `rgba(220, 38, 38, 0.1)` | Light grey `rgba(148, 163, 184, 0.1)` |
| Transaction Summary header | 141 | `color: #dc2626` | `color: #3b82f6` (electric blue) |
| Required Action text | 167 | `color: #dc2626` | `color: #ffffff` (neutral) |
| From email | 217 | `Tesla Stock` | `Tesla Stock Platform` |

### Step 3: Ensure Consistent Email Sender Branding
**Files:** Both email functions

| File | Current From | Fixed From |
|------|--------------|------------|
| `send-kyc-request/index.ts` | `Tesla Stock Platform` (correct) | No change needed |
| `send-settlement-required/index.ts` | `Tesla Stock` | `Tesla Stock Platform` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/VerifyIdentity.tsx` | Fix Tax ID input styling with explicit color properties |
| `supabase/functions/send-settlement-required/index.ts` | Fix email template colors and sender name |

---

## Visual Before/After

### Tax ID Input
**Before:** Text invisible or very faint when typing
**After:** Bold white text (#ffffff) clearly visible on dark background

### Settlement Email Header
**Before:** Green-to-red gradient (confusing - mixing approval with warning)
**After:** Pure green gradient (clear approval signal)

### Transaction Summary Box
**Before:** Red gradient background (alarming, aggressive)
**After:** Light grey background (professional, neutral, like Requirements box)

### Transaction Summary Title
**Before:** Red text (#dc2626)
**After:** Tesla Electric Blue (#3b82f6) - consistent with platform branding

---

## Technical Note on URL Display
The URL `https://msktesla.net/verify-identity?token=...` is the correct production URL. This is how SPAs work:
- The query parameters (`token`, `withdrawal_id`) are essential for the verification to work
- The email button text shows "Complete KYC Verification" (clean label)
- The actual URL in the browser address bar must contain the full path for the app to function

If you want to hide the query parameters from users, that would require a server-side redirect which is not recommended as it adds complexity and could break the verification flow.
