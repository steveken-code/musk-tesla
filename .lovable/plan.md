
# Auto-Populate Referral Code from URL

## Overview
When a user clicks a referral link like `msktesla.net/auth?ref=B503E502` or `msktesla.net/auth?ref=TATY-8492`, the Auth page will automatically:
1. Extract the referral code from the URL
2. Switch to the signup form (since referrals are for new users)
3. Pre-fill the referral code field with the code from the URL

## Current Behavior
- Referral code field is empty by default
- Users must manually type or paste the referral code
- TATY-8492 already works as an always-valid code in the validation logic

## Changes Required

### File: `src/pages/Auth.tsx`

**1. Import `useSearchParams` from react-router-dom**
Add the hook to read URL query parameters.

**2. Add URL parameter detection in useEffect**
```typescript
// Extract referral code from URL on page load
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref');
  
  if (refCode) {
    // Pre-fill the referral code field
    setReferralCode(refCode.toUpperCase());
    // Switch to signup mode (referrals are for new users)
    setIsLogin(false);
  }
}, []);
```

**3. No changes to TATY-8492 handling**
The built-in referral code `TATY-8492` continues to work as before in `AuthContext.tsx` (lines 62-77). The normalization logic strips dashes and validates both:
- `TATY-8492` → normalized to `TATY8492` → valid
- `TATY8492` → valid
- Any user UUID-based code like `B503E502` → validated against referrals table

## User Experience Flow

```text
User clicks: msktesla.net/auth?ref=B503E502
                    ↓
        Auth page loads
                    ↓
    URL parameter detected: ref=B503E502
                    ↓
    ┌─────────────────────────────────┐
    │  1. Switch to "Create Account"  │
    │  2. Pre-fill code: B503E502     │
    └─────────────────────────────────┘
                    ↓
    User just fills name, email, password
                    ↓
        Submits → Signup with referral
```

## Technical Details

| Aspect | Implementation |
|--------|----------------|
| URL parsing | `new URLSearchParams(window.location.search)` |
| Parameter name | `ref` (matches existing referral link format) |
| Case handling | Convert to uppercase automatically |
| Mode switch | Set `isLogin` to `false` when ref param present |
| Validation | Existing logic in AuthContext handles all codes |

## Summary
- Single file change: `src/pages/Auth.tsx`
- Add one new `useEffect` to detect and apply URL parameter
- TATY-8492 and all personal referral codes continue working unchanged
- Better UX: users clicking referral links don't need to type the code manually
