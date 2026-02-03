

# Remove Net Amount Arrows & Clarify Card Option

## Summary of Issues

### 1. Net Amount Input Has Arrow Buttons
**Problem:** The number input has browser-default increment/decrement arrow buttons that make typing difficult.

**Location:** `src/components/admin/KYCManagementModal.tsx` (Lines 734-741)

**Current:**
```tsx
<Input
  type="number"
  value={netAmount}
  onChange={(e) => setNetAmount(e.target.value)}
  placeholder="Amount to disburse"
  className="bg-slate-800 border-slate-600 text-white"
/>
```

**Fix:** Change to `type="text"` with `inputMode="decimal"` and pattern validation:
```tsx
<Input
  type="text"
  inputMode="decimal"
  value={netAmount}
  onChange={(e) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setNetAmount(value);
  }}
  placeholder="Amount to disburse"
  className="bg-slate-800 border-slate-600 text-white"
/>
```

---

### 2. Card Number Box Explanation

**Purpose:** The Payment Method section (Bank Transfer / Card) determines what account information is collected for the disbursement.

**Location:** Lines 664-706

**Current Behavior:**
- **Bank Transfer** selected → Account Number field shows IBAN/Account format based on country
- **Card** selected → Account Number field would be for card number

**Your Options:**

| Option | Action |
|--------|--------|
| Keep it | Useful if some users want to receive funds to a debit card |
| Remove Card button | If all withdrawals are bank transfers only |

**Recommendation:** Remove the Card option since your withdrawal flow primarily uses bank transfers, phone (SBP), or crypto. Having Card as an option is confusing if you don't actually process card disbursements.

---

## Implementation Plan

### Step 1: Remove Arrow Buttons from Net Amount
**File:** `src/components/admin/KYCManagementModal.tsx` (Lines 734-741)

Change the Input from `type="number"` to `type="text"` with:
- `inputMode="decimal"` (shows numeric keyboard on mobile)
- Filter input to allow only numbers and decimal point
- This removes the arrow spinner completely

### Step 2: Remove Card Payment Option
**File:** `src/components/admin/KYCManagementModal.tsx` (Lines 664-692)

Remove the entire Card button (Lines 681-690):
```tsx
<Button
  type="button"
  variant={paymentMethod === 'card' ? 'default' : 'outline'}
  size="sm"
  onClick={() => setPaymentMethod('card')}
  className={paymentMethod === 'card' ? 'bg-tesla-red' : 'border-slate-600'}
>
  <CreditCard className="w-4 h-4 mr-1" />
  Card
</Button>
```

And simplify the Payment Method section since there's only one option.

---

## Visual Changes

| Element | Before | After |
|---------|--------|-------|
| Net Amount Input | Has arrow spinners | Plain text input, easier to type |
| Payment Method | Bank Transfer + Card buttons | Bank Transfer only (or remove section entirely) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/KYCManagementModal.tsx` | Remove number input arrows, remove Card option |

