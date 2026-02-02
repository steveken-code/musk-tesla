
# Fix Referral Display, Balance Breakdown, and Country Dropdown Issues

## Issues Identified

### Issue 1: Referral List Shows "User" Instead of Friend's Name/Photo
**Root Cause**: The `ReferralBonus` component queries the `profiles` table but:
- Only fetches `full_name` and `email` - **missing `avatar_url`**
- The profile data exists correctly in the database (Igor 2 with avatar)
- The interface `ReferralRecord.profile` doesn't include `avatar_url`
- The UI shows a placeholder initial instead of the actual profile photo

**Database confirms data exists**:
- Referrer: Eric Ben (with avatar URL)
- Referred friend: Igor 2 (with avatar URL)

### Issue 2: Referred Friend Doesn't See Referrer Info
**Current behavior**: The referred user sees their "$100 Welcome Bonus" but doesn't know WHO referred them.
**Missing**: A section showing "You were referred by [Referrer Name + Photo]"

### Issue 3: Withdrawal Balance Doesn't Show Referral Bonus Breakdown
**Current behavior**: The withdrawal modal shows:
- Completed Investments total
- Active Trading Profit

**Missing**: 
- Referral Bonus line item (the $500 referrer bonus OR $100 referred bonus)
- Users don't see that referral bonuses are included in their available balance

### Issue 4: Country Dropdown Issues (Step 2 of Withdrawal)
**Current behavior**: The dropdown in the withdrawal modal (lines 1679-1737):
- Works but could have overlay/z-index issues on some devices
- Uses `includes()` for filtering instead of `startsWith()` (less intuitive)
- Missing instant keyboard input focus

The `InvestmentCountrySelector` component uses better UX patterns that should be applied here too.

---

## Implementation Plan

### Part A: Fix Referral Display to Show Names and Photos

**File: `src/components/dashboard/ReferralBonus.tsx`**

1. Update the `ReferralRecord` interface to include `avatar_url`:
```typescript
interface ReferralRecord {
  id: string;
  referred_user_id: string;
  status: string;
  bonus_amount: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;  // ADD THIS
  };
}
```

2. Update the query to include `avatar_url`:
```typescript
const { data: profiles } = await supabase
  .from('profiles')
  .select('user_id, full_name, email, avatar_url')  // ADD avatar_url
  .in('user_id', referredUserIds);
```

3. Update the referral card to show the actual profile photo:
```typescript
{record.profile?.avatar_url ? (
  <img 
    src={record.profile.avatar_url} 
    alt={getUserDisplay(record)}
    className="w-8 h-8 rounded-full object-cover ring-2 ring-electric-blue/30"
  />
) : (
  <div className="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center...">
    {getUserDisplay(record).charAt(0).toUpperCase()}
  </div>
)}
```

### Part B: Show Referrer Info to Referred Friend

**File: `src/components/dashboard/ReferralBonus.tsx`**

Add state and query for referrer information:

1. Add new interface:
```typescript
interface ReferrerInfo {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}
```

2. In the `fetchData` function, also fetch who referred the current user:
```typescript
// If user was referred, get the referrer's profile
if (wasReferredResult.data) {
  const referralRecord = wasReferredResult.data;
  const { data: referrerProfile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('user_id', referralRecord.referrer_user_id)
    .maybeSingle();
  setReferrerInfo(referrerProfile);
}
```

3. Show referrer info in the Welcome Bonus section:
```typescript
{wasReferred && referrerInfo && (
  <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
    {referrerInfo.avatar_url && (
      <img src={referrerInfo.avatar_url} className="w-5 h-5 rounded-full" />
    )}
    <span>Referred by {referrerInfo.full_name || 'Friend'}</span>
  </div>
)}
```

### Part C: Add Referral Bonus to Withdrawal Breakdown

**File: `src/pages/Dashboard.tsx`**

Add referral bonus breakdown in the withdrawal modal (after line 1622):

```typescript
{/* Referral Bonuses */}
{(referrerBonusWithdrawable > 0 || referredBonusWithdrawable > 0) && (
  <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
    <p className="text-[10px] sm:text-xs text-purple-400">
      🎁 Referral Bonuses: ${(referrerBonusWithdrawable + referredBonusWithdrawable).toLocaleString()}
    </p>
    <p className="text-[9px] sm:text-[10px] text-muted-foreground">
      {referredBonusWithdrawable > 0 && `Welcome Bonus: $${referredBonusWithdrawable.toLocaleString()}`}
      {referrerBonusWithdrawable > 0 && referredBonusWithdrawable > 0 && ' + '}
      {referrerBonusWithdrawable > 0 && `Referral Earnings: $${referrerBonusWithdrawable.toLocaleString()}`}
    </p>
  </div>
)}
```

### Part D: Improve Withdrawal Country Dropdown

**File: `src/pages/Dashboard.tsx`**

1. Add `useRef` for auto-focus on the search input when dropdown opens:
```typescript
const countrySearchInputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (showCountryDropdown && countrySearchInputRef.current) {
    requestAnimationFrame(() => {
      countrySearchInputRef.current?.focus({ preventScroll: true });
    });
  }
}, [showCountryDropdown]);
```

2. Update filter to use `startsWith` for more intuitive search:
```typescript
const filteredCountries = allCountries.filter(c => {
  const query = countrySearch.toLowerCase().trim();
  if (!query) return true;
  return c.name.toLowerCase().startsWith(query) || c.code.toLowerCase().startsWith(query);
});
```

3. Add click-outside handler to close dropdown:
```typescript
// Close country dropdown when clicking outside
useEffect(() => {
  if (!showCountryDropdown) return;
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.country-dropdown-container')) {
      setShowCountryDropdown(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [showCountryDropdown]);
```

4. Ensure z-index is properly applied (already `z-[100]` but verify no overflow issues)

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/components/dashboard/ReferralBonus.tsx` | Add `avatar_url` to profile query and display photos; add referrer info section for referred users |
| `src/pages/Dashboard.tsx` | Add referral bonus breakdown in withdrawal modal; improve country dropdown UX with auto-focus, startsWith filter, and click-outside handling |

## Expected Results After Fix

**For You (Eric Ben - the Referrer)**:
- Your "My Referrals" list will show **Igor 2's actual name and profile photo**
- When withdrawing, you'll see: "🎁 Referral Bonuses: $500"

**For Your Friend (Igor 2 - the Referred)**:
- Their Welcome Bonus section will show: "Referred by Eric Ben" with your photo
- When withdrawing, they'll see: "🎁 Referral Bonuses: $100"
- Their available balance includes their $100 welcome bonus (since they have active investment)

**For the Withdrawal Flow**:
- Country search will focus automatically when dropdown opens
- Typing "Rus" will immediately show Russia at the top
- Clicking outside the dropdown closes it properly
