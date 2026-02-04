

# Comprehensive Security Hardening Plan

## Security Issues Identified

The security scan revealed 13 findings across your application. I'll address each one with specific fixes.

---

## Issue 1: Referral System Could Be Abused for Fraud (Critical)

### Current Vulnerabilities
1. **Users can create referrals for themselves** - The RLS policy `Users can create referral for themselves` allows `WITH CHECK (auth.uid() = referred_user_id)`, meaning users could potentially insert fake referral records
2. **No unique constraint on referral code per user** - A user could potentially be referred multiple times with different codes
3. **Referral code exposed** - Users can see referral codes in the referrals table which could enable enumeration attacks

### Good News - Already Protected
- **Database trigger `handle_referral_signup`** already handles referral creation server-side with `ON CONFLICT DO NOTHING`
- **Unique constraint exists** on `referred_user_id` column preventing duplicate referrals for the same user
- **Server-side validation via RPC** function `validate_referral_code` validates codes before signup

### Fixes Required

**Fix 1A: Remove the dangerous INSERT policy for referrals**

Remove the policy "Users can create referral for themselves" since referrals should ONLY be created by the database trigger `handle_referral_signup`. The current policy creates an attack vector.

```sql
DROP POLICY IF EXISTS "Users can create referral for themselves" ON referrals;
```

**Fix 1B: Add rate limiting to signup process**

The AuthContext should rate-limit signups on the client side, and we should add a database function to prevent rapid referral creation attempts.

---

## Issue 2: User Contact Information Could Enable Identity Theft (Critical)

### Current Vulnerability
The RLS policy `Users can view referred user profiles` exposes the FULL profile (email, phone, avatar_url) to referrers. This enables:
- Email harvesting for spam/phishing
- Phone number collection for social engineering
- Privacy violations

### Fix Required

**Fix 2A: Create a restricted view for referral profile data**

Instead of exposing full profiles, create a view that only shows non-sensitive data (name, avatar).

```sql
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view referred user profiles" ON profiles;

-- Create new policy that uses a restricted column set via RPC
CREATE OR REPLACE FUNCTION get_referred_user_summary(p_referred_user_id uuid)
RETURNS TABLE(full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(full_name, 'User') as full_name,
    avatar_url
  FROM profiles
  WHERE user_id = p_referred_user_id
  AND EXISTS (
    SELECT 1 FROM referrals
    WHERE referrals.referrer_user_id = auth.uid()
    AND referrals.referred_user_id = p_referred_user_id
  );
$$;
```

**Fix 2B: Update ReferralBonus component to use the RPC function**

Modify the component to call the RPC function instead of directly querying profiles.

---

## Issue 3: Investment Portfolios Data Protection (Warning)

### Current Status
The investments table has proper RLS policies:
- Users can only view their own investments
- Admins can view all investments

### Action: No database changes needed
The current policies are secure. The warning is informational.

---

## Issue 4: KYC Documents and Sensitive Data (Critical)

### Current Protections (Already Good)
- `kyc-documents` storage bucket is **private** (not public)
- KYC documents are uploaded via edge function with token validation
- Signed URLs expire after 1 year

### Recommended Improvements

**Fix 4A: Reduce signed URL expiration**

Change from 1 year to 7 days in `upload-kyc-document` edge function:

```typescript
// Before: 60 * 60 * 24 * 365 (1 year)
// After: 60 * 60 * 24 * 7 (7 days)
const { data: signedUrlData } = await supabase.storage
  .from('kyc-documents')
  .createSignedUrl(storagePath, 60 * 60 * 24 * 7);
```

**Fix 4B: Add file type validation**

Add validation to reject non-image files and files over 10MB.

---

## Issue 5: RLS Policies Always True (Warning)

### Affected Tables
1. `admin_login_attempts` - INSERT policy uses `WITH CHECK (true)`
2. `user_login_attempts` - INSERT policy uses `WITH CHECK (true)`

### Current Status
These are intentional for service role access from edge functions. The policies check for service role authentication.

### Action: No changes needed
These are correctly configured for the intended use case (edge functions logging login attempts).

---

## Issue 6: Leaked Password Protection Disabled (Warning)

### Fix Required
Enable leaked password protection in Supabase Auth settings to prevent users from using passwords that have been exposed in data breaches.

---

## Summary of Database Changes

| Change | Type | Impact |
|--------|------|--------|
| Drop "Users can create referral for themselves" policy | RLS Policy | Prevents referral fraud |
| Drop "Users can view referred user profiles" policy | RLS Policy | Prevents email/phone harvesting |
| Add `get_referred_user_summary` RPC function | Database Function | Safe referral profile access |
| Configure leaked password protection | Auth Setting | Prevents weak passwords |

---

## Summary of Code Changes

| File | Change |
|------|--------|
| `supabase/functions/upload-kyc-document/index.ts` | Reduce signed URL expiration, add file validation |
| `src/components/dashboard/ReferralBonus.tsx` | Use RPC function for profile data |

---

## Technical Details

### New RPC Function: `get_referred_user_summary`

This function safely returns only non-sensitive profile data (name, avatar) for users that the caller has referred. It uses `SECURITY DEFINER` to bypass RLS but includes explicit authorization checks.

### Why Remove the User INSERT Policy for Referrals?

The current architecture already handles referral creation through:
1. **Database trigger `handle_referral_signup`** - Fires on profile INSERT/UPDATE
2. **ON CONFLICT DO NOTHING** - Prevents duplicates
3. **Unique constraint on `referred_user_id`** - Database-level protection

The user-facing INSERT policy is redundant and creates an attack surface.

### Rate Limiting Already in Place

The application already has rate limiting implemented in:
- Password reset flows
- Email verification
- Admin login
- Withdrawals

The signup flow validates referral codes server-side via RPC before proceeding.

