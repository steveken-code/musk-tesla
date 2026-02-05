

# Plan: Improve Dashboard Responsiveness for Balance & Action Buttons

## Overview

Enhance the WelcomeCard component to ensure the balance display and Invest/Withdraw buttons are professionally positioned and responsive across all screen sizes (mobile, tablet, and desktop).

---

## Issues Identified

| Issue | Current Behavior | Desired Behavior |
|-------|------------------|------------------|
| **Button width on mobile** | `max-w-[180px]` restricts buttons, causing them to look cramped when stacked | Full-width buttons on extra-small screens for better touch targets |
| **Button centering** | Buttons centered but constrained by max-width | On mobile (stacked): full width. On desktop (row): auto-width, centered |
| **Weekly change layout** | Always shows below balance on mobile | Better integration with the balance row |
| **Button container alignment** | `justify-center` with individual button centering | Use `items-center` for proper vertical stacking on mobile |

---

## Changes

### File: `src/components/dashboard/WelcomeCard.tsx`

**1. Update Button Container Layout (line 89)**

Change from:
```typescript
<div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 justify-center">
```

Change to:
```typescript
<div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 items-center xs:justify-center">
```

This ensures:
- On mobile (stacked vertically): buttons are centered with `items-center`
- On larger screens (row layout): buttons are centered with `xs:justify-center`

**2. Update Invest Button (line 90-97)**

Change from:
```typescript
className="h-11 sm:h-12 px-6 sm:px-8 max-w-[180px] w-full xs:w-auto bg-white/20 ..."
```

Change to:
```typescript
className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white/20 ..."
```

This ensures:
- On extra-small screens: button is full width for better touch targets
- On larger screens: button has a minimum width but grows naturally

**3. Update Withdraw Button (line 98-106)**

Change from:
```typescript
className="h-11 sm:h-12 px-6 sm:px-8 max-w-[180px] w-full xs:w-auto bg-white ..."
```

Change to:
```typescript
className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white ..."
```

Same rationale as Invest button.

**4. Add maximum width container for button row**

Wrap the button container to prevent buttons from stretching too wide on mobile while maintaining full width:

```typescript
<div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 items-center xs:justify-center w-full max-w-sm xs:max-w-none mx-auto">
```

This adds:
- `w-full max-w-sm xs:max-w-none mx-auto` - limits max width on mobile for aesthetic balance, removes limit on larger screens

---

## Visual Summary

| Screen Size | Balance | Buttons Layout |
|-------------|---------|----------------|
| **Extra Small (< 475px)** | 2xl font, full width | Stacked vertically, full width, centered, max-w-sm container |
| **Small (475-640px)** | 3xl font | Side by side, auto width, min-w-[160px] |
| **Medium (640-768px)** | 4xl font | Side by side, larger padding |
| **Large (768px+)** | 5xl font | Side by side, generous spacing |

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/dashboard/WelcomeCard.tsx` | UPDATE | Remove max-width constraint, add min-width for desktop, improve mobile stacking with container constraints |

