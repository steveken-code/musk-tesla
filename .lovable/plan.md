

# Fix Referral Bonus Visibility for Both Users

## Current Problems

### Problem 1: Referred Friend Cannot See Their $100 Bonus
When someone signs up using a referral link, they receive a $100 bonus stored in the `referrals` table as `referred_bonus`. However, this bonus is never displayed or included in their balance.

### Problem 2: Referral Bonuses Not Included in Balance
The dashboard balance calculation only considers investments and profits. Referral bonuses (both the $500 for referrers and $100 for referred users) are not added to the withdrawable balance.

### Problem 3: Referred User Has No Visibility
The referred user has no idea they received a bonus from signing up with a referral code.

---

## Solution Overview

### For the Referrer (Person who shares the link)
The `ReferralBonus` component already shows their referrals and earnings. We need to:
1. Include their referral bonus in the main balance display
2. Make the bonus withdrawable when conditions are met

### For the Referred Friend (Person who used the link)
Create a new component or section that shows:
1. "You received a $100 signup bonus from [referrer name]!"
2. Status of the bonus (pending until they invest, then active)
3. Include this in their withdrawable balance

---

## Files to Modify

### 1. `src/pages/Dashboard.tsx`
**Add referral bonus fetching and balance integration**

```typescript
// In fetchData function, add query for referred bonuses
const referralBonusRes = await supabase
  .from('referrals')
  .select('id, referrer_user_id, referred_bonus, status')
  .eq('referred_user_id', user!.id)
  .maybeSingle();

// Store in state
const [referredBonus, setReferredBonus] = useState<{
  amount: number;
  status: string;
  referrerName?: string;
} | null>(null);

// Update availableForWithdrawal calculation to include referral bonuses
const referrerBonusWithdrawable = hasInvested ? stats.totalBonus : 0;
const referredBonusWithdrawable = hasInvested && referredBonus?.status === 'active' ? referredBonus.amount : 0;

const availableForWithdrawal = Math.max(0, 
  completedInvestmentTotal + activeProfit + referrerBonusWithdrawable + referredBonusWithdrawable 
  - totalWithdrawn - pendingWithdrawals
);
```

### 2. `src/components/dashboard/ReferralBonus.tsx`
**Already exists - enhance to include referred bonus view**

Add a section that checks if the current user was referred:
```typescript
// Query for if the user was referred
const { data: wasReferred } = await supabase
  .from('referrals')
  .select('id, referrer_user_id, referred_bonus, status')
  .eq('referred_user_id', user.id)
  .maybeSingle();

// Display if they received a bonus
{wasReferred && (
  <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
    <div className="flex items-center gap-2">
      <Gift className="w-5 h-5 text-green-500" />
      <div>
        <p className="text-sm font-semibold text-green-400">
          You received a ${wasReferred.referred_bonus} signup bonus!
        </p>
        <p className="text-xs text-muted-foreground">
          {wasReferred.status === 'active' ? 'Ready to withdraw' : 'Invest to unlock'}
        </p>
      </div>
    </div>
  </div>
)}
```

### 3. Create new component: `src/components/dashboard/ReferredBonusBanner.tsx`
**Show a prominent banner for referred users**

A new component that displays at the top of the dashboard for users who signed up with a referral code, showing:
- Their $100 welcome bonus
- Status (locked/unlocked based on investment)
- Call-to-action to invest to unlock

---

## Technical Flow After Fix

```text
User A shares link: msktesla.net/auth?ref=B503E502
                          ↓
User B signs up with code
                          ↓
Referral record created:
  - referrer_user_id: User A
  - referred_user_id: User B
  - bonus_amount: $500 (for A)
  - referred_bonus: $100 (for B)
  - status: pending
                          ↓
User A Dashboard:                User B Dashboard:
┌─────────────────────┐          ┌─────────────────────────┐
│ Refer & Earn        │          │ Welcome Bonus!          │
│ 1 Referral          │          │ You received $100       │
│ Total: $500         │          │ Status: Invest to unlock│
│ Withdrawable: $0*   │          │ Withdrawable: $0*       │
└─────────────────────┘          └─────────────────────────┘
       (* Until they invest)
                          ↓
User B invests → Admin activates
                          ↓
Referral status → 'active'
                          ↓
User A Dashboard:                User B Dashboard:
┌─────────────────────┐          ┌─────────────────────────┐
│ Refer & Earn        │          │ Welcome Bonus!          │
│ 1 Referral (Active) │          │ $100 Ready to withdraw! │
│ Withdrawable: $500  │          │ Withdrawable: $100      │
└─────────────────────┘          └─────────────────────────┘
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Fetch referred bonus, include in balance calculation |
| `src/components/dashboard/ReferralBonus.tsx` | Add section showing if user was referred and their $100 bonus |
| NEW: `src/components/dashboard/ReferredBonusBanner.tsx` | Optional prominent banner for referred users |

---

## Technical Details

### Database Query for Referred User's Bonus
```typescript
// Check if current user was referred by someone
const { data: referralRecord } = await supabase
  .from('referrals')
  .select(`
    id,
    referred_bonus,
    status,
    referrer_user_id
  `)
  .eq('referred_user_id', user.id)
  .maybeSingle();
```

### Balance Calculation Update
```typescript
// Include both referrer and referred bonuses in withdrawal calculation
const referrerBonus = hasInvested ? stats.totalBonus : 0;
const referredBonus = hasInvested && referralRecord?.status === 'active' 
  ? referralRecord.referred_bonus 
  : 0;

const availableForWithdrawal = Math.max(0,
  completedInvestmentTotal + 
  activeProfit + 
  referrerBonus + 
  referredBonus - 
  totalWithdrawn - 
  pendingWithdrawals
);
```

