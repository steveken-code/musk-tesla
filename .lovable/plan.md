
# Plan: Remove Tesla Stock Widget and Fix Number Display

## Overview
This plan addresses three issues:
1. Remove the Tesla Stock Performance card (StockMarketWidget) from the dashboard
2. Fix numbers overflowing their container boxes in the Investment Performance chart
3. Apply professional "smart" number formatting throughout (whole numbers display without decimals)

---

## Changes

### 1. Remove StockMarketWidget from Dashboard

**File:** `src/pages/Dashboard.tsx`

- Remove the import for `StockMarketWidget` (line 30)
- Remove the grid section containing `StockMarketWidget` (lines 1289-1292)
- Adjust the grid layout so `LiveTradingFeed` and `InvestmentProgressTracker` take the remaining space (change from 3-column grid to 2-column)

**Result:** Dashboard will show only LiveTradingFeed and InvestmentProgressTracker side-by-side, without the Tesla stock price widget.

---

### 2. Fix Metric Boxes in InvestmentChart

**File:** `src/components/InvestmentChart.tsx`

**Current Problem:** The metric boxes (Return, Profit, Invested, Status) have numbers that overflow their containers on smaller screens.

**Changes to lines 260-289:**
- Add `overflow-hidden` to prevent text spillover
- Use compact number formatting for large values (e.g., "$1,000" instead of "$1,000.00" for whole numbers)
- Apply smart formatting: show 2 decimals only when the value has cents
- Ensure text uses `truncate` class to prevent overflow

**Example format changes:**
- $5,000.00 → $5,000 (no decimals for whole amounts)
- $5,234.56 → $5,234.56 (keep decimals when present)
- For very large numbers: $125,000 → $125k (abbreviated to fit)

---

### 3. Apply Smart Number Formatting Throughout InvestmentChart

**Changes across the component:**

| Location | Current | New Format |
|----------|---------|------------|
| Portfolio Value card (line 244) | Always 2 decimals | Smart: decimals only if needed |
| Total Profit card (line 252) | Always 2 decimals | Smart: decimals only if needed |
| Metric boxes (Return, Profit, Invested) | Mixed formats | Consistent smart format with "k" abbreviation for large numbers |
| Legend stats (lines 404, 408) | Always 2 decimals | Smart: decimals only if needed |
| Profit Growth text (line 369) | toLocaleString | Smart format |

---

## Technical Details

### Smart Currency Format Logic
```text
function formatSmartValue(amount):
  if amount >= 1000000:
    return (amount / 1000000).toFixed(1) + "M"
  else if amount >= 10000:
    return (amount / 1000).toFixed(1) + "k"
  else if amount has no cents:
    return formatted without decimals
  else:
    return formatted with 2 decimals
```

### Grid Layout After Removal
Before: 3-column grid with StockMarketWidget | LiveTradingFeed | InvestmentProgressTracker
After: 2-column grid with LiveTradingFeed | InvestmentProgressTracker (each taking 50% width)

---

## Files Modified
1. `src/pages/Dashboard.tsx` - Remove widget and adjust layout
2. `src/components/InvestmentChart.tsx` - Fix overflow and number formatting

## No Changes Needed
- `src/components/StockMarketWidget.tsx` - Not deleted (may be used elsewhere in future)
- `src/lib/formatCurrency.ts` - Already has `formatSmartCurrency` function
