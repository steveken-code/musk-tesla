

# Plan: Investment Form Persistence & Professional Icon Colors

## Overview

This plan addresses two key improvements:
1. **Form Persistence**: Make the investment form persist country selection, amount, and payment details on page refresh (unless canceled)
2. **Professional Icon Colors**: Change specific icons from red to Electric Blue for a more professional, inviting appearance

---

## Current Issues

### Issue 1: Form State Resets on Refresh

| Current Behavior | Expected Behavior |
|-----------------|-------------------|
| Country selection resets on page refresh | Country should persist |
| Amount input resets on refresh | Amount should persist if entered |
| Payment details disappear on refresh | Payment details should remain if amount was valid |
| All state is lost immediately | State only clears when user clears amount or submits |

### Issue 2: Red Icons Create "Fear" Feeling

| Component | Current Icon Color | Proposed Color | Reason |
|-----------|-------------------|----------------|--------|
| "Make New Investment" (DollarSign) | Tesla Red (primary) | Electric Blue | Investment is positive action, not warning |
| "Make Your Move" section header | Tesla Red (primary) | Electric Blue | Section about growth, should feel inviting |
| "Total Invested" stat card | Tesla Red (primary) | Tesla Red | OK - represents Tesla brand |
| "Investment Progress" header | Tesla Red (primary) | Electric Blue | Progress tracking is informational |
| "Performance Overview" header | Tesla Red (primary) | Electric Blue | Analytics/data, should be neutral blue |
| "Real-Time Activity" header | Tesla Red (primary) | Electric Blue | Live feed, blue feels modern/tech |

---

## Icon Color Philosophy

**Electric Blue should be used for:**
- Informational content (charts, analytics, progress)
- Positive action CTAs (investing, deposits)
- Technical/data displays
- Modern, trustworthy appearance

**Tesla Red should be reserved for:**
- Brand identity elements (logo, main branding)
- High-priority alerts or urgent actions
- Key Tesla-brand focal points (like "Get Started" hero button)

---

## Changes Required

### File 1: `src/pages/Dashboard.tsx`

#### Change 1.1: Add localStorage Persistence for Country

Add new storage key and persist country selection:

```typescript
// Add new storage key
const STORAGE_KEY_INVEST_COUNTRY = 'tesla_invest_country';

// In state initialization, read from localStorage
const [investCountry, setInvestCountry] = useState(() => {
  return localStorage.getItem(STORAGE_KEY_INVEST_COUNTRY) || '';
});

// Add effect to persist country changes
useEffect(() => {
  if (investCountry) {
    localStorage.setItem(STORAGE_KEY_INVEST_COUNTRY, investCountry);
  } else {
    localStorage.removeItem(STORAGE_KEY_INVEST_COUNTRY);
  }
}, [investCountry]);
```

#### Change 1.2: Fix Amount Persistence to Trigger Payment Details

Currently `showPaymentDetails` is not properly restored on load. Add logic to restore payment details visibility based on persisted amount:

```typescript
// On component mount, check if we should show payment details
useEffect(() => {
  const savedAmount = localStorage.getItem(STORAGE_KEY_INVEST_AMOUNT);
  const savedShowPayment = localStorage.getItem(STORAGE_KEY_SHOW_PAYMENT);
  const savedCountry = localStorage.getItem(STORAGE_KEY_INVEST_COUNTRY);
  
  if (savedAmount && parseFloat(savedAmount) >= 100 && savedCountry) {
    setInvestAmount(savedAmount);
    setInvestCountry(savedCountry);
    if (savedShowPayment === 'true') {
      setShowPaymentDetails(true);
    }
  }
}, []);
```

#### Change 1.3: Clear All Persisted Data Only on Cancel or Submit

Update the cancel/clear behavior:

```typescript
// Add a function to clear the investment form
const handleClearInvestmentForm = () => {
  setInvestAmount('');
  setInvestCountry('');
  setShowPaymentDetails(false);
  localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
  localStorage.removeItem(STORAGE_KEY_INVEST_COUNTRY);
  localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
};
```

Already clears on successful submit (verified in `handleInvest`).

#### Change 1.4: Update "Make New Investment" Icon Color

Change from `text-primary` (Tesla Red) to `text-electric-blue`:

**Current (Line ~1439-1441):**
```tsx
<div className="p-1.5 rounded-lg bg-primary/10">
  <DollarSign className="w-4 h-4 text-primary" />
</div>
```

**Updated:**
```tsx
<div className="p-1.5 rounded-lg bg-electric-blue/10">
  <DollarSign className="w-4 h-4 text-electric-blue" />
</div>
```

---

### File 2: `src/components/dashboard/DashboardSectionHeader.tsx`

