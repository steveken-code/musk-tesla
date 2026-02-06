

# Plan: Fix Minor Issues -- Footer & Testimonials Cleanup

## Changes

### 1. Footer Copyright Year (`src/components/Footer.tsx`)

**Line 162**: Change `© 2024` to `© 2025`

### 2. Footer Social Media Icons (`src/components/Footer.tsx`)

**Line 63**: Reduce container padding from `p-5` to `p-3`
**Line 66**: Reduce icon size from `w-9 h-9` to `w-5 h-5`

### 3. Remove Duplicate CEO Quote from Testimonials (`src/components/Testimonials.tsx`)

**Lines 188-225**: Remove the entire "CEO Quote Section" block (the Elon Musk quote card with photo). This quote already exists in the Vision section, so it's redundant here.

---

## UI/UX Assessment

The design is already professional and well-structured. Regarding your concern about darkness:

- **The dark theme is intentional and appropriate** for a financial/trading platform -- it matches industry standards (Robinhood, Coinbase, Bloomberg all use dark themes)
- **Contrast is good** -- white text on slate-800/900 backgrounds provides readable contrast
- **Color accents** (electric-blue headers, tesla-red CTAs, green growth badges, amber stars) break up the darkness effectively
- **Responsiveness** is solid -- grids collapse properly, carousels appear on mobile, text sizes scale with breakpoints

No darkness adjustments are needed -- the current palette is professional and industry-standard for investment platforms.

---

## Files Summary

| File | Action | Key Changes |
|------|--------|------------|
| `src/components/Footer.tsx` | UPDATE | Copyright 2024 to 2025, shrink social icons |
| `src/components/Testimonials.tsx` | UPDATE | Remove duplicate CEO quote section (lines 188-225) |

