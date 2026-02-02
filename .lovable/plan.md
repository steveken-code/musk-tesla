

# Fix: Admin Cannot Create Manual Referrals

## Problem Found

The "Create Manual Referral" feature fails because the database Row-Level Security (RLS) policy **blocks admin users from inserting into the referrals table**.

Current RLS policies on `referrals`:
| Policy | Command | Condition |
|--------|---------|-----------|
| Admins can view all referrals | SELECT | `has_role(auth.uid(), 'admin')` |
| Admins can update referrals | UPDATE | `has_role(auth.uid(), 'admin')` |
| Users can create referral for themselves | INSERT | `auth.uid() = referred_user_id` |

**Missing**: There is no INSERT policy for admins. The current INSERT policy only allows the referred user to create their own referral record.

## Solution

Add a new RLS policy that allows admins to insert referral records.

## Implementation

### Step 1: Add RLS Policy for Admin Insert

Run a database migration to add the missing policy:

```sql
-- Allow admins to create referral records
CREATE POLICY "Admins can create referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

This single change will:
- Allow admins to insert referral records via the Admin panel
- Keep existing security for regular users (they can only create their own referral via signup)
- Maintain all other existing policies

## Why This Works

After adding this policy:
1. Admin enters referrer email and referred email in the modal
2. System finds both users in `profiles` table (works - admin has SELECT access)
3. System checks if referral already exists (works - admin has SELECT access)
4. System inserts new referral record (NOW WORKS - admin has INSERT access)
5. System updates referred user's profile with referral_code (works - this uses a different table)

## Testing After Fix

1. Go to Admin panel
2. Open "Create Manual Referral" modal
3. Enter your email as referrer
4. Enter your friend's email as referred
5. Click "Create Referral"
6. Should show success message
7. Check both dashboards - referral bonus sections should appear

## Files Changed

| File | Change |
|------|--------|
| Database migration | Add `Admins can create referrals` INSERT policy |

No code changes needed - the Admin.tsx logic is correct, it just couldn't execute due to missing database permission.

