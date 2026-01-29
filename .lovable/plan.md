
# Referral Tracking & Rules Modal Enhancement Plan

## Overview
This plan implements referral tracking in the database so users can see how many friends they've referred and their bonus status. Additionally, we'll make the investment rules modal scrollable and fully responsive for mobile devices.

---

## Changes Summary

### 1. Database: Create Referrals Tracking Table
Create a new `referrals` table to track referral relationships and bonus status.

**Table Schema:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| referrer_user_id | uuid | The user who shared the referral link |
| referred_user_id | uuid | The user who signed up using the link |
| referral_code | text | The code used for signup |
| status | text | pending, eligible, paid |
| bonus_amount | numeric | $500 default for referrer |
| referred_bonus | numeric | $100 for referred user |
| created_at | timestamp | When referral was recorded |
| updated_at | timestamp | Last status update |

**RLS Policies:**
- Users can view their own referrals (where referrer_user_id = auth.uid())
- Admins can view and update all referrals
- Insert allowed for authenticated users

---

### 2. Make Rules Modal Scrollable and Responsive
**File:** `src/components/dashboard/ActionsPanel.tsx`

**Current Issue:** Rules modal may overflow on small screens without scrolling

**Changes:**
- Add `max-h-[80vh]` to DialogContent for height constraint
- Wrap rules list in `ScrollArea` component for smooth scrolling
- Add better mobile padding and spacing
- Improve touch-friendly sizing for rule items
- Add visual scroll indicator

**Key Code:**
```tsx
<DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
  <DialogHeader className="p-6 pb-2 shrink-0">
    {/* Header content */}
  </DialogHeader>
  
  <ScrollArea className="flex-1 px-6">
    <div className="space-y-3 pb-4">
      {/* Rules items */}
    </div>
  </ScrollArea>
  
  <div className="p-6 pt-4 border-t shrink-0">
    <Button>Start Investing Now</Button>
  </div>
</DialogContent>
```

---

### 3. Update Referral Component with Tracking Stats
**File:** `src/components/dashboard/ReferralBonus.tsx`

**New Features:**
- Fetch user's referral statistics from database
- Display total referrals count
- Show total bonus earned
- Show pending vs paid referrals
- Add visual progress indicator

**UI Enhancement:**
```text
+----------------------------------------+
|  Refer & Earn                          |
|  $500 per referral                     |
|----------------------------------------|
|  Your Referrals     |  Total Bonus     |
|       5             |    $2,500        |
|  (3 paid, 2 pending)|                  |
|----------------------------------------|
|  [Your unique referral link]    [Copy] |
|  [Share with Friends]                  |
+----------------------------------------+
```

---

### 4. Track Referrals on Signup
**File:** `src/contexts/AuthContext.tsx`

**Enhancement:**
When a user signs up with a valid referral code:
1. Create entry in `referrals` table
2. Link referrer_user_id (from code) to new user
3. Set initial status as "pending"
4. Admin can later mark as "eligible" then "paid"

---

## Technical Implementation Details

### Files to Create:
1. **Database Migration** - Create `referrals` table with RLS policies

### Files to Modify:
| File | Changes |
|------|---------|
| `src/components/dashboard/ActionsPanel.tsx` | Add ScrollArea, max-height, responsive padding |
| `src/components/dashboard/ReferralBonus.tsx` | Add referral stats display, fetch from database |
| `src/contexts/AuthContext.tsx` | Insert referral record on signup |

### Database SQL Migration:
```sql
-- Create referrals table for tracking referral bonuses
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  bonus_amount numeric NOT NULL DEFAULT 500,
  referred_bonus numeric NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update referral status
CREATE POLICY "Admins can update referrals"
  ON public.referrals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow insert for creating referral records
CREATE POLICY "Insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Update timestamp trigger
CREATE TRIGGER update_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Visual Design Specifications

### Rules Modal - Responsive Improvements:
- **Max height:** 85vh (leaves room for status bar on mobile)
- **Scroll area:** Smooth scrolling with visible scrollbar
- **Rule items:** Larger touch targets (min-h-[52px])
- **Padding:** Reduced on mobile (p-4 vs p-6)
- **Button:** Sticky at bottom with border separator

### Referral Stats Display:
```css
/* Stats grid */
.referral-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--electric-blue), 0.05);
  border-radius: 12px;
}

/* Stat item */
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--electric-blue);
}
```

---

## Result After Changes

1. **Scrollable Rules Modal** - Works smoothly on all screen sizes
2. **Referral Tracking** - Database stores all referral relationships
3. **Stats Display** - Users see their referral count and bonus earned
4. **Better Mobile UX** - Touch-friendly, properly sized elements
5. **Admin Control** - Admins can update referral payment status
