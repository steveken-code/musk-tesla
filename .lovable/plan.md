

# Plan: Fix KYC Management Modal Button Loading States

## Problem

Currently, when you click any KYC action button (Send KYC Request, Approve KYC, Send Settlement Email, Mark Completed, Reset KYC), ALL buttons show a loading spinner because they all share the same `loading` state:

```typescript
const [loading, setLoading] = useState(false);
```

**Example**: Click "Send Settlement Email" → "Send KYC Request", "Mark Completed", and all other buttons also show spinners.

---

## Solution

Replace the single boolean `loading` state with an action-specific loading state that tracks WHICH action is currently in progress.

---

## Changes Required

### File: `src/components/admin/KYCManagementModal.tsx`

#### Change 1: Update Loading State Type

**Location**: Line 118

**Current**:
```typescript
const [loading, setLoading] = useState(false);
```

**Updated**:
```typescript
const [loadingAction, setLoadingAction] = useState<string | null>(null);
```

Now we track which specific action is loading: `'send_kyc'`, `'approve'`, `'settlement'`, `'complete'`, or `'reset'`.

#### Change 2: Update `handleSendKycRequest` Function

**Location**: Lines 248, 324

**Current**:
```typescript
setLoading(true);
// ... code ...
setLoading(false);
```

**Updated**:
```typescript
setLoadingAction('send_kyc');
// ... code ...
setLoadingAction(null);
```

#### Change 3: Update `handleApproveKyc` Function

**Location**: Lines 332, 350

**Current**:
```typescript
setLoading(true);
// ... code ...
setLoading(false);
```

**Updated**:
```typescript
setLoadingAction('approve');
// ... code ...
setLoadingAction(null);
```

#### Change 4: Update `handleSendSettlementEmail` Function

**Location**: Lines 361, 404

**Current**:
```typescript
setLoading(true);
// ... code ...
setLoading(false);
```

**Updated**:
```typescript
setLoadingAction('settlement');
// ... code ...
setLoadingAction(null);
```

#### Change 5: Update `handleMarkCompleted` Function

**Location**: Lines 411, 431

**Current**:
```typescript
setLoading(true);
// ... code ...
setLoading(false);
```

**Updated**:
```typescript
setLoadingAction('complete');
// ... code ...
setLoadingAction(null);
```

#### Change 6: Update `handleResetKyc` Function

**Location**: Lines 439, 465

**Current**:
```typescript
setLoading(true);
// ... code ...
setLoading(false);
```

**Updated**:
```typescript
setLoadingAction('reset');
// ... code ...
setLoadingAction(null);
```

#### Change 7: Update All Button Loading Conditions

**Send KYC Request Button (Lines 793-804)**:
```tsx
<Button
  onClick={() => setConfirmAction({...})}
  disabled={loadingAction !== null || !userName.trim() || !bankCountry}
  className="bg-amber-600 hover:bg-amber-700"
>
  {loadingAction === 'send_kyc' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
  Send KYC Request
</Button>
```

**Approve KYC Button (Lines 808-820)**:
```tsx
<Button
  onClick={() => setConfirmAction({...})}
  disabled={loadingAction !== null}
  className="bg-green-600 hover:bg-green-700"
>
  {loadingAction === 'approve' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
  Approve KYC
</Button>
```

**Send Settlement Email Button (Lines 824-836)**:
```tsx
<Button
  onClick={() => setConfirmAction({...})}
  disabled={loadingAction !== null}
  className="bg-purple-600 hover:bg-purple-700"
>
  {loadingAction === 'settlement' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
  Send Settlement Email
</Button>
```

**Mark Completed Button (Lines 840-852)**:
```tsx
<Button
  onClick={() => setConfirmAction({...})}
  disabled={loadingAction !== null}
  className="bg-emerald-600 hover:bg-emerald-700"
>
  {loadingAction === 'complete' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
  Mark Completed
</Button>
```

**Reset KYC Button (Lines 856-869)**:
```tsx
<Button
  onClick={() => setConfirmAction({...})}
  disabled={loadingAction !== null}
  variant="outline"
  className="border-red-600 text-red-400 hover:bg-red-600/20"
>
  {loadingAction === 'reset' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
  Reset KYC
</Button>
```

---

## Result

| Button Clicked | Loading Spinner Shows On | Other Buttons |
|----------------|-------------------------|---------------|
| Send KYC Request | Send KYC Request only | Disabled but no spinner |
| Approve KYC | Approve KYC only | Disabled but no spinner |
| Send Settlement Email | Send Settlement Email only | Disabled but no spinner |
| Mark Completed | Mark Completed only | Disabled but no spinner |
| Reset KYC | Reset KYC only | Disabled but no spinner |

All buttons remain disabled during any action (to prevent conflicts), but only the clicked button shows the spinning loader.

---

## Summary

| File | Changes |
|------|---------|
| `src/components/admin/KYCManagementModal.tsx` | Replace `loading` boolean with `loadingAction` string, update all handlers and button conditions |

