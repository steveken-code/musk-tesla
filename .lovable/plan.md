
# Comprehensive Fix Plan: Referral System, Email Notifications & Tracking

## Issues Identified

### 1. Referral Records Not Being Created (Critical Issue)
**Root Cause Found**: The referral INSERT RLS policy only allows inserts where `auth.uid() = referred_user_id`, meaning only the NEW user can insert a referral record. However, in `AuthContext.tsx`, the referral record is being inserted IMMEDIATELY after signup - but at that point, the new user doesn't have a valid session yet (they just signed up and haven't verified/logged in).

**Evidence**: 
- The `referrals` table is EMPTY (query returned `[]`)
- The INSERT policy: `WITH CHECK (auth.uid() = referred_user_id)` - requires the inserting user to be authenticated as the referred user
- After `supabase.auth.signUp()`, the user doesn't have a valid session yet

### 2. Referrer Lookup Logic is Flawed
**Current Logic** (lines 163-181 in AuthContext.tsx):
```typescript
// Current approach: Fetch ALL profiles, loop through them
const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id')
  .limit(100);  // Only fetches 100 profiles!

for (const profile of profiles) {
  if (profile.user_id.slice(0, 8).toLowerCase() === referrerCodePattern) {
    referrerUserId = profile.user_id;
    break;
  }
}
```

**Problems**:
- Only fetches 100 profiles (what if the referrer is user #101+?)
- Inefficient O(n) search through all profiles
- `TATY-8492` normalized to `taty8492` won't match any user ID pattern

### 3. Email Edge Functions Not Logging
**Status**: Edge functions return success (`200 OK`) but no logs appear
**Investigation**: The `send-welcome-email` function works when tested directly (returned `{"success": true, "message": "Welcome email queued"}`)

The emails might actually be sending, but the issue is likely:
- The referral record isn't created, so referral emails never get triggered
- If a user doesn't have a valid `referrer_user_id`, no email is sent

### 4. ReferralBonus Dashboard Shows Empty
**Root Cause**: Since no referral records exist in the database, the component correctly shows nothing. The query works fine:
```typescript
supabase
  .from('referrals')
  .select('id, referred_user_id, status, bonus_amount, created_at')
  .eq('referrer_user_id', user.id)  // This returns empty because no records exist
```

---

## Solution Architecture

### Solution 1: Fix Referral Record Creation (Database Migration)

Create a database function and trigger to automatically create referral records when a new user signs up with a referral code:

```sql
-- Create a function that runs as SECURITY DEFINER (bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_referral_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_referral_code text;
  v_referrer_id uuid;
BEGIN
  -- Get the referral code from the new profile
  v_referral_code := NEW.referral_code;
  
  -- Exit if no referral code
  IF v_referral_code IS NULL OR v_referral_code = '' THEN
    RETURN NEW;
  END IF;
  
  -- Normalize the code (remove dashes, uppercase)
  v_referral_code := UPPER(REPLACE(v_referral_code, '-', ''));
  
  -- Find the referrer by matching their user_id prefix
  SELECT user_id INTO v_referrer_id
  FROM profiles
  WHERE UPPER(LEFT(user_id::text, 8)) = v_referral_code
    AND user_id != NEW.user_id
  LIMIT 1;
  
  -- If found, create the referral record
  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO referrals (
      referrer_user_id,
      referred_user_id,
      referral_code,
      status,
      bonus_amount,
      referred_bonus
    ) VALUES (
      v_referrer_id,
      NEW.user_id,
      NEW.referral_code,
      'pending',
      500,
      100
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_referral_signup
  AFTER INSERT OR UPDATE OF referral_code ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NOT NULL AND NEW.referral_code != '')
  EXECUTE FUNCTION handle_referral_signup();
```

### Solution 2: Simplify AuthContext Referral Logic

Remove the complex referrer lookup from `AuthContext.tsx` since the database trigger handles it:

| Line Range | Current | New |
|------------|---------|-----|
| 155-196 | Complex profile fetching + referral insert | Just update profile with referral_code |

```typescript
// Simplified: Just save the referral code to profile
// The database trigger handles creating the referral record
if (canonicalReferralCode) {
  setTimeout(async () => {
    try {
      await supabase
        .from('profiles')
        .update({ referral_code: canonicalReferralCode })
        .eq('user_id', data.user!.id);
      
      console.log('Referral code saved to profile - trigger will create referral record');
      
      // Send notifications (these still work directly)
      // ... notification logic stays the same
    } catch (err) {
      console.error('Error saving referral code:', err);
    }
  }, 500);
}
```

### Solution 3: Fix Referral Email Trigger

Update the Admin panel's investment activation to properly send referral notification emails when an investment is activated:

In `Admin.tsx`, when activating an investment:
1. Query the `referrals` table for the investor
2. Find the referrer's email from their profile
3. Send the `investment_active` notification
4. Update referral status from `pending` to `active`

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Add `handle_referral_signup()` function and trigger |
| `src/contexts/AuthContext.tsx` | Simplify referral logic - remove profile fetching/insert |
| `src/pages/Admin.tsx` | Add referral status update + email on investment activation |

---

## Technical Flow After Fix

```text
User A shares link: msktesla.net/auth?ref=B503E502
                          ↓
User B clicks link → Auth page switches to signup mode
                          ↓
User B enters code manually (or auto-filled from URL)
                          ↓
SignUp → Profile created with referral_code = 'B503E502'
                          ↓
[DATABASE TRIGGER FIRES]
  → Finds User A by matching ID prefix 'B503E502...'
  → Creates referral record: {referrer: A, referred: B, status: 'pending'}
                          ↓
[EMAIL SENT]
  → User A gets "New referral signup" email
  → User B gets "Welcome bonus" email
                          ↓
User B makes investment → Admin activates it
                          ↓
[ADMIN PANEL]
  → Updates referral status to 'active'
  → Sends "Investment activated" email to User A
                          ↓
User A dashboard shows:
  - 1 referral (User B)
  - Status: Active
  - Bonus: $500
```

---

## Summary

The core issue is that referral records are never created because the RLS policy blocks the insert. The fix uses a `SECURITY DEFINER` database trigger that runs with elevated privileges to create the referral record automatically when a user profile is created with a referral code.

This approach is:
- **Reliable**: Database triggers are guaranteed to run
- **Secure**: SECURITY DEFINER is appropriate for system-level operations
- **Efficient**: Single SQL query finds the referrer by ID prefix
- **Scalable**: Works regardless of how many profiles exist
