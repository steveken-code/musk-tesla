

# Add Electric Blue Highlight to Investment Form

## Overview
When users click "Invest" or "Deposit" buttons, the "Make New Investment" card will display a prominent Tesla electric blue glow effect, making it easy to identify the investment form quickly.

## Current Behavior
- **ActionsPanel (sidebar)**: Clicking "Invest" scrolls to form AND triggers highlight
- **WelcomeCard (main balance card)**: Clicking "Invest" only scrolls - NO highlight

## Changes Required

### 1. Update WelcomeCard Component
Add the highlight trigger to the WelcomeCard's "Invest" button click handler.

**File:** `src/components/dashboard/WelcomeCard.tsx`

- Add a new prop `onHighlightInvest` callback
- Trigger this callback when user clicks "Invest"

### 2. Update Dashboard Integration
Pass the highlight function from Dashboard to WelcomeCard.

**File:** `src/pages/Dashboard.tsx`

- Modify the WelcomeCard's `onInvestClick` to also trigger `setHighlightInvestForm(true)`
- Add the timeout to remove highlight after 2.5 seconds (matching existing behavior)

## Visual Effect
The investment form will show:
- **Electric blue ring**: `ring-2 ring-electric-blue/40`
- **Blue border accent**: `border-electric-blue/30`
- **Soft blue glow**: `shadow-[0_0_30px_rgba(59,130,246,0.15)]`
- **Duration**: 2.5 seconds fade out

## Technical Details

### Dashboard.tsx Changes (Line ~1185)
```typescript
onInvestClick={() => {
  document.querySelector('#deposit')?.scrollIntoView({ behavior: 'smooth' });
  setHighlightInvestForm(true);
  setTimeout(() => setHighlightInvestForm(false), 2500);
}}
```

### No Changes Needed
- The investment form card already has the conditional highlight styling (line 1310)
- The `highlightInvestForm` state already exists (line 616)
- The electric blue color is already defined in Tailwind config

## Summary
| Component | Before | After |
|-----------|--------|-------|
| WelcomeCard "Invest" | Scroll only | Scroll + Blue Glow |
| ActionsPanel "Invest" | Scroll + Blue Glow | No change |
| Investment Form | Already styled | No change |

