

# Plan: Professional Buttons & Full-Screen Profile Modal

## Overview

Refine the Invest/Withdraw buttons to be more compact and left-aligned, and update the profile modal to be full-screen for better visibility of the cancel option on desktop.

---

## Issues Identified

| Issue | Current State | Desired State |
|-------|---------------|---------------|
| **Buttons too long** | `min-w-[130px]` + `px-5 sm:px-6` padding | Smaller, more compact buttons |
| **Buttons centered** | `items-center xs:justify-center` | Left-aligned on all screens |
| **Profile modal size** | `max-w-md` (448px) on desktop | Full-screen coverage for easier cancel |
| **Button responsiveness** | Current sizing may overflow on tiny screens | More flexible, auto-width approach |

---

## Changes

### File 1: `src/components/dashboard/WelcomeCard.tsx`

**1. Update button container (line 89)**

```typescript
// Change from:
<div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3 mt-4 sm:mt-5 md:mt-6 items-center xs:justify-center w-full max-w-xs xs:max-w-none mx-auto">

// Change to:
<div className="flex flex-row gap-2 sm:gap-2.5 mt-4 sm:mt-5 md:mt-6 items-center justify-start">
```

Changes:
- Changed to `flex-row` always (buttons side by side on all screens)
- Changed `justify-center` to `justify-start` (left-aligned)
- Reduced gap from `gap-2.5 sm:gap-3` to `gap-2 sm:gap-2.5`
- Removed `max-w-xs xs:max-w-none mx-auto` (no container constraint needed)

**2. Update Invest button (lines 90-97)**

```typescript
// Change from:
<Button 
  size="default" 
  className="h-10 sm:h-11 px-5 sm:px-6 w-full xs:w-auto xs:min-w-[130px] bg-white/20 ..."
>
  <ArrowDownToLine className="w-4 h-4 mr-1.5 shrink-0" />
  <span>Invest</span>
</Button>

// Change to:
<Button 
  size="sm" 
  className="h-9 sm:h-10 px-4 sm:px-5 bg-white/20 hover:bg-white/30 hover:scale-[1.02] text-white border-0 backdrop-blur-sm font-medium transition-all duration-300 text-xs sm:text-sm rounded-xl shadow-lg"
>
  <ArrowDownToLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 shrink-0" />
  <span>Invest</span>
</Button>
```

Changes:
- Reduced size to `sm`
- Reduced height from `h-10 sm:h-11` to `h-9 sm:h-10`
- Reduced padding from `px-5 sm:px-6` to `px-4 sm:px-5`
- Removed `w-full xs:w-auto xs:min-w-[130px]` (auto-width always)
- Reduced text size to `text-xs sm:text-sm`
- Smaller icon on mobile `w-3.5 h-3.5 sm:w-4 sm:h-4`

**3. Update Withdraw button (lines 98-106)**

Same refinements as Invest button for consistency.

---

### File 2: `src/components/ProfileCompletionModal.tsx`

**1. Update modal container (line 162)**

```typescript
// Change from:
<div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

// Change to:
<div className="bg-card border border-border rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
```

Changes:
- Progressive max-width: `max-w-md` → `sm:max-w-lg` → `md:max-w-xl` → `lg:max-w-2xl`
- Added `max-h-[90vh] overflow-y-auto` for scrollability on smaller screens
- Desktop users get a larger modal, making the cancel button more visible

**2. Make header close button more prominent (line 165-171)**

```typescript
// Change from:
<button
  onClick={onClose}
  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
  aria-label="Cancel"
>
  <X className="w-5 h-5 text-muted-foreground" />
</button>

// Change to:
<button
  onClick={onClose}
  className="absolute top-4 right-4 p-2.5 rounded-full bg-muted/50 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
  aria-label="Cancel"
>
  <X className="w-5 h-5" />
</button>
```

Changes:
- Larger padding `p-2.5` for easier tap target
- Changed to `rounded-full` for a more prominent close button
- Added visible background `bg-muted/50`
- Red hover effect `hover:bg-destructive/20 hover:text-destructive` for clear cancel action

---

## Visual Summary

### Buttons

| Property | Before | After |
|----------|--------|-------|
| Height | `h-10 sm:h-11` | `h-9 sm:h-10` |
| Padding | `px-5 sm:px-6` | `px-4 sm:px-5` |
| Min width | `min-w-[130px]` | Auto (removed) |
| Alignment | Centered | Left-aligned |
| Text size | `text-sm` | `text-xs sm:text-sm` |
| Layout | Stack on mobile | Row on all screens |

### Profile Modal

| Property | Before | After |
|----------|--------|-------|
| Max width | `max-w-md` (fixed) | Progressive: `md` → `lg` → `xl` → `2xl` |
| Close button | Subtle, hover only | Visible background, red hover |
| Scrolling | None | `max-h-[90vh] overflow-y-auto` |

---

## Responsive Behavior

### Buttons
| Screen Size | Layout | Button Size |
|-------------|--------|-------------|
| All sizes | Side by side, left-aligned | Compact, auto-width |

### Profile Modal
| Screen Size | Modal Width | Close Button |
|-------------|-------------|--------------|
| Mobile | Full width with padding | Prominent, visible |
| Tablet (sm) | `max-w-lg` (512px) | Prominent, visible |
| Desktop (md) | `max-w-xl` (576px) | Prominent, visible |
| Large (lg+) | `max-w-2xl` (672px) | Prominent, visible |

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/components/dashboard/WelcomeCard.tsx` | UPDATE | Compact buttons, left-aligned, reduced padding/height |
| `src/components/ProfileCompletionModal.tsx` | UPDATE | Larger modal on desktop, prominent close button |

