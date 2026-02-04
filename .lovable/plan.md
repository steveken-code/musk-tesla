

# Plan: Add "Cancel/Revert Withdrawal" Feature for Incorrect Details

## Overview

This plan adds a "Cancel" button for withdrawals that are on hold or pending, allowing the admin to cancel a withdrawal when the user has submitted incorrect details (like wrong card numbers). Once cancelled, the user can submit a new withdrawal with correct information.

**Specific Case**: Bolyshev Sergey Nikolaevich with $13,200 has an incorrect card number `3521 8563 1452 36` - this withdrawal needs to be cancelled so he can try again.

---

## Current System

- Withdrawals can be: `pending`, `on_hold`, `completed`, or `cancelled`
- When a withdrawal is `on_hold`, admin can only: Complete it, Edit the hold message, or Set it back to Pending
- There's no way to **cancel** an on_hold withdrawal so the user can start fresh

---

## Changes Required

### File: `src/pages/Admin.tsx`

#### Change 1: Add "Cancel" Button for on_hold Withdrawals

**Location**: Lines 2265-2298 (the on_hold withdrawal actions section)

Add a red "Cancel" button after the existing "Set Pending" button:

```tsx
{withdrawal.status === 'on_hold' && (
  <>
    <Button
      size="sm"
      onClick={() => updateWithdrawal(withdrawal.id, 'completed')}
      disabled={updatingWithdrawal === withdrawal.id}
      className="bg-green-600 hover:bg-green-700"
    >
      {updatingWithdrawal === withdrawal.id ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CheckCircle className="w-4 h-4 mr-1" />
      )}
      Complete
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => openStatusModal(withdrawal, 'on_hold')}
      disabled={updatingWithdrawal === withdrawal.id}
      className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
    >
      Edit Message
    </Button>
    <Button
      size="sm"
      variant="outline"
      onClick={() => openStatusModal(withdrawal, 'pending')}
      disabled={updatingWithdrawal === withdrawal.id}
      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
    >
      Set Pending
    </Button>
    {/* NEW: Cancel/Revert Button */}
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleCancelWithdrawal(withdrawal)}
      disabled={updatingWithdrawal === withdrawal.id}
      className="border-red-500 text-red-500 hover:bg-red-500/10"
    >
      <XCircle className="w-4 h-4 mr-1" />
      Cancel
    </Button>
  </>
)}
```

#### Change 2: Add Cancel Handler Function

Add a new function `handleCancelWithdrawal` that:
1. Shows a confirmation dialog
2. Sets the withdrawal status to `cancelled`
3. Clears the `hold_message` 
4. Does NOT send an email (user will just see their balance is available again)

```typescript
const handleCancelWithdrawal = async (withdrawal: Withdrawal) => {
  // Confirmation dialog
  const confirmed = window.confirm(
    `Cancel withdrawal for ${withdrawal.profiles?.full_name || 'User'}?\n\n` +
    `Amount: $${withdrawal.amount.toLocaleString()}\n\n` +
    `This will cancel the withdrawal and clear the hold message. ` +
    `The user will be able to submit a new withdrawal request.`
  );
  
  if (!confirmed) return;
  
  setUpdatingWithdrawal(withdrawal.id);
  try {
    const { error } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'cancelled',
        hold_message: null
      })
      .eq('id', withdrawal.id);

    if (error) throw error;

    toast.success('Withdrawal cancelled. User can now submit a new request.');
    fetchData();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel withdrawal';
    toast.error(errorMessage);
  } finally {
    setUpdatingWithdrawal(null);
  }
};
```

#### Change 3: Also Add Cancel Button for Pending Withdrawals

Update the pending withdrawals section (lines 2215-2250) to include a Cancel button:

```tsx
{withdrawal.status === 'pending' && (
  <>
    {/* ... existing Complete, Processing, Hold buttons ... */}
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleCancelWithdrawal(withdrawal)}
      disabled={updatingWithdrawal === withdrawal.id}
      className="border-red-500 text-red-500 hover:bg-red-500/10"
    >
      <XCircle className="w-4 h-4 mr-1" />
      Cancel
    </Button>
  </>
)}
```

---

## Immediate Action for Bolyshev Sergey

After implementing this feature:

1. Go to Admin → Withdrawals
2. Find Bolyshev Sergey Nikolaevich's $13,200 withdrawal
3. Click the "Cancel" button
4. Confirm the cancellation
5. The user will be able to submit a new withdrawal with correct card details

---

## What Happens After Cancellation

| Item | Before | After |
|------|--------|-------|
| Withdrawal Status | `on_hold` | `cancelled` |
| Hold Message | "Your withdrawal is currently on hold..." | `null` (cleared) |
| User's Balance | Locked in withdrawal | Available for new withdrawal |
| User Experience | Stuck | Can submit new withdrawal with correct details |

---

## Summary

| File | Changes |
|------|---------|
| `src/pages/Admin.tsx` | Add `handleCancelWithdrawal` function + Cancel buttons for pending/on_hold withdrawals |

This is a minimal change that adds a critical admin capability to handle user mistakes gracefully.

