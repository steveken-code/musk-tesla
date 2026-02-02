
# Fix Referral Code Validation - Invalid Referral Code Error

## Root Cause Analysis

The referral validation is failing because of a UUID type mismatch in the database query.

### Current Flow

```text
User clicks: msktesla.net/signup?ref=E1659FF6
                    ↓
Auth page extracts code → "E1659FF6"
                    ↓
normalizeReferralCode() → "E1659FF6" (uppercase, no special chars)
                    ↓
Query: .ilike('user_id', 'e1659ff6%')
                    ↓
❌ FAILS - user_id is UUID type, not text!
```

### The Problem

| Component | Issue |
|-----------|-------|
| `user_id` column | UUID type in PostgreSQL |
| `.ilike()` method | Expects text column, can't pattern-match UUID |
| Result | Query returns no matches → "Invalid referral code" error |

### SQL Proof
```sql
-- This works (with explicit cast):
SELECT user_id FROM profiles WHERE user_id::text ILIKE 'e1659ff6%' ✅

-- This is what Supabase JS generates (no cast):
SELECT user_id FROM profiles WHERE user_id ILIKE 'e1659ff6%' ❌
```

---

## Solution

Replace the `.ilike()` query with a raw SQL filter that explicitly casts UUID to text.

### Technical Changes

**File: `src/contexts/AuthContext.tsx`**

Change from:
```typescript
const { data: matchingProfile, error: profileError } = await supabase
  .from('profiles')
  .select('user_id')
  .ilike('user_id', `${normalizedCode.toLowerCase()}%`)
  .limit(1)
  .maybeSingle();
```

Change to:
```typescript
const { data: matchingProfile, error: profileError } = await supabase
  .from('profiles')
  .select('user_id')
  .filter('user_id::text', 'ilike', `${normalizedCode.toLowerCase()}%`)
  .limit(1)
  .maybeSingle();
```

The `.filter()` method allows raw SQL operators and type casting, which properly converts the UUID to text before the pattern match.

---

## Additional Improvements

### 1. Better Error Logging
Add detailed logging to help debug future issues:
```typescript
console.log('Validating referral code:', { 
  original: referralCode, 
  normalized: normalizedCode,
  queryPattern: `${normalizedCode.toLowerCase()}%`
});
```

### 2. Graceful Fallback for Empty Referral
If user provides a referral code but we can't validate it, we could:
- Option A: Block signup with error (current behavior - strict)
- Option B: Allow signup without referral bonus (lenient)

We'll keep Option A (strict) since users expect the bonus.

### 3. Clear Error Message
Update error message to be more helpful:
```typescript
return { error: { message: 'Invalid referral code. The code may have expired or was entered incorrectly.' } };
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/AuthContext.tsx` | Fix UUID matching query with `.filter()` |

---

## After Fix: Expected Flow

```text
User clicks: msktesla.net/signup?ref=E1659FF6
                    ↓
Auth page extracts code → "E1659FF6" (auto-fills field)
                    ↓
User fills name, email, password → clicks Create Account
                    ↓
normalizeReferralCode() → "E1659FF6"
                    ↓
Query: .filter('user_id::text', 'ilike', 'e1659ff6%')
                    ↓
✅ MATCHES user_id = e1659ff6-b867-4d54-9ca9-40a94feb8067
                    ↓
Account created with referral bonus tracked!
                    ↓
Emails sent to referrer and new user
```

---

## Testing Checklist

After implementation:
1. Copy a user's referral link from dashboard (e.g., `msktesla.net/signup?ref=E1659FF6`)
2. Open in incognito/private browser
3. Verify code auto-fills in the referral code field
4. Complete signup with new email
5. Verify:
   - Account created successfully
   - Referral record created in database
   - Welcome bonus email sent to new user
   - Referral notification sent to admin email
