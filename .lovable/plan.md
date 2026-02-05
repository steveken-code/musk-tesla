
# Plan: Add Visual "Clear Form" Button to Investment Form

## Overview

Add a clear/reset button next to the investment amount input that allows users to explicitly clear the entire form (country, amount, and payment details). This provides an intuitive way to reset the form without manually deleting the amount.

---

## Design Approach

The "Clear Form" button will:
- Appear **only when there's data to clear** (country selected OR amount entered)
- Use the existing `X` icon (already imported) for visual clarity
- Have subtle styling that doesn't compete with the primary "Submit" button
- Clear all form state AND localStorage on click

---

## Button Placement Options

| Option | Placement | Pros | Cons |
|--------|-----------|------|------|
| **A (Recommended)** | Next to the amount label | Visible when typing, doesn't clutter submit area | Requires amount to be visible |
| B | Below submit button | Always accessible | May encourage accidental clicks |
| C | Inside amount input (right side) | Compact, intuitive | Clutters input if already showing preview |

**Recommendation:** Option A - Place a small "Clear" link/button next to the "Investment Amount" label, styled subtly.

---

## Visual Design

```text
┌─────────────────────────────────────────────────────────────┐
│ Investment Amount                    [Clear Form] (subtle)  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  800                                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Investment Amount: 800 USDT                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Button Styling:**
- Text: "Clear Form" or just "Clear"
- Icon: `X` icon (already imported)
- Color: Muted/subtle (e.g., `text-muted-foreground hover:text-destructive`)
- Size: Small (`text-xs`)

---

## Changes Required

### File: `src/pages/Dashboard.tsx`

#### Change 1: Add Clear Form Handler Function

Add a new function after the existing form handlers (around line 640):

```typescript
// Function to clear the entire investment form
const handleClearInvestmentForm = () => {
  setInvestAmount('');
  setInvestCountry('');
  setShowPaymentDetails(false);
  localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
  localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
  localStorage.removeItem('tesla_invest_country');
  toast.info('Form cleared');
};
```

#### Change 2: Add Clear Button to Amount Input Section

Update the amount input label section (around line 1481-1482) to include the clear button:

**Current:**
```tsx
<div className="space-y-1.5 sm:space-y-2 animate-fade-in">
  <Label htmlFor="amount" className="text-xs sm:text-sm">{t('investmentAmount')}</Label>
```

**Updated:**
```tsx
<div className="space-y-1.5 sm:space-y-2 animate-fade-in">
  <div className="flex items-center justify-between">
    <Label htmlFor="amount" className="text-xs sm:text-sm">{t('investmentAmount')}</Label>
    {(investAmount || investCountry) && (
      <button
        type="button"
        onClick={handleClearInvestmentForm}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="w-3 h-3" />
        <span>Clear</span>
      </button>
    )}
  </div>
```

---

## Alternative: Clear Button Always Visible (When Country Selected)

If you want the clear button visible even before the amount is entered:

**Placement:** Add to the section header or country selector row:

```tsx
{/* Country Selector with Clear Option */}
<div className="relative">
  <InvestmentCountrySelector
    selectedCountry={investCountry}
    onCountrySelect={setInvestCountry}
    countries={allCountries}
  />
  {investCountry && (
    <button
      type="button"
      onClick={handleClearInvestmentForm}
      className="absolute top-0 right-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
    >
      <X className="w-3 h-3" />
      <span>Clear</span>
    </button>
  )}
</div>
```

---

## Technical Details

### State Reset Flow:

```text
User clicks "Clear" button
        ↓
handleClearInvestmentForm() called
        ↓
┌────────────────────────────────┐
│ setInvestAmount('')            │
│ setInvestCountry('')           │
│ setShowPaymentDetails(false)   │
└────────────────────────────────┘
        ↓
localStorage keys removed:
- STORAGE_KEY_INVEST_AMOUNT
- STORAGE_KEY_SHOW_PAYMENT  
- 'tesla_invest_country'
        ↓
Toast notification: "Form cleared"
        ↓
UI updates: Country selector + amount input reset to empty
```

---

## Visual Behavior

| Form State | Clear Button Visible? |
|------------|----------------------|
| No country, no amount | No |
| Country selected, no amount | Yes |
| Country selected, amount entered | Yes |
| Payment details showing | Yes |
| After clicking Clear | No (form empty) |

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/Dashboard.tsx` | UPDATE | Add `handleClearInvestmentForm` function, add Clear button to form UI |

---

## Dependencies

- `X` icon already imported from `lucide-react`
- `toast` from `sonner` already available
- All localStorage keys already defined as constants
