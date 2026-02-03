

# Fix Tax ID Input, Email Branding & UI/UX Improvements

## Summary of Issues to Fix

### 1. Tax ID Input Max Length by Country
**Current Issue**: Users can type unlimited characters in Tax ID field
**Bulgaria (BG)**: EGN is exactly 10 digits - should stop at 10

**Solution**: Add `maxLength` property to Tax ID input based on country config. Need to add `maxLength` field to TaxIdConfig interface.

---

### 2. Tax ID Field Read-Only in Admin
**Current Location**: `src/components/admin/KYCManagementModal.tsx` (Lines 531-536)
**Current**: Admin can edit Tax ID even after user has submitted it

**Solution**: Make Tax ID field `readOnly` and `disabled` when `kycData?.tax_id` exists (user already submitted)

---

### 3. Email Sender Branding Consistency
**Files to check**:
| File | Current | Status |
|------|---------|--------|
| `send-kyc-request/index.ts` | `Tesla Stock Platform <noreply@teslastockplatform.com>` | Correct |
| `send-settlement-required/index.ts` | `Tesla Stock Platform <noreply@teslastockplatform.com>` | Already fixed |

Both are now consistent - no changes needed.

---

### 4. Tax ID Input Form Styling (User sees white form - needs dark text)
**Current Issue (Line 391-402)**:
```tsx
className="bg-slate-800 border-slate-500 text-white font-bold..."
style={{ color: '#ffffff'... }}
```

**User Feedback**: The form is too bright/white, needs dark text
**Likely Issue**: The Input component base has `bg-background` which might be light

**Solution**: Use explicit white/light background with dark text for maximum contrast:
```tsx
className="bg-white border-slate-300 text-black font-bold placeholder:text-slate-500"
style={{ 
  color: '#000000', 
  fontWeight: 700, 
  opacity: 1,
  WebkitTextFillColor: '#000000',
  backgroundColor: '#ffffff'
}}
```

---

### 5. Remove Red Border Hover on Tax ID Input
**Current**: `focus:border-tesla-red`
**Solution**: Change to `focus:border-blue-500` (Tesla Electric Blue)

---

### 6. Remove Red Hover on Document Type Selection
**Current Location (Lines 320-326)**:
```tsx
className={`p-4 rounded-xl border-2 transition-all ${
  documentType === option.value
    ? 'border-tesla-red bg-tesla-red/10'
    : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
}`}
```

**Solution**: Replace `tesla-red` with `blue-500` (Tesla Electric Blue):
```tsx
className={`p-4 rounded-xl border-2 transition-all ${
  documentType === option.value
    ? 'border-blue-500 bg-blue-500/10'
    : 'border-slate-600 hover:border-blue-400/50 bg-slate-700/50'
}`}
```

---

### 7. Remove Red on Drag/Drop File Area
**Current Location (Lines 343-349)**:
```tsx
className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
  dragActive
    ? 'border-tesla-red bg-tesla-red/10'
    : selectedFile
    ? 'border-green-500 bg-green-500/10'
    : 'border-slate-600 hover:border-slate-500'
}`}
```

**Solution**: Replace red with blue:
```tsx
dragActive
  ? 'border-blue-500 bg-blue-500/10'
```

---

## Implementation Plan

### Step 1: Add maxLength to TaxIdConfig
**File**: `src/data/taxIdFormats.ts`

Add `maxLength` field to interface and all country configs:
```typescript
export interface TaxIdConfig {
  label: string;
  labelLocal?: string;
  format: string;
  placeholder: string;
  regex: RegExp;
  maxLength?: number; // NEW
}

// Examples:
BG: { 
  label: 'EGN', 
  format: '10 digits', 
  placeholder: '1234567890',
  regex: /^\d{10}$/,
  maxLength: 10 // NEW
},
US: {
  label: 'SSN',
  format: 'XXX-XX-XXXX (9 digits)',
  placeholder: '123-45-6789',
  regex: /^\d{3}-?\d{2}-?\d{4}$/,
  maxLength: 11 // 9 digits + 2 dashes
},
```

### Step 2: Update VerifyIdentity.tsx Tax ID Input
**File**: `src/pages/VerifyIdentity.tsx`

**Changes**:
1. Add `maxLength={taxIdConfig.maxLength}` to Input
2. Change background to white with dark text
3. Replace `focus:border-tesla-red` with `focus:border-blue-500`
4. Replace red with blue in document type buttons
5. Replace red with blue in drag/drop area

### Step 3: Make Tax ID Read-Only in Admin When User Submitted
**File**: `src/components/admin/KYCManagementModal.tsx`

```tsx
{/* Tax ID */}
<div className="space-y-2">
  <Label className="text-slate-300">
    {taxIdConfig.label}
    {kycData?.tax_id && (
      <span className="ml-2 text-xs text-green-400">(User submitted)</span>
    )}
  </Label>
  <Input
    value={taxId}
    onChange={(e) => !kycData?.tax_id && setTaxId(e.target.value)}
    placeholder={taxIdConfig.placeholder}
    className="bg-slate-800 border-slate-600 text-white font-mono"
    readOnly={!!kycData?.tax_id}
    disabled={!!kycData?.tax_id}
  />
  <p className="text-xs text-slate-500">{taxIdConfig.format}</p>
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/taxIdFormats.ts` | Add `maxLength` to TaxIdConfig interface and all country configs |
| `src/pages/VerifyIdentity.tsx` | Update Tax ID input styling, add maxLength, replace red with blue |
| `src/components/admin/KYCManagementModal.tsx` | Make Tax ID read-only when user has submitted |

---

## Visual Changes Summary

| Element | Before | After |
|---------|--------|-------|
| Tax ID Input Background | Dark (slate-800) | White (#ffffff) |
| Tax ID Input Text | White | Black/Dark (#000000) |
| Tax ID Focus Border | Red (tesla-red) | Blue (blue-500) |
| Document Type Selected | Red border/bg | Blue border/bg |
| Document Type Hover | Red hover | Blue hover |
| Drag/Drop Active | Red border/bg | Blue border/bg |
| Tax ID in Admin | Editable always | Read-only after user submits |

---

## Country Max Length Reference (Key Countries)

| Country | Tax ID | Max Length |
|---------|--------|------------|
| BG (Bulgaria) | EGN | 10 |
| US | SSN | 11 (with dashes) |
| RU | TIN/ИНН | 12 |
| DE | Steuer-ID | 11 |
| GB | NI Number | 13 (with spaces) |
| FR | NIF | 13 |
| IT | Codice Fiscale | 16 |
| PL | PESEL | 11 |
| TR | T.C. Kimlik No | 11 |

