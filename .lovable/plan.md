

# Investment Rules Modal Scroll Fix & Referral Tracking Enhancement

## Overview
Improve the Investment Rules modal scrolling reliability on mobile devices and ensure the referral tracking displays properly with all stats visible.

---

## Current Issues Identified

### 1. Rules Modal Scrolling
**File:** `src/components/dashboard/ActionsPanel.tsx`

The modal currently uses:
- `overflow-y-auto` on a plain `div` (line 128-131)
- `WebkitOverflowScrolling: 'touch'` inline style

**Problems:**
- The `ScrollArea` component is imported but not being used
- Some mobile browsers may still have scrolling issues with flex containers
- Need to add `min-h-0` to the flex container to ensure proper overflow behavior

### 2. Referral Stats Already Working
The `ReferralBonus.tsx` component already has comprehensive tracking:
- Shows total referrals, paid referrals, pending referrals
- Displays total earned vs withdrawable amounts
- Shows investment requirement warning
- All functionality is properly implemented

---

## Proposed Changes

### Fix #1: Improve Modal Scroll Reliability
**File:** `src/components/dashboard/ActionsPanel.tsx`

**Changes:**
1. Add `min-h-0` to the scrollable container (critical for flex overflow)
2. Use `ScrollArea` component instead of plain div for better cross-browser support
3. Add proper height constraints

```tsx
// Before (lines 128-131)
<div 
  className="flex-1 overflow-y-auto px-4 sm:px-6 overscroll-contain"
  style={{ WebkitOverflowScrolling: 'touch' }}
>

// After - Use ScrollArea for better mobile support
<ScrollArea className="flex-1 min-h-0">
  <div className="px-4 sm:px-6">
    <div className="space-y-3 py-4">
      {/* Rules content */}
    </div>
  </div>
</ScrollArea>
```

### Why min-h-0 is Critical
In flexbox layouts, the default `min-height: auto` prevents flex children from shrinking below their content height. Adding `min-h-0` allows the scrollable area to properly shrink and enable scrolling.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/ActionsPanel.tsx` | Use ScrollArea with min-h-0 for reliable scrolling |

---

## Technical Implementation

```tsx
// ActionsPanel.tsx - Updated Modal Structure (lines 111-166)

<Dialog open={showRules} onOpenChange={setShowRules}>
  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 bg-card border-border">
    {/* Fixed Header */}
    <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0 border-b border-border/30">
      <DialogTitle className="flex items-center gap-2 text-foreground">
        <div className="p-1.5 rounded-lg bg-electric-blue/10">
          <CheckCircle className="w-5 h-5 text-electric-blue" />
        </div>
        Investment Rules
      </DialogTitle>
      <DialogDescription className="text-muted-foreground text-sm">
        Follow these guidelines for a successful investment experience.
      </DialogDescription>
    </DialogHeader>
    
    {/* Scrollable Content - Use ScrollArea with min-h-0 */}
    <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 sm:px-6">
        <div className="space-y-3 py-4">
          {investmentRules.map((rule, index) => (
            <motion.div
              key={rule.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/30"
            >
              <div className="p-1.5 sm:p-2 rounded-md bg-electric-blue/10 shrink-0">
                <rule.icon className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{rule.title}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{rule.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollArea>
    
    {/* Fixed Footer */}
    <div className="p-4 sm:p-6 pt-4 border-t border-border/50 shrink-0">
      <Button 
        onClick={() => {
          setShowRules(false);
          onInvestClick();
        }}
        className="w-full h-11 sm:h-12 bg-gradient-to-r from-electric-blue to-electric-blue/80"
      >
        Start Investing Now
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## Referral Tracking (Already Implemented)

The `ReferralBonus.tsx` component already shows:

| Stat | Display |
|------|---------|
| Total Referrals | Number with Users icon |
| Total Earned | Green amount (paid + pending) |
| Withdrawable | Amber amount (only if invested) |
| Status Breakdown | "X paid, Y pending" labels |
| Investment Warning | Yellow alert when not invested |
| Ready to Withdraw | Green alert when invested |

No changes needed for referral tracking - it's already professional and complete.

---

## Result After Changes

1. **Reliable Scrolling**: Modal will scroll smoothly on all mobile devices using the Radix ScrollArea component
2. **Professional Layout**: Fixed header + scrollable content + fixed footer structure
3. **Referral Tracking**: Already shows all stats (referrals, earnings, withdrawable amounts)
4. **Investment Gate**: Already displays warning about investing to unlock withdrawals

