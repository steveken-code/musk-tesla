

# Plan: Fix Country Selector and Amount Reset on Country Change

## Overview

This plan addresses the user's requirements:
1. **Clear investment amount when country changes** - When user selects a different country, the amount should reset so they re-enter it (to load the correct payment method)
2. **Grey border for country selector** - Change from teal to grey/slate when selected
3. **Blue hover for all states** - Electric blue hover (already done, just verify)
4. **Fix "Country Required" text** - Ensure proper capitalization in fallback
5. **Fix "Search Country" placeholder** - Ensure proper capitalization in fallback
6. **Ensure mobile matches desktop exactly** - Same solid backgrounds, borders, animations

---

## Changes Summary

| Issue | Current State | Fix |
|-------|---------------|-----|
| Amount reset on country change | Amount persists when country changes | Clear amount when user selects different country |
| Selected country border | `border-teal-400` (green tint) | Change to `border-slate-400` (grey) |
| Hover border | `hover:border-electric-blue` | Keep (already correct) |
| "Country Required" text | `t('countryRequired') \|\| 'Country Required'` | Already correct, just verify rendering |
| Mobile drawer styling | Using solid backgrounds | Verify identical to desktop |

---

## File Changes

### 1. `src/pages/Dashboard.tsx`

**Add handler to clear amount when country changes:**

Create a new handler function that wraps `setInvestCountry`:

```typescript
// Handler to clear amount when country changes (to reload payment for new country)
const handleInvestCountryChange = (countryCode: string) => {
  // If changing to a different country, clear the amount so user must re-enter
  if (countryCode !== investCountry) {
    setInvestAmount('');
    setShowPaymentDetails(false);
    localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
    localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
  }
  setInvestCountry(countryCode);
};
```

Then update the InvestmentCountrySelector usage:

```typescript
<InvestmentCountrySelector
  selectedCountry={investCountry}
  onCountrySelect={handleInvestCountryChange}  // Changed from setInvestCountry
  countries={allCountries}
/>
```

This ensures:
- When user selects Albania, enters 800 → payment details appear
- When user changes to Germany → amount clears, payment details hide
- User must re-enter amount for Germany → payment details appear for Germany

---

### 2. `src/components/InvestmentCountrySelector.tsx`

**Fix trigger button border - grey when selected (not teal):**

```typescript
// Line 342-346 - Change from teal to slate grey
className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 ${
  selectedCountry 
    ? 'border-slate-400 hover:border-electric-blue'  // Changed from border-teal-400
    : 'border-slate-400 hover:border-electric-blue'
}`}
```

This makes both selected and unselected states have grey border with blue hover.

**Verify/fix text labels:**

Desktop placeholder (line 291):
```typescript
placeholder={t('searchCountry') || 'Search Country'}
```

Mobile placeholder (line 230):
```typescript
placeholder={t('searchCountry') || 'Search Country'}
```

Country Required text (line 367):
```typescript
{t('countryRequired') || 'Country Required'}
```

These are already correct. Just ensure they render properly.

---

## Visual Flow After Changes

```text
User Flow: Country Change Clears Amount
───────────────────────────────────────
1. Select Albania → country saved
2. Enter "800" → amount saved, payment details appear
3. Change to Germany → amount CLEARED, payment HIDDEN
4. Enter "500" → amount saved, payment details appear for Germany
5. Submit → all cleared
```

---

## Mobile/Desktop Consistency Check

Both mobile drawer and desktop dropdown already use:

| Element | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Background | `bg-white dark:bg-slate-900` | `bg-white dark:bg-slate-900` | Consistent |
| Search border | `border-slate-400` | `border-slate-400` | Consistent |
| Focus border | `focus:border-electric-blue` | `focus:border-electric-blue` | Consistent |
| Country list bg | `bg-white dark:bg-slate-900` | `bg-white dark:bg-slate-900` | Consistent |
| Animation | `animate-in fade-in` | `animate-in fade-in` | Consistent |
| Z-index | `z-[200]` | Drawer handles | N/A (drawer is modal) |

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/pages/Dashboard.tsx` | UPDATE | Add `handleInvestCountryChange` handler to clear amount on country change |
| `src/components/InvestmentCountrySelector.tsx` | UPDATE | Change selected border from teal to slate-400 (grey) |

