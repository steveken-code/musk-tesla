

# Synchronize Portfolio Balance with Referral Bonuses

## Problem

Currently there's a mismatch between the two main balance displays:

| Display | Includes Referral Bonus? |
|---------|-------------------------|
| **Current Value** (purple card) | No |
| **Available for Withdrawal** | Yes |

This causes confusion - if you have $60,000 in investments/profits plus $500 referral bonus:
- Current Value shows: **$60,000**
- Available for Withdrawal shows: **$60,500**

These should match when all funds are withdrawable.

## Solution

Add referral bonuses to the portfolio balance calculation so both values stay synchronized.

### File: `src/pages/Dashboard.tsx`

**Line ~1133 - Update portfolio balance calculation:**

```typescript
// BEFORE: Doesn't include referral bonuses
const portfolioBalance = Math.max(0, totalInvested + totalProfit - totalWithdrawn);

// AFTER: Include referral bonuses for accurate total
const portfolioBalance = Math.max(0, 
  totalInvested + totalProfit + referrerBonusWithdrawable + referredBonusWithdrawable - totalWithdrawn
);
```

## Result After Fix

### For Eric (you):
| Source | Amount |
|--------|--------|
| Investments + Profits | $60,000 |
| Referrer Bonus | $500 |
| **Current Value** | **$60,500** |
| **Available for Withdrawal** | **$60,500** |

### For Igor 2:
| Source | Amount |
|--------|--------|
| Investment Profit | $50,000,000.58 |
| Welcome Bonus | $100 |
| **Current Value** | **$50,000,100.58** |
| **Available for Withdrawal** | **$50,000,100.58** |

## Why This Makes Sense

1. **Consistency** - Both numbers now represent your true total value
2. **User Clarity** - No confusion about "missing" bonus money
3. **Accuracy** - The referral bonus IS real money you can withdraw, so it should appear in your total

## Technical Details

The calculation order:
1. `referrerBonusWithdrawable` is only > 0 when user has invested AND referrals are active/paid
2. `referredBonusWithdrawable` is only > 0 when user has invested AND their referral status is active/paid
3. Both are already correctly calculated earlier in the code
4. We just need to add them to the portfolio balance display

## Files to Change

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add referral bonuses to `portfolioBalance` calculation |

This is a single-line change that will synchronize both balance displays.