#### Change 2.1: Add Color Variant Support

Update component to support different icon colors:

```typescript
interface DashboardSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  color?: 'primary' | 'blue' | 'green'; // NEW: color variant
}

const DashboardSectionHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  action,
  color = 'blue' // Default to blue (Electric Blue)
}: DashboardSectionHeaderProps) => {
  
  const colorClasses = {
    primary: {
      gradient: 'from-primary/20 to-electric-blue/10',
      icon: 'text-primary',
      line: 'from-primary via-electric-blue to-transparent'
    },
    blue: {
      gradient: 'from-electric-blue/20 to-blue-500/10',
      icon: 'text-electric-blue',
      line: 'from-electric-blue via-blue-400 to-transparent'
    },
    green: {
      gradient: 'from-green-500/20 to-emerald-500/10',
      icon: 'text-green-500',
      line: 'from-green-500 via-emerald-400 to-transparent'
    }
  };
  
  const colors = colorClasses[color];
  // Apply to icon wrapper and decorative line
}
```

---

### File 3: `src/pages/Dashboard.tsx` (Section Headers)

#### Change 3.1: Update Section Header Colors

Update all section header usages to use appropriate colors:

```tsx
// Real-Time Activity - Blue (tech/modern)
<DashboardSectionHeader 
  title="Real-Time Activity" 
  subtitle="Live trading updates and investment progress"
  icon={Activity}
  color="blue"
/>

// Performance Overview - Blue (analytics/data)
<DashboardSectionHeader 
  title="Performance Overview" 
  subtitle="Your investment portfolio analytics"
  icon={PieChart}
  color="blue"
/>

// Make Your Move - Blue (positive action)
<DashboardSectionHeader 
  title="Make Your Move" 
  subtitle="Invest or manage your portfolio"
  icon={TrendingUp}
  color="blue"
/>
```

---

### File 4: `src/components/InvestmentProgressTracker.tsx`

#### Change 4.1: Update Header Icon Color

**Current (Line ~134-137):**
```tsx
<div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-electric-blue/10 border border-primary/20">
  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
</div>
```

**Updated:**
```tsx
<div className="p-2 rounded-xl bg-gradient-to-br from-electric-blue/20 to-blue-500/10 border border-electric-blue/20">
  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
</div>
```

---

### File 5: `src/components/LiveTradingFeed.tsx`

#### Change 5.1: Update Header Icon Color

**Current (Line ~178-180):**
```tsx
<div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 to-electric-blue/10 border border-primary/20">
  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
```

**Updated:**
```tsx
<div className="relative p-2 rounded-xl bg-gradient-to-br from-electric-blue/20 to-blue-500/10 border border-electric-blue/20">
  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
```

---

## Summary of Icon Color Changes

| Component | Location | Old Color | New Color |
|-----------|----------|-----------|-----------|
| Make New Investment header | Dashboard.tsx | `text-primary` | `text-electric-blue` |
| DashboardSectionHeader (all) | DashboardSectionHeader.tsx | `text-primary` | `text-electric-blue` (default) |
| Investment Progress header | InvestmentProgressTracker.tsx | `text-primary` | `text-electric-blue` |
| Live Trading Feed header | LiveTradingFeed.tsx | `text-primary` | `text-electric-blue` |

---

## Technical Details: Form Persistence Logic

### On Page Load:
```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Check localStorage for:                                  │
│    - STORAGE_KEY_INVEST_COUNTRY (country code)              │
│    - STORAGE_KEY_INVEST_AMOUNT (amount string)              │
│    - STORAGE_KEY_SHOW_PAYMENT (boolean string)              │
│                                                             │
│ 2. If country + amount >= 100 exist:                        │
│    - Restore investCountry state                            │
│    - Restore investAmount state                             │
│    - Restore showPaymentDetails state                       │
│    - Payment details component renders with saved values    │
└─────────────────────────────────────────────────────────────┘
```

### On User Actions:
```text
┌─────────────────────────────────┐
│ User selects country            │──▶ Save to localStorage
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ User enters amount >= $100      │──▶ Save amount + show payment
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ User clears amount or country   │──▶ Hide payment, DON'T clear storage yet
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ User submits investment         │──▶ Clear ALL localStorage
└─────────────────────────────────┘
```

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/Dashboard.tsx` | UPDATE | Add country persistence, fix payment restoration, update icon colors |
| `src/components/dashboard/DashboardSectionHeader.tsx` | UPDATE | Add color variant prop, default to Electric Blue |
| `src/components/InvestmentProgressTracker.tsx` | UPDATE | Change header icon to Electric Blue |
| `src/components/LiveTradingFeed.tsx` | UPDATE | Change header icon to Electric Blue |

