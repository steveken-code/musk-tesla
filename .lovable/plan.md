
# Plan: Fix Referral Welcome Bonus Not Showing in Dashboard

## Problem Identified

New users signing up with a referral link are **not seeing their $100 welcome bonus** in the dashboard. After investigation, I found the root cause:

**The database trigger that creates user profiles does NOT include the referral_code field.**

### Current Flow (Broken)

1. User signs up with referral code in URL
2. `handle_new_user()` trigger fires and creates profile with ONLY: `user_id`, `email`, `full_name`
3. Frontend tries to update profile with `referral_code` 500ms later
4. If this update fails or times out, no referral record is created
5. User sees no welcome bonus

### Working Cases

Looking at the database, users like "Tatyana Pilipyak" and "Nostress" have `referral_code` saved and have referral records. The most recent user "DHL" has `referral_code = null` and no referral record.

---

## Solution

Update the `handle_new_user()` database function to include the `referral_code` from user metadata during signup. This ensures the referral code is captured immediately when the profile is created, triggering the `handle_referral_signup` function reliably.

---

## Technical Changes

### 1. Update `handle_new_user()` Database Function

Modify the function to extract and save the referral_code from user metadata:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, referral_code)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'referral_code'  -- NEW: Include referral code
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;
```

### 2. What Happens After This Fix

1. User signs up with referral code in URL
2. Frontend stores `referral_code` in user metadata during signup (already working)
3. `handle_new_user()` trigger creates profile **WITH** the referral_code
4. `handle_referral_signup()` trigger fires immediately and creates referral record
5. User sees their $100 welcome bonus in the dashboard

---

## Impact

| Before Fix | After Fix |
|------------|-----------|
| Referral code saved 500ms later via frontend | Referral code saved immediately via trigger |
| Race conditions could cause missed referrals | Atomic operation, no race conditions |
| Some users get bonus, some don't | All referral signups get bonus reliably |

---

## Files Changed

- Database migration to update `handle_new_user()` function

---

## No Changes Required

- Frontend code (AuthContext.tsx) - already passes referral_code in metadata
- `handle_referral_signup()` trigger - already works correctly
- ReferralBonus.tsx component - already displays bonus correctly when data exists
- Email notifications - already working

---

## Existing Users

Users who signed up with a referral code but didn't get their bonus (like "DHL") can be manually fixed by an admin updating their profile's `referral_code` field, which will trigger the referral creation.
