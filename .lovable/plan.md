

# Dashboard Enhancements Plan

## Issues to Fix

### 1. Volume Always Shows 0
**Root Cause**: In `supabase/functions/stock-prices/index.ts`, volume is hardcoded to `0`. The Finnhub `/quote` endpoint doesn't include volume - it only provides price data.

### 2. Stats Cards Need Better Animations
**Current**: Basic fade-in animations in StatsGrid
**Needed**: Dynamic counting numbers, glowing effects, enhanced hover states

---

## Changes Required

### File 1: `supabase/functions/stock-prices/index.ts`

Add volume fetching from Finnhub's candle endpoint:

```typescript
// Fetch daily candle data which includes volume
const now = Math.floor(Date.now() / 1000);
const from = now - 86400; // 24 hours ago

const candleRes = await fetch(
  `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${now}&token=${apiKey}`
);
const candleData = await candleRes.json();
const volume = candleData.v?.[candleData.v.length - 1] || 0;
```

### File 2: `src/components/dashboard/StatsGrid.tsx`

Enhance with dynamic animations:

**Add AnimatedCounter component:**
```typescript
const AnimatedCounter = ({ end, duration = 1500, prefix = "", decimals = 0, isVisible }) => {
  const [count, setCount] = useState(0);
  // requestAnimationFrame-based smooth counting
  // Eased animation for professional feel
};
```

**Enhanced card effects:**
- Gradient border glow on hover
- Icon scale and pulse animation
- Staggered entrance timing
- Counting number animation for values

---

## Visual Result

| Element | Before | After |
|---------|--------|-------|
| Volume | `0` for all stocks | Real data: `189.3M`, `45.2M` |
| Stats values | Static numbers | Animated counting on scroll |
| Card hover | Basic | Glowing border + icon animation |
| Card entrance | Simple fade | Staggered with scale effect |

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/stock-prices/index.ts` | Add volume fetching from candle API |
| `src/components/dashboard/StatsGrid.tsx` | Add counting animations and enhanced effects |

---

## Balance Format - NO CHANGE NEEDED ✓

The current `formatSmartCurrency` already works correctly:
- `$1,000` → displays as `$1,000`
- `$1,150.78` → displays as `$1,150.78`

This is the professional behavior you want, so WelcomeCard stays unchanged.

