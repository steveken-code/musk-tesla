

# Fix Email Sender Branding - Ensure All Emails Come from "Tesla Stock Platform"

## Current Status: Audit of All Email Functions

I examined every email-sending edge function to check what sender name/address they use.

### Sender Configuration Summary

| Function | Current FROM_EMAIL | Status |
|----------|-------------------|--------|
| `send-welcome-email` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-password-reset` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-investment-confirmation` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-investment-activation` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-withdrawal-status` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-profit-notification` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-trade-closed` | `Tesla Stock Platform <no-reply@msktesla.net>` (hardcoded) | Correct |
| `send-kyc-request` | Uses `FROM_EMAIL` secret with fallback to `Tesla Stock Platform <noreply@teslastockplatform.com>` | Needs Update |
| `send-settlement-required` | Uses `FROM_EMAIL` secret with fallback to `Tesla Stock Platform <noreply@teslastockplatform.com>` | Needs Update |

## The Problem

The KYC-related emails (`send-kyc-request` and `send-settlement-required`) use a dynamic approach:
```typescript
const fromEmail = Deno.env.get("FROM_EMAIL") || "Tesla Stock Platform <noreply@teslastockplatform.com>";
```

This means:
1. If the `FROM_EMAIL` secret is set to something different, those emails will use whatever is in that secret
2. The fallback domain is `teslastockplatform.com` instead of `msktesla.net` (inconsistent)

All other emails have it hardcoded correctly as:
```typescript
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
```

## Solution: Standardize All KYC Email Functions

Update `send-kyc-request` and `send-settlement-required` to use the same hardcoded pattern as all other email functions:

```typescript
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
```

This ensures:
- Consistent sender name: **Tesla Stock Platform**
- Consistent email address: **no-reply@msktesla.net**
- No dependency on external secrets for sender identity
- Professional appearance for KYC/compliance communications

## Implementation Plan

### Step 1: Update send-kyc-request Function
**File:** `supabase/functions/send-kyc-request/index.ts`

**Change (Line 217):**
```typescript
// BEFORE:
const fromEmail = Deno.env.get("FROM_EMAIL") || "Tesla Stock Platform <noreply@teslastockplatform.com>";

// AFTER:
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
```

Also update line 219-220 to use the constant:
```typescript
from: FROM_EMAIL,
```

### Step 2: Update send-settlement-required Function
**File:** `supabase/functions/send-settlement-required/index.ts`

**Change (Line 217):**
```typescript
// BEFORE:
const fromEmail = Deno.env.get("FROM_EMAIL") || "Tesla Stock Platform <noreply@teslastockplatform.com>";

// AFTER:
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
```

Also update line 219-220 to use the constant:
```typescript
from: FROM_EMAIL,
```

## What Users Will See After Fix

| Email Type | Sender Name (inbox display) | Sender Address |
|------------|----------------------------|----------------|
| Action Required (KYC Request) | **Tesla Stock Platform** | no-reply@msktesla.net |
| Verification Approved (Settlement) | **Tesla Stock Platform** | no-reply@msktesla.net |
| All other emails | **Tesla Stock Platform** | no-reply@msktesla.net |

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-kyc-request/index.ts` | Hardcode FROM_EMAIL constant at top of file, remove dynamic fromEmail |
| `supabase/functions/send-settlement-required/index.ts` | Hardcode FROM_EMAIL constant at top of file, remove dynamic fromEmail |

## Why This Matters for KYC

Since these are compliance-related emails (identity verification, settlement requirements), having a consistent, professional sender identity is critical:
- Builds trust with users
- Reduces spam filtering issues
- Maintains brand consistency across all communications
- Ensures the "Action Required" and "Verification Approved" emails look as professional as welcome/activation emails

