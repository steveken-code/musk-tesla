

# Fix Admin Search Input Visibility & Investment Country Selector Placeholder

## Issues Identified

### 1. Admin Portal Search Input - Low Visibility
The search inputs in the Admin portal (Investments and Withdrawals tabs) use:
```tsx
className="pl-10 bg-slate-700/50 border-slate-600 [color:#ffffff_!important] placeholder:text-slate-400 focus:border-green-500"
```

**Problem:** The `bg-slate-700/50` has 50% opacity which reduces visibility. The input text should be more prominent for admin use.

### 2. InvestmentCountrySelector - Already Fixed
The placeholder was already updated in the last edit to use `'Search Country'` as the fallback text. However, I will verify the text is properly capitalized and consistent.

---

## Implementation Plan

### Step 1: Fix Admin Search Input Styling
**File:** `src/pages/Admin.tsx`

**Changes at Lines 1908 and 2096:**

Replace the current styling:
```tsx
className="pl-10 bg-slate-700/50 border-slate-600 [color:#ffffff_!important] placeholder:text-slate-400 focus:border-green-500"
```

With improved visibility styling:
```tsx
className="pl-10 bg-white border-slate-300 text-black font-semibold placeholder:text-slate-500 focus:border-green-500 opacity-100"
```

This will:
- Use **white background** (`bg-white`) for maximum contrast
- Use **dark text** (`text-black`) that is clearly visible
- Set **opacity to 1** (full opacity)
- Use **bolder font** (`font-semibold`) for better readability
- Update placeholder to slightly darker gray for visibility

### Step 2: Verify Country Selector Placeholder
**File:** `src/components/InvestmentCountrySelector.tsx`

The placeholder is already correctly set to `'Search Country'` at lines 230 and 291. No changes needed here.

---

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/pages/Admin.tsx` | 1908 | Update search input styling for investments tab |
| `src/pages/Admin.tsx` | 2096 | Update search input styling for withdrawals tab |

---

## Expected Result

### Admin Search Input (Before → After)
- **Background:** Semi-transparent slate → Solid white
- **Text Color:** White → Black (bold)
- **Opacity:** 50% → 100%
- **Visibility:** Poor in dark theme → Excellent contrast

The admin search inputs will now be clearly visible with white backgrounds and dark text, matching the admin UI visibility standards established in the project memory.

