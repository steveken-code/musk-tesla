

# Plan: Compact & Professional Invest/Withdraw Buttons

## Current Issues

| Issue | Current State | Desired State |
|-------|---------------|---------------|
| **Minimum width too large** | `xs:min-w-[160px]` forces wide buttons on small-medium screens | Smaller min-width or auto-sizing |
| **Excessive padding** | `px-6 sm:px-8` adds unnecessary horizontal space | Tighter, professional padding |
| **Button height** | `h-11 sm:h-12` is fine but could be slightly more compact | Consistent, clean heights |
| **Container max-width** | `max-w-sm` on mobile might be too wide | Tighter container or remove constraint |

---

## Changes

### File: `src/components/dashboard/WelcomeCard.tsx`

**1. Update button container (line 89)**

```typescript
// Change from:
<div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 items-center xs:justify-center w-full max-w-sm xs:max-w-none mx-auto">

// Change to:
<div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 mt-4 sm:mt-5 md:mt-6 items-center xs:justify-center w-full max-w-xs xs:max-w-none mx-auto">
```

Changes:
- Reduced gap from `gap-3 sm:gap-4` to `gap-2.5 sm:gap-3` (tighter spacing)
- Reduced margin top from `mt-5 sm:mt-6 md:mt-8` to `mt-4 sm:mt-5 md:mt-6`
- Changed `max-w-sm` to `max-w-xs` on mobile (narrower container, buttons look more proportional)

**2. Update Invest button (lines 90-97)**

```typescript
// Change from:
<Button 
  size="lg" 
  className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white/20 hover:bg-white/30 hover:scale-[1.02] text-white border-0 backdrop-blur-sm font-semibold transition-all duration-300 text-sm sm:text-base rounded-lg shadow-lg"
  onClick={onInvestClick}
>
  <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
  <span>Invest</span>
</Button>

// Change to:
<Button 
  size="default" 
  className="h-10 sm:h-11 px-5 sm:px-6 w-full xs:w-auto xs:min-w-[130px] bg-white/20 hover:bg-white/30 hover:scale-[1.02] text-white border-0 backdrop-blur-sm font-medium transition-all duration-300 text-sm rounded-xl shadow-lg"
  onClick={onInvestClick}
>
  <ArrowDownToLine className="w-4 h-4 mr-1.5 shrink-0" />
  <span>Invest</span>
</Button>
```

Changes:
- Reduced size from `lg` to `default`
- Reduced height from `h-11 sm:h-12` to `h-10 sm:h-11`
- Reduced padding from `px-6 sm:px-8` to `px-5 sm:px-6`
- Reduced min-width from `xs:min-w-[160px]` to `xs:min-w-[130px]`
- Changed `font-semibold` to `font-medium` (less heavy)
- Fixed text size to `text-sm` (consistent)
- Changed `rounded-lg` to `rounded-xl` (more modern)
- Reduced icon margin from `mr-2` to `mr-1.5`

**3. Update Withdraw button (lines 98-106)**

```typescript
// Change from:
<Button 
  size="lg" 
  className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white text-purple-700 hover:bg-white/95 hover:scale-[1.02] border-0 font-semibold shadow-xl transition-all duration-300 text-sm sm:text-base rounded-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
  onClick={onWithdrawClick}
  disabled={portfolioBalance <= 0}
>
  <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
  <span>Withdraw</span>
</Button>

// Change to:
<Button 
  size="default" 
  className="h-10 sm:h-11 px-5 sm:px-6 w-full xs:w-auto xs:min-w-[130px] bg-white text-purple-700 hover:bg-white/95 hover:scale-[1.02] border-0 font-medium shadow-xl transition-all duration-300 text-sm rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
  onClick={onWithdrawClick}
  disabled={portfolioBalance <= 0}
>
  <ArrowUpFromLine className="w-4 h-4 mr-1.5 shrink-0" />
  <span>Withdraw</span>
</Button>
```

Same refinements as the Invest button for consistency.

---

## Visual Summary

| Property | Before | After |
|----------|--------|-------|
| Button height | `h-11 sm:h-12` (44px/48px) | `h-10 sm:h-11` (40px/44px) |
| Horizontal padding | `px-6 sm:px-8` (24px/32px) | `px-5 sm:px-6` (20px/24px) |
| Min width (desktop) | `160px` | `130px` |
| Max container (mobile) | `max-w-sm` (384px) | `max-w-xs` (320px) |
| Border radius | `rounded-lg` | `rounded-xl` (more modern) |
| Font weight | `font-semibold` | `font-medium` |
| Icon margin | `mr-2` | `mr-1.5` |
| Button gap | `gap-3 sm:gap-4` | `gap-2.5 sm:gap-3` |

---

## Responsive Behavior

| Screen Size | Buttons Layout | Button Width |
|-------------|----------------|--------------|
| **< 475px (xs)** | Stacked vertically | Full width within `max-w-xs` container |
| **475px+ (xs)** | Side by side, centered | Auto width, `min-w-[130px]` each |
| **640px+ (sm)** | Side by side | Slightly larger padding, same min-width |
| **768px+ (md)** | Side by side | Same compact size, more card padding |

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/dashboard/WelcomeCard.tsx` | UPDATE | Reduce button size, padding, min-width; tighter container; modern rounded corners |

