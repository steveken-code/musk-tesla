

# Plan: Fix Button Loading States - Each Button Shows Its Own Loading

## Problem

Currently, when you click any withdrawal action button (Cancel, Complete, Hold, etc.), ALL buttons for that withdrawal show as disabled/loading because they all share the same state check: `updatingWithdrawal === withdrawal.id`.

**Example**: Click "Cancel" → The "Complete" button starts spinning instead of Cancel.

---

## Solution

Change the state from storing just the withdrawal ID to storing both the withdrawal ID AND the action type. This way, only the specific button that was clicked will show the loading spinner.

---

## Changes Required

### File: `src/pages/Admin.tsx`

#### Change 1: Update State Type

**Location**: Line 183

**Current**:
```typescript
const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);
```

**Updated**:
```typescript
const [updatingWithdrawal, setUpdatingWithdrawal] = useState<{ id: string; action: string } | null>(null);
```

Now we track both the withdrawal ID and which action is being performed.

#### Change 2: Update `updateWithdrawal` Function

**Location**: Line 576

**Current**:
```typescript
setUpdatingWithdrawal(id);
```

**Updated**:
```typescript
setUpdatingWithdrawal({ id, action: status });
```

Pass the status (completed, processing, on_hold, pending) as the action.

#### Change 3: Update `handleCancelWithdrawal` Function

**Location**: Line 634

**Current**:
```typescript
setUpdatingWithdrawal(withdrawal.id);
```

**Updated**:
```typescript
setUpdatingWithdrawal({ id: withdrawal.id, action: 'cancelled' });
```

#### Change 4: Update All Button Loading/Disabled States

For each button, update the `disabled` and loading spinner conditions to check both ID and action:

**Complete Button (Pending Section - Lines 2249-2261)**:
```tsx
<Button
  size="sm"
  onClick={() => updateWithdrawal(withdrawal.id, 'completed')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="bg-green-600 hover:bg-green-700"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'completed' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <CheckCircle className="w-4 h-4 mr-1" />
  )}
  Complete
</Button>
```

**Processing Button (Lines 2262-2271)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => openStatusModal(withdrawal, 'processing')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'processing' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <Clock className="w-4 h-4 mr-1" />
  )}
  Processing
</Button>
```

**Hold Button (Lines 2272-2281)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => openStatusModal(withdrawal, 'on_hold')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'on_hold' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <AlertCircle className="w-4 h-4 mr-1" />
  )}
  Hold
</Button>
```

**Cancel Button (Pending - Lines 2282-2291)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => handleCancelWithdrawal(withdrawal)}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-red-500 text-red-500 hover:bg-red-500/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'cancelled' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <XCircle className="w-4 h-4 mr-1" />
  )}
  Cancel
</Button>
```

**Complete Button (On Hold - Lines 2309-2321)**:
```tsx
<Button
  size="sm"
  onClick={() => updateWithdrawal(withdrawal.id, 'completed')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="bg-green-600 hover:bg-green-700"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'completed' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <CheckCircle className="w-4 h-4 mr-1" />
  )}
  Complete
</Button>
```

**Edit Message Button (Lines 2322-2330)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => openStatusModal(withdrawal, 'on_hold')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'on_hold' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : null}
  Edit Message
</Button>
```

**Set Pending Button (Lines 2331-2339)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => openStatusModal(withdrawal, 'pending')}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'pending' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : null}
  Set Pending
</Button>
```

**Cancel Button (On Hold - Lines 2340-2349)**:
```tsx
<Button
  size="sm"
  variant="outline"
  onClick={() => handleCancelWithdrawal(withdrawal)}
  disabled={updatingWithdrawal?.id === withdrawal.id}
  className="border-red-500 text-red-500 hover:bg-red-500/10"
>
  {updatingWithdrawal?.id === withdrawal.id && updatingWithdrawal?.action === 'cancelled' ? (
    <Loader2 className="w-4 h-4 animate-spin" />
  ) : (
    <XCircle className="w-4 h-4 mr-1" />
  )}
  Cancel
</Button>
```

#### Change 5: Update Modal Save Button Check

**Location**: Line 2475

**Current**:
```typescript
disabled={updatingWithdrawal === statusModalWithdrawal.id}
```

**Updated**:
```typescript
disabled={updatingWithdrawal?.id === statusModalWithdrawal.id}
```

---

## Result

| Button Clicked | Loading Spinner Shows On | Other Buttons |
|----------------|-------------------------|---------------|
| Cancel | Cancel button only | Disabled but no spinner |
| Complete | Complete button only | Disabled but no spinner |
| Hold | Hold button only | Disabled but no spinner |
| Processing | Processing button only | Disabled but no spinner |

All buttons remain disabled during an action (to prevent double-clicks), but only the clicked button shows the spinning loader.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Admin.tsx` | State type change + update all button conditions |

