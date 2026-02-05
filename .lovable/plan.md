

# Plan: Fix Investment Form Issues - Border Color, Labels & Persistence

## Overview

Address the remaining issues in the investment form after testing:

1. **Change hover border to electric-blue** - Both when selected and unselected
2. **Fix "Country Required" label** - Ensure proper fallback text appears
3. **Fix "Search Country" placeholder** - Verify proper fallback
4. **Fix payment details persistence** - Payment details showing incorrectly after refresh when amount is empty

---

## Issues Found During Testing

| Issue | Current State | Required Fix |
|-------|---------------|--------------|
| Selected country hover border | `hover:border-teal-500` (green) | Change to `hover:border-electric-blue` (blue) |
| Selected country border | `border-teal-400` | Keep teal OR change to electric-blue |
| "countryRequired" fallback | May show key instead of fallback | Ensure fallback "Country Required" works |
| Payment persistence after refresh | Shows payment details even when amount is cleared | Fix initialization logic |

---

## File Changes

### 1. `src/components/InvestmentCountrySelector.tsx`

**Fix trigger button border colors - use electric-blue for hover on all states:**

```typescript
// Line 342-346 - Change hover to electric-blue for consistency
className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 ${
  selectedCountry 
    ? 'border-teal-400 hover:border-electric-blue' 
    : 'border-slate-400 hover:border-electric-blue'
}`}
```

This ensures:
- When **no country selected**: grey border, blue on hover
- When **country selected**: teal border (soft confirmation), blue on hover

**Alternative (if user wants all blue):**

```typescript
className={`... ${
  selectedCountry 
    ? 'border-electric-blue hover:border-electric-blue/80' 
    : 'border-slate-400 hover:border-electric-blue'
}`}
```

---

### 2. `src/pages/Dashboard.tsx`

**Fix payment details initialization to respect empty amount:**

The current initialization at lines 590-595 reads from localStorage, but if the user cleared the amount previously, the payment flag might still be set. We need to add a check:

```typescript
// Line 590-595 - Add validation that amount exists
const [showPaymentDetails, setShowPaymentDetails] = useState(() => {
  if (typeof window !== 'undefined') {
    const savedAmount = localStorage.getItem(STORAGE_KEY_INVEST_AMOUNT);
    const savedShowPayment = localStorage.getItem(STORAGE_KEY_SHOW_PAYMENT);
    // Only show payment if we have a valid saved amount AND the flag is true
    if (savedAmount && parseFloat(savedAmount) >= 100 && savedShowPayment === 'true') {
      return true;
    }
  }
  return false;
});
```

This ensures payment details only show on page load if:
- There IS a saved amount in localStorage
- The amount is >= 100
- The show payment flag is true

---

## Visual Summary

| Element | Before | After |
|---------|--------|-------|
| Unselected country hover | `hover:border-electric-blue/60` | `hover:border-electric-blue` (full opacity) |
| Selected country hover | `hover:border-teal-500` | `hover:border-electric-blue` |
| Selected country border | `border-teal-400` | Keep (soft confirmation color) |
| Payment on refresh (no amount) | Shows payment details | Hidden (correct) |

---

## Mobile & Responsiveness Notes

From testing, the mobile drawer:
- Uses solid `bg-white dark:bg-slate-900` backgrounds ✓
- Has proper z-index and animations ✓
- Search input has "Search Country" placeholder ✓
- Drawer scrolls properly within content area ✓

The dropdown on desktop:
- Has `z-[200]` to stay above investment history ✓
- Solid backgrounds prevent transparency issues ✓
- Proper border colors and animations ✓

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/InvestmentCountrySelector.tsx` | UPDATE | Change hover border from teal to electric-blue |
| `src/pages/Dashboard.tsx` | UPDATE | Fix showPaymentDetails initialization to validate saved amount |

