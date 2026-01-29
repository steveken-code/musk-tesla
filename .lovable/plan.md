

# Rules Modal Scroll Fix & Complete Referral System Enhancement

## Overview
This plan addresses all the user's concerns:
1. Fix the rules modal scrolling issue
2. Ensure HTTPS in referral links
3. Send referral emails to BOTH referrer and referred user
4. Show comprehensive referral tracking stats
5. Referral bonus withdrawable only if user has invested

---

## Current State Analysis

### Issues Found:
1. **Rules Modal**: Already has `ScrollArea` but may not be working properly on mobile - needs explicit overflow handling
2. **HTTPS**: Link already uses `https://msktesla.net` (confirmed in code) - this is correct
3. **Referral Emails**: Currently only sends to the referrer - need to also send welcome email to referred user
4. **Referral Stats**: Stats display exists but needs enhancement with withdrawal eligibility
5. **Withdrawal Restriction**: Need to add logic to check if user has active/completed investment before allowing referral bonus withdrawal

---

## Changes Summary

### 1. Fix Rules Modal Scrolling
**File:** `src/components/dashboard/ActionsPanel.tsx`

**Problem:** The `ScrollArea` may not be properly scrolling on some mobile browsers

**Solution:**
- Add explicit `overflow-y-auto` as fallback
- Ensure proper viewport height calculation
- Add touch-friendly scrolling with `-webkit-overflow-scrolling: touch`

```tsx
<DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0">
  <ScrollArea className="flex-1 overflow-y-auto px-4 sm:px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
    {/* Rules content */}
  </ScrollArea>
</DialogContent>
```

---

### 2. Send Referral Email to BOTH Users
**File:** `supabase/functions/send-referral-notification/index.ts`

**Enhancement:**
- Add new email type `'welcome_referred'` for the referred user
- Send welcome email with $100 bonus info to the new user
- Send notification to referrer about the new signup

**New Email for Referred User:**
```typescript
// When someone signs up with a referral code, send them a welcome email
type: 'welcome_referred' -> Sends to the NEW user
  - Subject: "Welcome! You've Earned a $100 Referral Bonus"
  - Content: Congratulations on joining, your $100 bonus will be credited when you invest
```

**File:** `src/contexts/AuthContext.tsx`

**Update:**
- After creating referral record, also send welcome email to the referred user
- Send notification to the referrer

---

### 3. Enhance Referral Stats Display with Withdrawal Eligibility
**File:** `src/components/dashboard/ReferralBonus.tsx`

**New Features:**
- Check if user has an active/completed investment
- Show "Withdrawable" vs "Pending" status for bonus
- Display clear message: "Invest to unlock your referral bonus"
- Add visual indicator for withdrawal eligibility

**UI Update:**
```text
+------------------------------------------------+
|  Refer & Earn                                   |
|  $500 per referral                              |
|-------------------------------------------------|
|  Your Referrals  |  Total Earned | Withdrawable |
|       3          |    $1,500     |    $1,000    |
|  (2 paid, 1 pending)              (1 pending)   |
|-------------------------------------------------|
|  ⚠️ Invest to withdraw referral bonus           |
|-------------------------------------------------|
|  [msktesla.net/auth?ref=ABC12345]        [Copy] |
|  [Share with Friends]                           |
+------------------------------------------------+
```

---

### 4. Add Withdrawal Eligibility Check
**File:** `src/components/dashboard/ReferralBonus.tsx`

**Logic:**
1. Fetch user's investments from database
2. Check if any investment has status 'active' or 'completed'
3. If no investment: Show warning "Invest to unlock your referral bonus withdrawal"
4. If invested: Show "Bonus ready to withdraw"

**Code:**
```tsx
// Check if user has invested
const { data: investments } = await supabase
  .from('investments')
  .select('status')
  .eq('user_id', user.id)
  .in('status', ['active', 'completed']);

const hasInvested = investments && investments.length > 0;
const withdrawableBonus = hasInvested ? stats.totalBonus : 0;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/ActionsPanel.tsx` | Fix ScrollArea with explicit overflow handling |
| `src/components/dashboard/ReferralBonus.tsx` | Add investment check, show withdrawal eligibility |
| `src/contexts/AuthContext.tsx` | Send referral email to BOTH referrer and referred user |
| `supabase/functions/send-referral-notification/index.ts` | Add `welcome_referred` email type for new users |

---

## Technical Implementation Details

### Edge Function Update (send-referral-notification)

Add new email type for referred users:
```typescript
interface ReferralNotificationRequest {
  referralEmail: string;
  referredUserName: string;
  referredUserEmail: string;
  type: 'signup' | 'investment_active' | 'welcome_referred';
  referrerName?: string;
  investmentAmount?: number;
}

// New case for referred user welcome email
if (type === 'welcome_referred') {
  subject = '🎁 Welcome! You\'ve Earned a $100 Referral Bonus';
  htmlContent = `...Welcome to Tesla Investment Platform! 
    You signed up using a referral code and earned a $100 bonus!
    Make your first investment to unlock your bonus...`;
  // Send to referredUserEmail instead of referralEmail
}
```

### AuthContext Update

```typescript
// After creating referral record, send emails to BOTH users
if (referrerUserId && referrerUserId !== data.user!.id) {
  // Create referral record
  await supabase.from('referrals').insert({...});
  
  // Send notification to REFERRER
  await supabase.functions.invoke('send-referral-notification', {
    body: { type: 'signup', referralEmail: referrerEmail, ... }
  });
  
  // Send welcome email to REFERRED user
  await supabase.functions.invoke('send-referral-notification', {
    body: { type: 'welcome_referred', referredUserEmail: email, ... }
  });
}
```

### ReferralBonus Component Update

```tsx
// Add state for investment status
const [hasInvested, setHasInvested] = useState(false);

// Fetch investment status
useEffect(() => {
  const checkInvestmentStatus = async () => {
    const { data } = await supabase
      .from('investments')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'completed'])
      .limit(1);
    
    setHasInvested(data && data.length > 0);
  };
  checkInvestmentStatus();
}, [user?.id]);

// Show warning if not invested
{!hasInvested && stats.totalBonus > 0 && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
    <p className="text-amber-500 text-sm">
      ⚠️ Invest to unlock your ${stats.totalBonus} referral bonus for withdrawal
    </p>
  </div>
)}
```

---

## Result After Changes

1. **Scrollable Rules** - Modal scrolls smoothly on all devices with touch support
2. **HTTPS Verified** - Links already use HTTPS (msktesla.net)
3. **Dual Emails** - Both referrer AND referred user receive email notifications
4. **Full Tracking** - Users see referral count, earnings, and withdrawal eligibility
5. **Investment Gate** - Referral bonus can only be withdrawn after making an investment

