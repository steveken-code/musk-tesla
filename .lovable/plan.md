
## Goal (what will change)
Make the **country selector dropdown (mobile drawer + desktop dropdown)** fully **theme-aware** so it uses your app’s design tokens (`bg-background`, `bg-popover`, `text-foreground`, `border-border`) instead of hard-coded `bg-white dark:bg-slate-900`.

This fixes the “mobile looks white / not theme-aware” issue and ensures **mobile + desktop match** in both **light** and **dark** modes.

Also fix the placeholder formatting to a clean, professional **“Search Country”** (with space + correct capitalization).

---

## What I found in your current code
File: `src/components/InvestmentCountrySelector.tsx`

### Current mobile drawer background behavior
Mobile drawer is currently hard-coded like:
- `DrawerContent className="... bg-white dark:bg-slate-900"`
- Header and sections also use `bg-white dark:bg-slate-900`
- Country rows default to `bg-white dark:bg-slate-900`

This *relies* on the `dark` class being present for the dark styling to apply. When anything about the timing/state is off (especially with portals/drawers), you can get “white surfaces” showing up even when the app is meant to be dark.

### Desktop dropdown is also hard-coded the same way
Desktop dropdown container/list is also:
- `bg-white dark:bg-slate-900`

So to be truly consistent and “professional,” we should stop hard-coding and use the theme tokens everywhere inside this selector.

### Placeholder formatting
Right now both mobile + desktop use:
- `placeholder={t('searchCountry') || 'Search country'}`
And `LanguageContext` currently has:
- `searchCountry: 'Search country'`

You want the professional format: **“Search Country”**.

---

## Implementation approach (what I will update)
### 1) Make mobile drawer theme-aware (no hard-coded white)
In `InvestmentCountrySelector.tsx` update these mobile classes:

**A. Drawer surface**
- Change `DrawerContent` from `bg-white dark:bg-slate-900`
- To: `bg-background text-foreground` (or `bg-popover text-popover-foreground`)

**B. Header + search section + list container**
- Change from `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700`
- To token-based: `bg-background border-border` (or `bg-popover border-border`)

This ensures the mobile drawer always reflects the active theme correctly.

---

### 2) Make desktop dropdown match mobile (same theme tokens)
Update desktop dropdown container + sections:

- Container: from `border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900`
- To: `border-border bg-popover text-popover-foreground` (still keep your `z-[200]`, shadow, rounded, animation)

- Search section/list wrapper: from `bg-white dark:bg-slate-900`
- To: `bg-popover`

---

### 3) Make country row styling “professional” and theme-safe
Right now the row uses:
- `border-slate-200 dark:border-slate-700`
- Default row: `bg-white dark:bg-slate-900 ... hover:bg-slate-50 dark:hover:bg-slate-800`

Update to tokens so it always works in both themes:
- Row divider: `border-border`
- Default row background: `bg-popover`
- Hover: `hover:bg-muted`
- Highlighted (keyboard): `bg-muted`
- Selected: keep a clean accent, but make it consistent with your “electric-blue” standard:
  - Selected background: `bg-electric-blue/10`
  - Left border: `border-l-electric-blue`
  - Selected text/icon: `text-electric-blue`

This removes dependence on `dark:` and avoids mismatched “white” surfaces.

---

### 4) Make the trigger button theme-aware too
The trigger button currently has:
- `bg-white dark:bg-slate-900`

Change to:
- `bg-background`

Keep your border standard:
- `border-slate-400 hover:border-electric-blue`

This prevents the trigger itself from looking “white” in dark contexts if dark variants don’t apply for any reason.

---

### 5) Fix the placeholder text formatting everywhere (“Search Country”)
Two parts:

**A. In `InvestmentCountrySelector.tsx`**
Update both placeholders to:
- `placeholder={t('searchCountry') || 'Search Country'}`

**B. In `src/contexts/LanguageContext.tsx`**
Update English fallback translation:
- `searchCountry: 'Search Country'`

This guarantees the correct spacing/capitalization even when translations are used.

---

## QA checklist (what you should test after I implement)
1. On `/dashboard`, open the country selector on **mobile**:
   - In **dark mode**: drawer background should be dark (not white)
   - In **light mode**: drawer should be light, matching the rest of the app
2. Open the country selector on **desktop**:
   - Dropdown background + text should match mobile (same theme)
3. Confirm **Search Country** placeholder is exactly formatted:
   - “Search Country” (space + capital C)
4. Check borders:
   - Trigger border: slate-400, hover electric-blue
   - Amount input: slate-400, focus electric-blue (already updated)
5. Keyboard navigation:
   - Arrow up/down highlights rows
   - Enter selects
   - Escape closes

---

## Files to change
- `src/components/InvestmentCountrySelector.tsx`
  - Replace hard-coded `bg-white dark:bg-slate-900` usage with theme tokens
  - Update row styling to token-based backgrounds/borders
  - Fix placeholder fallback text
- `src/contexts/LanguageContext.tsx`
  - Update English translation value for `searchCountry` to “Search Country”
