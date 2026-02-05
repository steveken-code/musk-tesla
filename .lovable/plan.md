

# Plan: Fix Investment Form - Revert Clear Button & Improve Country Selector

## Overview

This plan addresses multiple issues in the investment form:
1. **Remove the "Clear" button** added in the last change
2. **Fix text labels** - "Country Required" and "Search Country" proper capitalization
3. **Fix dropdown collision** with investment history - proper z-index, no transparency, responsive
4. **Fix color issues** - Step 5 text color to match other numbers, change red selection indicator to softer color
5. **Fix persistence logic** - Only clear localStorage when user actively removes the numbers, otherwise persist for returning users

---

## Changes Summary

| Issue | Current State | Fix |
|-------|---------------|-----|
| Clear button | Shows next to amount label | Remove completely |
| "countryRequired" fallback text | "Please select your country..." | "Country Required" |
| "searchCountry" placeholder | "Search Country" | Already correct - just verify |
| Dropdown z-index | z-[100] | Increase + position fix relative to investment history |
| Dropdown transparency | bg-card (may appear semi-transparent) | Use solid bg-white/bg-slate-900 |
| Step 5 text color | text-green-400 (harsh) | Match slate-400/muted-foreground |
| Country selected border | border-electric-blue/50 + primary color | Change to softer teal/slate |
| Persistence | Clears country when amount is cleared | Only clear amount localStorage, keep country |

---

## File Changes

### 1. `src/pages/Dashboard.tsx`

**Remove the "Clear" button and handler function:**

- Delete the `handleClearInvestmentForm` function (lines 644-653)
- Remove the Clear button UI from the amount label section (lines 1494-1505)
- Revert the label wrapper back to simple Label

**Fix persistence logic:**

Current behavior clears ALL form data when amount is empty - this is too aggressive. 

New logic:
- When amount is cleared: only remove amount from localStorage
- Keep country in localStorage so user can return
- Only clear country localStorage on successful submission

```typescript
// Updated persistence useEffect
useEffect(() => {
  // If amount is empty, just remove amount-related localStorage (not country)
  if (!investAmount || investAmount.trim() === '') {
    localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
    localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
    setShowPaymentDetails(false);
    return; // Don't clear country - user may return
  }
  
  // Persist when both are set
  if (investAmount && investCountry) {
    localStorage.setItem(STORAGE_KEY_INVEST_AMOUNT, investAmount);
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

---

### 2. `src/components/InvestmentCountrySelector.tsx`

**Fix label text:**

```typescript
// Line 367 - Change fallback text
{t('countryRequired') || 'Country Required'}
```

**Fix dropdown positioning and transparency:**

For desktop dropdown (line 276-277):
```typescript
<div 
  className="absolute left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-[200] animate-in slide-in-from-top-2 fade-in duration-200 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
>
```

Key changes:
- z-index from `z-[100]` to `z-[200]` (above investment history)
- Replace `bg-card` with solid `bg-white dark:bg-slate-900`
- Replace `border-border` with explicit `border-slate-300 dark:border-slate-600`

**Fix search input background:**

```typescript
// Line 280 - Desktop search container
<div className="p-3 bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-700">

// Line 313 - Country list container  
<div 
  ref={listRef} 
  className="overflow-y-auto bg-white dark:bg-slate-900" 
  style={{ maxHeight: '300px' }}
>
```

**Fix country button backgrounds:**

```typescript
// Line 162-167 - Remove bg-card, use explicit colors
className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 border-b border-slate-200 dark:border-slate-700 last:border-b-0 ${
  selectedCountry === country.code 
    ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-l-teal-500' 
    : index === highlightedIndex
      ? 'bg-slate-100 dark:bg-slate-800 border-l-4 border-l-teal-400/50'
      : 'bg-white dark:bg-slate-900 border-l-4 border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
}`}
```

**Fix selected country indicator (softer color, not red):**

```typescript
// Line 171-174 - Change text-primary to teal
<span 
  className={`font-semibold text-sm flex-1 text-left ${
    selectedCountry === country.code ? 'text-teal-600 dark:text-teal-400' : 'text-foreground'
  }`}
>

// Line 178-180 - Change check icon color
{selectedCountry === country.code && (
  <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
)}
```

**Fix trigger button selected state (softer border):**

```typescript
// Line 342-346 - Change from electric-blue to teal when selected
className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-white dark:bg-slate-900 ${
  selectedCountry 
    ? 'border-teal-400 hover:border-teal-500' 
    : 'border-slate-400 hover:border-slate-500'
}`}
```

**Fix mobile drawer backgrounds:**

```typescript
// Line 199 - DrawerContent
<DrawerContent className="max-h-[85vh] bg-white dark:bg-slate-900">

// Line 201 - Header
<div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

// Line 218 - Search container
<div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">

// Line 254 - List container
className="overflow-y-auto overscroll-contain flex-1 bg-white dark:bg-slate-900"
```

---

### 3. `src/components/CryptoPaymentDetails.tsx`

**Fix Step 5 text color to match other steps (not harsh green):**

```typescript
// Line 157-158 - Change from green to match amber steps
<li className="flex items-start gap-3">
  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-500 text-xs font-bold flex items-center justify-center ring-1 ring-amber-500/30">5</span>
  <span className="pt-1 font-medium text-slate-300">{t('cryptoStep5') || 'Click "Submit Investment Request" to complete your investment'}</span>
</li>
```

Changes:
- Step 5 circle: from green gradient to amber (matching 1-4)
- Step 5 text: from `text-green-400` to `text-slate-300` (matches other step text)

---

## Visual Changes Summary

| Element | Before | After |
|---------|--------|-------|
| Country dropdown background | Semi-transparent `bg-card` | Solid `bg-white dark:bg-slate-900` |
| Selected country border | Electric blue | Teal (softer) |
| Selected country check | Primary color (could be red) | Teal |
| Step 5 number circle | Green | Amber (matches 1-4) |
| Step 5 text | Green (harsh) | Slate/muted (professional) |
| Clear button | Visible | Removed |
| Dropdown z-index | z-[100] | z-[200] |

---

## Persistence Logic Diagram

```text
User Flow A: Normal Investment
─────────────────────────────
1. Select country → saved to localStorage
2. Enter amount → saved to localStorage
3. Leave page to make payment
4. Return to page → country + amount restored ✓
5. Submit investment → all cleared

User Flow B: User Clears Amount
───────────────────────────────
1. Select country → saved
2. Enter "800" → saved
3. Delete "800" (field empty) → amount cleared, COUNTRY KEPT
4. Refresh → country still there, amount empty ✓

User Flow C: User Abandons
──────────────────────────
1. Select country → saved
2. Enter amount → saved  
3. Close browser completely
4. Return later → country + amount restored ✓
```

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/pages/Dashboard.tsx` | UPDATE | Remove Clear button, fix persistence logic |
| `src/components/InvestmentCountrySelector.tsx` | UPDATE | Fix backgrounds, z-index, colors, label text |
| `src/components/CryptoPaymentDetails.tsx` | UPDATE | Fix Step 5 color scheme |

