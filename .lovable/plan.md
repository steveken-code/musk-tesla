

# Fix Referral Bonus Withdrawal Calculation

## Problem Identified

Your $500 referrer bonus and Igor 2's $100 welcome bonus are not appearing in the "Available for Withdrawal" balance because of a status check mismatch:

| User | Bonus | Referral Status | Expected | Current Result |
|------|-------|-----------------|----------|----------------|
| Eric (you) | $500 referrer | `active` | Withdrawable | **Not counted** |
| Igor 2 | $100 welcome | `active` | Withdrawable | Works correctly |

**Root Cause:** The Dashboard.tsx code only counts referrals with `status === 'paid'`, but when a referred friend activates their investment, the status becomes `'active'` (not `'paid'`).

---

## Solution

Update the referrer bonus calculation to include `'active'` status referrals (not just `'paid'`).

### File: `src/pages/Dashboard.tsx`

**Line ~809 - Fix the referrer bonus filter:**

```typescript
// BEFORE: Only counts 'paid'
const paidReferralBonus = referrerBonusRes.data
  .filter(r => r.status === 'paid')
  .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);

// AFTER: Count 'active' AND 'paid' (both are withdrawable)
const paidReferralBonus = referrerBonusRes.data
  .filter(r => r.status === 'active' || r.status === 'paid')
  .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);
```

---

## How the Math Works After Fix

### For Eric (referrer):
| Source | Amount |
|--------|--------|
| Completed Investment | $2,000 |
| Investment Dividend | $58,000 |
| Referrer Bonus (Igor 2) | $500 |
| **Total Available** | **$60,500** |

### For Igor 2 (referred):
| Source | Amount |
|--------|--------|
| Active Investment Profit | $50,000,000.58 |
| Welcome Bonus | $100 |
| **Total Available** | **$50,000,100.58** |

---

## Technical Details

The referral status lifecycle:
1. `pending` - Friend signed up but hasn't invested yet
2. `active` - Friend's investment was activated → **Bonus becomes withdrawable**
3. `paid` - Bonus was withdrawn (optional final state)

The fix ensures that once a friend's investment goes active, both bonuses are immediately available:
- Referrer's $500 (if referrer has also invested)
- Friend's $100 (automatically, since their investment is active)

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Include `'active'` status in referrer bonus calculation |

This is a one-line fix that will correctly add the $500 + $100 to the respective users' withdrawable balances.

