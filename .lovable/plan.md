

# Fix User Display in Admin Panel - Complete Data Sync

## Problem Analysis

Two recent users are showing as "User-9cfe9375" and "User-8b1c92bc" because:

1. **Missing profile entries**: These users exist in `auth.users` with names but have NO entries in the `profiles` table
2. **Trigger didn't fire**: The `handle_new_user` trigger should create profiles on signup, but it failed for these users

### Current Data:

| User ID | Name in auth.users | Name in profiles | Status |
|---------|-------------------|------------------|--------|
| 9cfe9375-... | Igor | NULL (no record) | Missing profile |
| 8b1c92bc-... | Andrew Felix | NULL (no record) | Missing profile |

---

## Solution

### Part 1: Create Missing Profile Entries (Database Fix)

Insert the missing profile records using data from auth.users:

```sql
-- Insert missing profiles for users who exist in auth.users but not in profiles
INSERT INTO public.profiles (user_id, email, full_name)
SELECT 
  id as user_id,
  email,
  raw_user_meta_data ->> 'full_name' as full_name
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);
```

This will create profiles for:
- `9cfe9375-942c-482f-a43a-2caa9cbd1a10` - Igor (igorelchaninov84+3@gmail.com)
- `8b1c92bc-92ad-476d-8271-7a78f2eb44f0` - Andrew Felix (marcaptain64@gmail.com)

### Part 2: Prevent Future Missing Profiles

The existing `handle_new_user` trigger function looks correct:

```sql
CREATE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$
```

The trigger should already be attached. The issue may have been a temporary database issue or the trigger was added after these users signed up.

### Part 3: Update ReferralSettings Interface (Code Cleanup)

Remove the unused `referralCode` field from the interface since we removed it from the admin UI:

**File: `src/pages/Admin.tsx`**

```typescript
// Line 62-65: Update interface
interface ReferralSettings {
  referralEmail: string;
}
```

Also update the default settings and any references to `referralCode`.

---

## Implementation Steps

| Step | Action | File |
|------|--------|------|
| 1 | Insert missing profile records | Database migration |
| 2 | Clean up ReferralSettings interface | `src/pages/Admin.tsx` |
| 3 | Remove referralCode from defaults | `src/pages/Admin.tsx` |

---

## Expected Outcome

After implementation:

1. **Igor** will display as "Igor" with email `igorelchaninov84+3@gmail.com`
2. **Andrew Felix** will display as "Andrew Felix" with email `marcaptain64@gmail.com`
3. All future signups will automatically create profile entries
4. Code will be cleaner without the unused referralCode field

---

## Verification

After the migration runs, the admin panel will show:

| Before | After |
|--------|-------|
| User-9cfe9375 | Igor |
| User-8b1c92bc | Andrew Felix |

