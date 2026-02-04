
# Plan: Disable Supabase "Confirm Your Signup" Email

## What's Happening Now

When a user signs up, they receive **two separate emails**:

1. **Supabase's Built-in Email** - "Confirm your signup" from Supabase Auth
2. **Your Custom Welcome Email** - Sent via `send-welcome-email` edge function

You want to remove the Supabase confirmation email and only keep your custom welcome email.

---

## Solution

Enable **auto-confirm email signups** in the authentication settings. This tells Supabase to automatically mark new users as verified, skipping the built-in confirmation email entirely.

---

## What Will Change

| Before | After |
|--------|-------|
| User gets 2 emails on signup | User gets only your custom welcome email |
| User must click Supabase confirm link | User account is active immediately |
| Supabase sends "Confirm your signup" | No Supabase confirmation email sent |

---

## Your Custom Email System Stays Intact

Your existing system still works:
- **Welcome email** via `send-welcome-email` is still sent on signup
- **Email verification tokens** are still created (for manual verification if needed)
- **Resend verification** function still works if you want users to verify later

---

## Implementation

I will use the authentication configuration tool to enable `autoconfirm` for email signups. This is a single setting change in your backend.

---

## Technical Details

### Configuration Change
- Set `autoconfirm: true` in auth settings
- This prevents Supabase from sending its default confirmation email
- Users can sign in immediately after signup

### Impact on Security
- Users will not need to verify their email to access the dashboard
- Your custom verification system (via `email_verification_tokens` table) can still be used if you want to require verification for certain actions later
- The `email_verified` field in profiles can still track verification status
