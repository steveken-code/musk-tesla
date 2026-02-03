

# Fix KYC Verification Page - Logo Position & Singular Document Text

## Summary of Issues

### 1. Tesla Logo Too Low & Too Small
**Current (Line 287):**
```tsx
<img src={teslaLogo} alt="Tesla" className="h-12 mx-auto mb-4" />
```

**Problems:**
- `h-12` (48px) is small for a header logo
- Page has `py-12` padding that pushes everything down
- Logo needs to be more prominent as the first element users see

### 2. "Documents" Should Be "Document" (Singular)
User only submits **ONE** document - either a Passport, National ID, or Driver's License.

**Locations to fix:**

| Line | Current | Fixed |
|------|---------|-------|
| 213 | `'Your documents have been submitted successfully!'` | `'Your document has been submitted successfully!'` |
| 263 | `Documents Submitted!` | `Document Submitted!` |
| 265 | `Your identity verification documents have been submitted` | `Your identity verification document has been submitted` |

---

## Implementation Plan

### Step 1: Fix Tesla Logo - Larger & Higher Position
**File:** `src/pages/VerifyIdentity.tsx` (Lines 282-295)

**Changes:**
1. Reduce top padding from `py-12` to `py-6` to move content higher
2. Increase logo height from `h-12` to `h-16` (64px) for better visibility
3. Add more spacing below logo with `mb-6` instead of `mb-4`

**Before:**
```tsx
<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
  <div className="max-w-2xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
      <img src={teslaLogo} alt="Tesla" className="h-12 mx-auto mb-4" />
```

**After:**
```tsx
<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
  <div className="max-w-2xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
      <img src={teslaLogo} alt="Tesla" className="h-16 mx-auto mb-6" />
```

### Step 2: Fix Toast Message (Singular)
**File:** `src/pages/VerifyIdentity.tsx` (Line 213)

**Before:**
```tsx
toast.success('Your documents have been submitted successfully!');
```

**After:**
```tsx
toast.success('Your document has been submitted successfully!');
```

### Step 3: Fix Success Page Title (Singular)
**File:** `src/pages/VerifyIdentity.tsx` (Line 263)

**Before:**
```tsx
<h1 className="text-2xl font-bold text-white mb-2">Documents Submitted!</h1>
```

**After:**
```tsx
<h1 className="text-2xl font-bold text-white mb-2">Document Submitted!</h1>
```

### Step 4: Fix Success Page Description (Singular)
**File:** `src/pages/VerifyIdentity.tsx` (Lines 264-266)

**Before:**
```tsx
<p className="text-slate-400 mb-6">
  Your identity verification documents have been submitted successfully. Our compliance team will review them shortly.
</p>
```

**After:**
```tsx
<p className="text-slate-400 mb-6">
  Your identity verification document has been submitted successfully. Our compliance team will review it shortly.
</p>
```

---

## Visual Summary

| Element | Before | After |
|---------|--------|-------|
| Page top padding | `py-12` (48px) | `py-6` (24px) - moves content up |
| Logo height | `h-12` (48px) | `h-16` (64px) - larger logo |
| Logo margin bottom | `mb-4` | `mb-6` - better spacing |
| Success title | "Documents Submitted!" | "Document Submitted!" |
| Success description | "documents have been submitted...review them" | "document has been submitted...review it" |
| Toast message | "Your documents have been..." | "Your document has been..." |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/VerifyIdentity.tsx` | Fix logo size/position, update all text from plural to singular |

