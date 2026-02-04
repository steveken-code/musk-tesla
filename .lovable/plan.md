
# Plan: Fix Admin KYC Section - Search Input, Auto-populate Country/Currency, Remove Red Borders

## Overview

This plan addresses multiple issues in the Admin KYC section:

1. **KYC Search Input**: Make text dark with opacity 1 (currently has white text on dark background)
2. **Auto-populate Country**: Pull country from the withdrawal data instead of requiring manual selection
3. **Currency Default**: Default to USD without requiring selection
4. **Remove Red Border Hover**: Replace `focus:border-tesla-red` with neutral light grey (`focus:border-slate-400`)
5. **Display Country/Currency as Read-Only**: Show Bank Country and Currency as white text display fields (not selectable inputs)

---

## File Changes

### File 1: `src/pages/Admin.tsx`

**Location**: Lines 1577-1581 (KYC Search Input)

**Current**:
```tsx
<Input
  placeholder="Search by user name or email..."
  value={kycSearchQuery}
  onChange={(e) => setKycSearchQuery(e.target.value)}
  className="pl-10 bg-slate-700/50 border-slate-600 [color:#ffffff_!important] placeholder:text-slate-400 focus:border-purple-500"
/>
```

**Updated**:
```tsx
<Input
  placeholder="Search by user name or email..."
  value={kycSearchQuery}
  onChange={(e) => setKycSearchQuery(e.target.value)}
  className="pl-10 bg-white border-slate-300 text-black font-semibold placeholder:text-slate-500 focus:border-slate-400"
  style={{ color: "#000000", WebkitTextFillColor: "#000000", opacity: 1 }}
/>
```

This matches the style of the Investments and Withdrawals search inputs (already using white background with dark text).

---

### File 2: `src/components/admin/KYCManagementModal.tsx`

#### Change 1: Remove Country Select - Show as Read-Only Display

**Location**: Lines 645-666 (Country Select)

**Current**: A selectable dropdown for country.

**Updated**: Replace with a read-only display field that shows the country from the withdrawal data:
```tsx
{/* Bank Country - Read-only from withdrawal */}
<div className="space-y-2">
  <Label className="text-slate-300 flex items-center gap-2">
    <Globe className="w-4 h-4" />
    Bank Country
  </Label>
  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md">
    <Globe className="w-4 h-4 text-slate-400" />
    <span className="text-white font-semibold">
      {getCountryName(bankCountry) || 'Not specified'}
    </span>
  </div>
</div>
```

The country is already being set from the withdrawal data during `loadKycData()` and `resetFormState()`:
- Line 145: `setBankCountry(w?.country || 'US');`
- Line 201: `setBankCountry(data.bank_country || withdrawal.country || 'US');`

No selection needed - it automatically comes from the user's withdrawal.

#### Change 2: Remove Currency Select - Show as Read-Only Display

**Location**: Lines 737-755 (Currency Select)

**Current**: A selectable dropdown for currency.

**Updated**: Replace with a read-only display showing USD:
```tsx
{/* Currency - Read-only, always USD */}
<div className="space-y-2">
  <Label className="text-slate-300">Currency</Label>
  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md">
    <DollarSign className="w-4 h-4 text-green-400" />
    <span className="text-white font-semibold">USD (US Dollar)</span>
  </div>
</div>
```

#### Change 3: Remove Red Border Focus from All Inputs

Replace all occurrences of:
- `focus:border-tesla-red focus:ring-tesla-red/20`

With:
- `focus:border-slate-400 focus:ring-slate-400/20`

**Affected inputs**:
| Line | Field |
|------|-------|
| 640 | User Name |
| 689 | Account Number |
| 708 | Tax ID |
| 732 | Net Amount |
| 765 | Admin Notes |

#### Change 4: Update Payment Method Display to White Text

**Location**: Line 674-677

**Current**:
```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-slate-100 border-2 border-slate-300 rounded-md">
  <Building className="w-4 h-4 text-green-600" />
  <span className="text-slate-900 font-semibold">Bank Transfer</span>
</div>
```

**Updated**: Use dark background with white text to match the new read-only fields:
```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md">
  <Building className="w-4 h-4 text-green-400" />
  <span className="text-white font-semibold">Bank Transfer</span>
</div>
```

---

## Summary of Visual Changes

| Element | Before | After |
|---------|--------|-------|
| KYC Search Input | Dark background, white text | White background, dark text, opacity 1 |
| Bank Country | Selectable dropdown (light theme) | Read-only display (dark bg, white text) |
| Currency | Selectable dropdown (light theme) | Read-only display (dark bg, white text, shows "USD") |
| Payment Method | Light background, dark text | Dark background, white text |
| Focus Border (all inputs) | Tesla Red | Light Grey (slate-400) |

---

## Why This Works

1. **Country Auto-population**: The code already sets `bankCountry` from `withdrawal.country` - we just need to display it as read-only instead of allowing selection.

2. **Currency Default**: The code defaults to `'USD'` (line 129) and the modal always uses dollars - just display it instead of selecting.

3. **Consistency**: The read-only fields (Country, Currency, Payment Method) will all use the same dark styling (`bg-slate-800 border-slate-600`) matching the modal's overall dark theme.

4. **Search Input Visibility**: Using white background + dark text + forced opacity 1 matches other admin search inputs and ensures maximum readability on all devices.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Admin.tsx` | KYC search input styling (1 location) |
| `src/components/admin/KYCManagementModal.tsx` | Country/Currency as read-only, remove red borders (multiple locations) |
