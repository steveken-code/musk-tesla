

# Fix Password Reset and Referral Code Issues

## Issue 1: Password Reset Fails with Custom Passwords

**Root Cause:** Two problems working together:

1. **Error handling is broken** -- When the `complete-password-reset` backend function returns an error (status 400), the SDK wraps it in a generic `FunctionsHttpError` object. The code tries to read `error.message`, but that gives a generic SDK message like "Edge Function returned a non-2xx status code" -- NOT the actual error details from the function. This hides the real issue from the user.

2. **Missing `autoComplete` attributes** -- The password inputs don't have `autoComplete="new-password"`, which causes some browsers (especially mobile) to interfere with manual password entry on password reset forms. Browser-suggested passwords bypass this because they fill the fields directly.

**Fix:**
- Add `autoComplete="new-password"` to both password inputs in `ResetPassword.tsx`
- Fix the error handling to properly extract the response body from edge function errors, so users see the actual error message instead of a generic one

## Issue 2: Signup Blocked by Invalid Referral Code

**Root Cause:** In `AuthContext.tsx` (lines 127-158), when a referral code is provided (even auto-filled from a `?ref=CODE` URL), the code validates it server-side. If validation fails, signup is **blocked entirely** with an error message. This means:
- Someone clicking a referral link with a typo or expired code cannot create an account at all
- The referral code field looks required even though it says "optional"

**Fix:**
- When a referral code is provided but invalid, **don't block signup** -- just silently ignore the bad code and proceed without referral
- Show a gentle warning toast ("Referral code not recognized, continuing without it") instead of blocking
- Signup without any referral code already works (the code has an `if` check) -- no changes needed there

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ResetPassword.tsx` | Add `autoComplete="new-password"` to both inputs; fix error handling to parse edge function response body |
| `src/contexts/AuthContext.tsx` | Change referral validation from blocking to warning -- invalid codes silently skipped, signup proceeds |

### No database or backend changes needed
Both fixes are purely frontend logic changes.

