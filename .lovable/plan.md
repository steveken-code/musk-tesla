

# Plan: Update Investor Count Text

## Issue
The Hero section says "Join thousands of investors" but the platform reports 148,500+ users and presents itself as having millions of investors. The copy is inconsistent with the platform's social proof messaging.

## Change

### File: `src/components/Hero.tsx`

Find and update the subtitle/description text:

```
"Join thousands of investors capitalizing on Tesla's revolutionary growth."
```

Change to:

```
"Join millions of investors capitalizing on Tesla's revolutionary growth."
```

This single text update aligns the Hero copy with the platform's established social proof numbers.

## Files Summary

| File | Action | Key Change |
|------|--------|------------|
| `src/components/Hero.tsx` | UPDATE | Change "thousands" to "millions" in subtitle text |

