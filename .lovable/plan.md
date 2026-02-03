
## What I found (why it looks “fishy”)

### Backend reality (what’s actually in the database)
- Your KYC records table currently has **only 2 rows total**, and **both belong to the same user (“Eric Ben”)**.
- There are **no KYC records** for **Stephen Ekeke** or **Igor** right now.

So the backend did **not** switch Stephen/Igor to `kyc_submitted`.

### Likely root cause (UI bug in the Admin KYC modal)
In `src/components/admin/KYCManagementModal.tsx`, the function `loadKycData()` only updates `kycData` **when it finds a record**:

```ts
if (data) {
  setKycData(data);
  ...
}
```

If it finds **no** record for the newly selected withdrawal, it **does not clear** the previous `kycData`.  
That means:

- You open KYC modal for User A (who has a submitted record) → modal shows `kyc_submitted`
- Then you open KYC modal for User B (who has no record yet) → modal can still display User A’s `kyc_submitted`
- Worse: if you click “Send KYC Request / Approve / Settlement” while `kycData` is stale, you could update the **wrong** KYC row.

This perfectly matches your “Stephen is different user, Igor is different user—why did it change” observation.

## Changes to implement (to fix it properly)

### 1) Fix stale KYC data bleed between users (critical)
**File:** `src/components/admin/KYCManagementModal.tsx`

**Goal:** Every time the modal opens or `withdrawal.id` changes:
- Clear `kycData` immediately
- Reset form fields from the selected withdrawal
- Then fetch KYC row for that withdrawal
- If no row is found: explicitly keep `kycData = null`

Implementation details:
- In `loadKycData()`:
  - Call `setKycData(null)` before the fetch
  - If `data` is null → call `setKycData(null)` and reset fields to the withdrawal defaults
- Add a “request freshness” guard to prevent race conditions:
  - Keep a `requestId`/`activeWithdrawalIdRef`
  - If a slower request returns after you switched withdrawals, ignore it

Safety guard rails:
- Before any action button runs (send request/approve/settlement/complete), verify:
  - `withdrawal` exists
  - if `kycData` exists, `kycData.withdrawal_id === withdrawal.id`
  - If mismatch, show toast: “KYC record mismatch—refresh the modal”

### 2) Fix Tax ID “read-only” logic so admin doesn’t get locked incorrectly
Right now the admin Tax ID becomes read-only if `kycData?.tax_id` exists, even if that value was typed by admin earlier.

**Better rule:**
- Lock Tax ID only when the user has actually submitted KYC:
  - `kycData.status` is one of: `kyc_submitted`, `kyc_approved`, `pending_settlement`, `completed`
  - AND `kycData.tax_id` exists

Also update the label badge:
- Show `(User submitted)` only under the same condition above.

### 3) Prevent accidental updates with confirmations (strongly recommended)
Add confirmation dialogs for these buttons:
- Send KYC Request (creates/overwrites token, changes status)
- Approve KYC (changes status)
- Send Settlement Email (changes status + sends email)
- Mark Completed (changes status)

The confirm dialog should clearly show:
- User name + email
- Withdrawal amount
- Withdrawal ID (short)
This reduces “clicked on the wrong record” mistakes.

### 4) Add an Admin-only “Reset KYC” repair button (optional but useful)
If a KYC ever gets “submitted” incorrectly, admin can fix it safely.

Button visible only when status is at/after `kyc_submitted`.  
Action:
- Rotate token (generate new one)
- Set status back to `pending_kyc`
- Clear `document_url`, `document_type`, `tax_id` (optional: keep tax_id if you want, but usually reset means clear)
- Update `updated_at`

This makes old links unusable and restores the workflow cleanly.

### 5) Enforce “KYC required for all withdrawal methods” (professional activation)
Your verification page already collects ID + Tax ID, and it’s not tied to withdrawal method.  
What’s missing is **enforcement** at the admin/flow level:

- In Admin “Mark withdrawal completed” flow:
  - Block setting a withdrawal to `completed` unless there is a linked KYC row in an allowed status (e.g. `pending_settlement` or `completed` depending on your final workflow).
- This ensures crypto, phone, bank transfers all follow the same compliance gate.

## How we’ll verify the fix (end-to-end)
1. Open Admin → Withdrawals → open KYC modal for a user with an existing KYC record.
2. Close modal, then open KYC modal for a user who has **no** KYC record.
   - Confirm the modal does **not** show the previous user’s KYC document/status.
3. Send KYC request for Stephen/Igor and ensure:
   - Only their withdrawal gets a new `pending_kyc` KYC record
   - No other user’s KYC row changes
4. Confirm the Tax ID field:
   - Editable during `pending_kyc`
   - Read-only only after user submits (`kyc_submitted+`)

## Technical notes (for implementation accuracy)
- Current KYC table size confirms the issue is UI state, not mass backend updates.
- The bug is specifically the lack of `setKycData(null)` / reset when `.maybeSingle()` returns no row.
- Because actions depend on `kycData` presence to decide update vs insert, stale state is dangerous and must be fixed first.

## Files involved
- `src/components/admin/KYCManagementModal.tsx` (critical fix + safety)
- `src/pages/Admin.tsx` (optional: enforce “cannot complete withdrawal without KYC”)
- (Optional) add backend migration if you want a uniqueness guarantee:
  - unique constraint on `kyc_verifications.withdrawal_id` so we can safely `upsert`
