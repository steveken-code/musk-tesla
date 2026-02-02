
# Fix Referral Code Validation - PostgREST UUID Query Issue

## Problem Discovered

The `.filter('user_id::text', 'ilike', ...)` approach **does not work** with PostgREST. The error shows:

```
Failed to load resource: 404
URL: /profiles?select=user_id&user_id::text=ilike.e1659ff6%
```

PostgREST cannot parse the `::text` type cast in URL query parameters.

---

## Root Cause

| Approach | Works in PostgreSQL | Works in PostgREST |
|----------|---------------------|-------------------|
| `WHERE user_id::text ILIKE 'e1659ff6%'` | Yes | No |
| `.filter('user_id::text', 'ilike', ...)` | N/A | No (404 error) |
| `.ilike('user_id', ...)` | N/A | No (UUID type mismatch) |

The Supabase JS client cannot perform type casting through PostgREST's REST API.

---

## Solution: Create a Database RPC Function

Create a secure database function that validates referral codes server-side, then call it from the frontend.

### Step 1: Create Database Function

```sql
CREATE OR REPLACE FUNCTION validate_referral_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_normalized_code text;
  v_referrer_id uuid;
BEGIN
  -- Normalize the code (uppercase, no dashes)
  v_normalized_code := UPPER(REPLACE(p_code, '-', ''));
  
  -- Find a profile whose user_id starts with this code
  SELECT user_id INTO v_referrer_id
  FROM profiles
  WHERE UPPER(REPLACE(LEFT(user_id::text, 8), '-', '')) = v_normalized_code
  LIMIT 1;
  
  RETURN v_referrer_id;
END;
$$;
```

### Step 2: Update Frontend Code

**File: `src/contexts/AuthContext.tsx`**

Replace the `.filter()` query with an RPC call:

```typescript
// From:
const { data: matchingProfile, error: profileError } = await supabase
  .from('profiles')
  .select('user_id')
  .filter('user_id::text', 'ilike', `${normalizedCode.toLowerCase()}%`)
  .limit(1)
  .maybeSingle();

// To:
const { data: referrerId, error: rpcError } = await supabase
  .rpc('validate_referral_code', { p_code: normalizedCode });

if (rpcError) {
  console.error('Referral code query error:', rpcError);
  return { error: { message: 'Error validating referral code. Please try again.' } };
}

if (!referrerId) {
  console.log('Referral code not found:', normalizedCode);
  return { error: { message: 'Invalid referral code. The code may have expired or was entered incorrectly.' } };
}

validReferrerUserId = referrerId;
```

---

## Testing Verified So Far

| Component | Status | Notes |
|-----------|--------|-------|
| Auth page URL extraction | Working | `?ref=E1659FF6` auto-fills field |
| Referral code input | Working | Uppercase, visible in form |
| Email notifications | Working | Tested via curl (status 200) |
| Database trigger | Working | `handle_referral_signup` present |
| Query via PostgREST | Failing | 404 on `::text` cast |

---

## Files to Modify

| Change | Type |
|--------|------|
| Create `validate_referral_code` function | Database Migration |
| Update `src/contexts/AuthContext.tsx` | Code Change |

---

## Expected Flow After Fix

```text
User clicks: msktesla.net/signup?ref=E1659FF6
                    ↓
Auth page extracts code → "E1659FF6" (auto-fills)
                    ↓
User submits signup form
                    ↓
Frontend calls: supabase.rpc('validate_referral_code', { p_code: 'E1659FF6' })
                    ↓
Database returns: 'e1659ff6-b867-4d54-9ca9-40a94feb8067' (or null)
                    ↓
✅ Account created with referral tracking
                    ↓
Emails sent to referrer and new user
```

---

## Implementation Order

1. Create the database function via migration
2. Update `AuthContext.tsx` to use RPC call
3. Test end-to-end signup with referral code
4. Verify referral record created in database
5. Confirm emails are sent
