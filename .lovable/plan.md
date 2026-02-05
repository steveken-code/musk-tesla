

# Plan: Withdrawal Dropdown Theme-Aware & Investment Form UI Cleanup

## Issues Identified

| Issue | Current State | Desired State |
|-------|---------------|---------------|
| **Withdrawal country dropdown** | Hard-coded dark colors (`bg-[#1E1E1E]`, `border-[#444]`) | Theme-aware using design tokens |
| **Dropdown has two border colors** | `border-2 border-[#444]` + `hover:border-green-500/50` creates clashing colors | Single consistent border styling |
| **Red asterisk (*)** | `<span className="text-destructive">*</span>` in investment form | Remove entirely for cleaner look |
| **Red globe icon** | Globe uses `text-slate-500` (not red) | Confirm it's already neutral, not red |
| **Dropdown overlay** | Dropdown works inline (no blocking overlay) | Keep inline dropdown, add smooth animation |
| **Responsive consistency** | Mixed hard-coded and token-based styling | Consistent theme-aware design tokens |

---

## Changes

### File 1: `src/pages/Dashboard.tsx`

**Step 2 - Country Selection (lines 1730-1812)**

Update the country dropdown to be fully theme-aware:

**A. Trigger button (line 1738):**
```typescript
// Change from:
className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] border-2 border-[#444] rounded-xl hover:border-green-500/50 transition-colors"

// Change to:
className="w-full flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl hover:border-green-500 transition-all duration-200"
```

**B. Text colors in trigger (lines 1743-1746):**
```typescript
// Change from:
<span className="font-medium text-white">{selectedCountryData.name}</span>
<span className="text-[#888]">{t('chooseCountry')}</span>
<ChevronDown className="text-[#888]" />

// Change to:
<span className="font-medium text-foreground">{selectedCountryData.name}</span>
<span className="text-muted-foreground">{t('chooseCountry')}</span>
<ChevronDown className="text-muted-foreground" />
```

**C. Dropdown container (line 1752):**
```typescript
// Change from:
className="absolute z-[100] w-full mt-2 bg-[#1a1a1a] border-2 border-[#444] rounded-xl shadow-2xl overflow-hidden"

// Change to:
className="absolute z-[100] w-full mt-2 bg-popover border-2 border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
```

**D. Search section (line 1753):**
```typescript
// Change from:
<div className="p-3 border-b-2 border-[#333] bg-[#222]">

// Change to:
<div className="p-3 border-b-2 border-border bg-popover">
```

**E. Search input (line 1761):**
```typescript
// Change from:
className="pl-10 bg-[#2a2a2a] border-2 border-[#555] h-12 text-base [color:#ffffff_!important] [-webkit-text-fill-color:#ffffff_!important] font-semibold placeholder:text-[#777] focus:border-green-500 focus:ring-green-500/20 focus:ring-2 rounded-lg"

// Change to:
className="pl-10 bg-background border-2 border-border h-12 text-base text-foreground font-semibold placeholder:text-muted-foreground focus:border-green-500 focus:ring-green-500/20 focus:ring-2 rounded-lg"
```

**F. Clear button (line 1767):**
```typescript
// Change from:
className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-[#444] hover:bg-[#555] rounded-full transition-colors"
<X className="w-3 h-3 text-white" />

// Change to:
className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
<X className="w-3 h-3 text-foreground" />
```

**G. Dropdown list container (line 1774):**
```typescript
// Change from (in max-h area):
<div className="max-h-[300px] overflow-y-auto">

// Change to:
<div className="max-h-[300px] overflow-y-auto bg-popover">
```

**H. Empty state message (line 1776):**
```typescript
// Change from:
<div className="p-4 text-center text-[#888] font-medium">

// Change to:
<div className="p-4 text-center text-muted-foreground font-medium">
```

**I. Country rows (lines 1789-1805):**
```typescript
// Change from:
className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-[#333] last:border-b-0 ${
  withdrawCountry === country.code
    ? 'bg-green-500/20 border-l-4 border-l-green-500'
    : 'hover:bg-[#2a2a2a] border-l-4 border-l-transparent'
}`}
<span style={{ color: withdrawCountry === country.code ? '#4ade80' : '#ffffff' }}>

// Change to:
className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 border-b border-border last:border-b-0 ${
  withdrawCountry === country.code
    ? 'bg-green-500/10 border-l-4 border-l-green-500'
    : 'bg-popover hover:bg-muted border-l-4 border-l-transparent'
}`}
<span className={`font-semibold text-left flex-1 ${withdrawCountry === country.code ? 'text-green-500' : 'text-foreground'}`}>
```

---

### File 2: `src/components/InvestmentCountrySelector.tsx`

**Remove red asterisk (line 336):**
```typescript
// Change from:
<label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
  <Globe className="w-4 h-4 text-slate-500" />
  {t('selectCountry') || 'Select Your Country'}
  <span className="text-destructive">*</span>
</label>

// Change to:
<label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
  <Globe className="w-4 h-4 text-muted-foreground" />
  {t('selectCountry') || 'Select Your Country'}
</label>
```

**Note:** The globe icon is already `text-slate-500` (not red). Changing it to `text-muted-foreground` makes it fully theme-aware and consistent with other icons.

---

## Visual Summary

| Element | Before | After |
|---------|--------|-------|
| Dropdown background | `bg-[#1E1E1E]` / `bg-[#1a1a1a]` | `bg-popover` (theme-aware) |
| Text colors | `text-white` / `text-[#888]` | `text-foreground` / `text-muted-foreground` |
| Borders | `border-[#444]` + hover conflicts | `border-border` + clean hover states |
| Animations | None | `animate-in fade-in slide-in-from-top-2` |
| Red asterisk | Present in investment form | Removed |
| Globe icon | `text-slate-500` | `text-muted-foreground` (theme-aware) |

---

## Files Summary

| File | Action | Key Changes |
|------|--------|-------------|
| `src/pages/Dashboard.tsx` | UPDATE | Theme-aware withdrawal country dropdown, smooth animations, consistent borders |
| `src/components/InvestmentCountrySelector.tsx` | UPDATE | Remove red asterisk, theme-aware globe icon |

