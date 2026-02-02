
# Fix Referral Bonus System and Professional Language Updates

## Summary of Issues Found

After investigating the codebase and database, I identified **three main problems**:

### 1. Referral Bonuses Not Showing (Critical)
**Root Cause**: The `referrals` table is **completely empty**. Looking at the `profiles` table, **ALL users have `referral_code` set to NULL**, which means:
- The database trigger `handle_referral_signup` never fires because it only triggers when `referral_code` is not null
- The profile update after signup (in `AuthContext.tsx` line 191-194) is using `.update()` but the profile may not exist yet when it runs
- Result: No referral record is created, so neither the referrer nor the referred user sees any bonus

### 2. "Profit Added" Wording Too Informal
The profit notification email (line 191 in `send-profit-notification`) uses "Profit Added" which sounds artificial. User requested more professional terminology like "Dividend Paid".

### 3. Missing Referral Bonus Summary Box
Users need a dedicated, visible section showing:
- Their welcome bonus ($100 if referred)
- How many people they've referred
- Total bonus earnings

---

## Implementation Plan

### A. Fix Referral Record Creation (Critical Fix)

**File: `src/contexts/AuthContext.tsx`**

The issue is that when updating the profile with the referral code, the profile might not exist yet (race condition with the auth trigger). I will:

1. Change the profile update to use **upsert** instead of **update**
2. Ensure `referral_code` is always saved when present
3. Add retry logic in case the profile doesn't exist immediately

```typescript
// Current (broken):
await supabase.from('profiles').update(updateData).eq('user_id', data.user!.id);

// Fixed (upsert with retry):
await supabase.from('profiles').upsert({
  user_id: data.user!.id,
  full_name: fullName,
  email: email,
  referral_code: canonicalReferralCode || null
}, { onConflict: 'user_id' });
```

### B. Change "Profit Added" to Professional Language

**File: `supabase/functions/send-profit-notification/index.ts`**

Update line 191 from:
```html
<p style="...">Profit Added</p>
```
To:
```html
<p style="...">Dividend Credited</p>
```

Also update the email subject line from "profit" to more professional wording.

### C. Add Dedicated Referral Bonus Summary Box

**File: `src/components/dashboard/ReferralBonus.tsx`**

The component already exists and is well-designed. However, I need to verify it's positioned prominently. Looking at the Dashboard, it's already included at line 1362. The issue is that the **data isn't loading because there are no referral records**.

Once Part A is fixed, users will see:
- Welcome Bonus section (already implemented, lines 203-230)
- Stats grid showing referrals, earnings, and withdrawable amount (lines 249-289)
- Referral tracking table showing friend names and status (lines 292-326)

### D. Admin Backfill for Existing Users

Since the `referrals` table is empty and all `referral_code` values are NULL, if there were actual users who signed up with referral links, we need a way to manually add their referral records.

I will:
1. Add an "Add Manual Referral" button in the Admin panel
2. Admin can select a referrer and a referred user
3. System creates the referral record with proper bonus amounts

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Fix profile upsert to reliably save referral_code |
| `supabase/functions/send-profit-notification/index.ts` | Change "Profit Added" to "Dividend Credited" |
| `src/pages/Admin.tsx` | Add manual referral creation form |
| `src/components/dashboard/ReferralBonus.tsx` | Minor UI improvements (already functional) |

---

## Technical Details

### Why the Current System Fails

1. User clicks referral link: `/signup?ref=E1659FF6`
2. AuthContext captures the code and validates it (works)
3. User is created in `auth.users` with metadata (works)
4. `handle_new_user` trigger fires and creates profile row (works, but WITHOUT referral_code initially)
5. AuthContext tries to UPDATE the profile with referral_code (FAILS - race condition or RLS issue)
6. Profile has `referral_code = NULL`, so `on_profile_referral_signup` trigger never fires
7. No referral record is created
8. Neither user sees any bonus

### The Fix

By using **upsert** with proper error handling and including `email` in the payload, we guarantee the profile row exists and has the referral code. The trigger will then fire and create the referral record.

---

## Post-Fix Verification

After implementing, verify:
1. Sign up with a referral link (e.g., `/signup?ref=E1659FF6`)
2. Check `profiles` table - `referral_code` should be set
3. Check `referrals` table - new record should exist
4. Referrer sees the new referral in their dashboard
5. Referred user sees "$100 Welcome Bonus" message
6. When investment is activated, referral status changes to "active"
7. Profit emails now say "Dividend Credited" instead of "Profit Added"
