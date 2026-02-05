
# Plan: Fix Investment Form Persistence Bug

## Overview

Fix the bug where clearing the investment amount input and refreshing the page still shows the old value. The form should properly clear localStorage when the user manually wipes the amount field.

---

## Root Cause Analysis

| Current Behavior | Expected Behavior |
|-----------------|-------------------|
| User types "800" → saved to localStorage | Same - correct |
| User clears amount → localStorage unchanged | Should clear localStorage |
| User refreshes → sees "800" again | Should see empty field |

The bug is in the `useEffect` at lines 643-655:

```typescript
useEffect(() => {
  if (investAmount && investCountry) {  // ← Only runs when BOTH are truthy
    localStorage.setItem(STORAGE_KEY_INVEST_AMOUNT, investAmount);
    // ...
  }
}, [investAmount, investCountry]);
```

When `investAmount` becomes empty string, the condition fails and localStorage is never cleared.

---

## Changes Required

### File: `src/pages/Dashboard.tsx`

#### Change 1: Update the Amount Persistence useEffect

Replace the current useEffect (lines 643-655) with logic that also clears localStorage when amount is emptied:

```typescript
// Persist investment amount to localStorage
useEffect(() => {
  // If user has cleared the amount, clear all investment form data from localStorage
  if (!investAmount || investAmount.trim() === '') {
    localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
    localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
    setShowPaymentDetails(false);
    return;
  }
  
  // Only persist if both country and amount are set
  if (investAmount && investCountry) {
    localStorage.setItem(STORAGE_KEY_INVEST_AMOUNT, investAmount);
    // Show payment details if amount is valid (>= 100) and country is selected
    if (parseFloat(investAmount) >= 100) {
      localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'true');
      setShowPaymentDetails(true);
    } else {
      localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'false');
      setShowPaymentDetails(false);
    }
  }
}, [investAmount, investCountry]);
```

#### Change 2: Also Clear Country When Amount is Cleared (Optional)

For a cleaner UX, when the user clears the amount, we should also clear the country from localStorage so the whole form resets:

```typescript
useEffect(() => {
  // If user has cleared the amount, clear all investment form data
  if (!investAmount || investAmount.trim() === '') {
    localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
    localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
    localStorage.removeItem('tesla_invest_country');  // Also clear country
    setShowPaymentDetails(false);
    return;
  }
  
  // ... rest of persistence logic
}, [investAmount, investCountry]);
```

---

## Behavior After Fix

| User Action | localStorage | On Refresh |
|-------------|--------------|------------|
| Type "800" with country selected | Saved | Shows 800 + country + payment |
| Clear the amount field | Cleared | Shows empty form |
| Type "50" (below minimum) | Saved amount, no payment flag | Shows 50, no payment details |
| Submit investment | Cleared | Shows empty form |

---

## Technical Flow

```text
User clears amount input
        ↓
onChange fires: setInvestAmount('')
        ↓
useEffect detects investAmount is empty
        ↓
localStorage.removeItem() for all keys
        ↓
User refreshes page
        ↓
useState initializer finds no localStorage value
        ↓
Form shows empty state ✓
```

---

## Files Summary

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Update the investment amount persistence useEffect to handle clearing |
