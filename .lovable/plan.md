

# Plan: Unify Border Colors Across Investment Form

## Overview

Make the investment form inputs consistent by aligning the Investment Amount input borders with the Country Selector.

---

## Current Inconsistency

| Field | Default Border | Focus/Hover Border |
|-------|----------------|-------------------|
| Country Selector | `border-slate-400` | `hover:border-electric-blue` |
| Investment Amount | `border-slate-300` | `focus:border-sky-500` |

This creates a visual mismatch - one is lighter grey with sky-blue focus, the other is darker grey with electric-blue focus.

---

## Changes

### File: `src/pages/Dashboard.tsx`

**Update Investment Amount input (line 1509):**

Current:
```typescript
className="bg-white border-slate-300 ... focus:border-sky-500 focus:ring-sky-500/20 ..."
```

Change to:
```typescript
className="bg-white border-slate-400 ... focus:border-electric-blue focus:ring-electric-blue/20 ..."
```

This makes the amount input match the country selector:
- Default: `border-slate-400` (same grey)
- Focus: `focus:border-electric-blue` (same blue)
- Ring: `focus:ring-electric-blue/20` (matching glow)

---

## Visual Summary After Fix

| Field | Default Border | Focus/Hover |
|-------|----------------|-------------|
| Country Selector | `border-slate-400` (grey) | `hover:border-electric-blue` |
| Investment Amount | `border-slate-400` (grey) | `focus:border-electric-blue` |

Both inputs now have:
- Same grey border color
- Same electric-blue accent on interaction
- Professional, unified appearance

---

## Mobile/Desktop Consistency Status

After reviewing the code, the mobile and desktop dropdowns are already fully consistent:

| Element | Status |
|---------|--------|
| Background colors | ✅ Identical (`bg-white dark:bg-slate-900`) |
| Text colors | ✅ Identical (`text-foreground`, `text-muted-foreground`) |
| Border colors | ✅ Identical (`border-slate-400`) |
| Focus states | ✅ Identical (`focus:border-electric-blue`) |
| Animations | ✅ Both use `animate-in fade-in` |
| Country button styling | ✅ Shared `CountryButton` component |

The mobile drawer and desktop dropdown are already using the exact same styling - no changes needed there.

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/pages/Dashboard.tsx` | UPDATE | Change Investment Amount input border from `slate-300`/`sky-500` to `slate-400`/`electric-blue` |

