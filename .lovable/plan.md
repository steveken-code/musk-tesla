

# Professional Referral System and User Display Enhancements

## Overview

This plan addresses multiple improvements to make the referral system more professional and user-friendly:
1. Display user's name and email properly in admin panel
2. Auto-fill the name field in profile form from signup data
3. Shorten and professionalize the referral link (use `/signup` instead of `/auth`)
4. Remove the admin referral code configuration (make it automatic based on user ID)
5. Ensure strict referral code validation from the link

---

## Current Issues Identified

### Issue 1: Admin Panel User Display
The admin panel already fetches profiles with `full_name` and `email` (lines 362-389 in Admin.tsx). The display logic uses a helper function that correctly shows the user's name, email prefix, or truncated user ID as fallback. This is working correctly.

### Issue 2: Auto-Fill Name in Profile Form
Currently, the ProfileCompletionModal receives `currentName` as a prop and initializes the state with it (line 29). However, when a user signs up with their name, it's stored in `auth.users.user_metadata.full_name`. The profile table should be auto-populated with this name via a database trigger.

**Current behavior:**
- User signs up with "John Doe" as their name
- Name is stored in `auth.users.user_metadata.full_name`
- Profile is created but `full_name` may not be copied over

### Issue 3: Referral Link Format
Current referral link: `msktesla.net/auth?ref=B503E502`
Desired referral link: `msktesla.net/signup?ref=B503E502`

This requires:
1. Adding a `/signup` route that redirects to `/auth` in signup mode
2. Updating the ReferralBonus component to generate the new link format

### Issue 4: Remove Admin Referral Code Configuration
The current system has a configurable referral code in admin settings that users must manually match. This is redundant because:
- Each user has a unique referral code based on their user ID prefix
- The code in the URL should automatically validate against the referrer's user ID

**Current validation flow (problematic):**
1. User clicks link with `?ref=B503E502`
2. System checks if this matches admin-configured code (TATY-8492)
3. This doesn't make sense - the code is user-specific!

**Correct validation flow:**
1. User clicks link with `?ref=B503E502`
2. System validates that a user with ID starting with `b503e502` exists
3. No need for admin-configured code

### Issue 5: Strict Referral Code Validation
The referral code in the URL must exactly match a valid user ID prefix. If a user types the wrong code manually, it should fail validation.

---

## Implementation Plan

### Part 1: Add `/signup` Route Alias

**File: `src/App.tsx`**

Add a new route that renders the Auth component in signup mode:

```typescript
// Add import for Signup alias
import Signup from "./pages/Signup";

// In routes:
<Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
```

**New File: `src/pages/Signup.tsx`**

Create a simple wrapper that redirects to Auth with signup mode:

```typescript
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Preserve query params (including ?ref=CODE)
    navigate(`/auth${location.search}`, { replace: true });
  }, [navigate, location.search]);
  
  return null;
};

export default Signup;
```

### Part 2: Update Referral Link in ReferralBonus Component

**File: `src/components/dashboard/ReferralBonus.tsx`**

Change lines 53-56:

```typescript
// Current:
const referralLink = `${PRODUCTION_DOMAIN}/auth?ref=${referralCode}`;
const displayLink = `msktesla.net/auth?ref=${referralCode}`;

// Updated to use "signup" for cleaner look:
const referralLink = `${PRODUCTION_DOMAIN}/signup?ref=${referralCode}`;
const displayLink = `msktesla.net/signup?ref=${referralCode}`;
```

### Part 3: Update Referral Code Validation Logic

**File: `src/contexts/AuthContext.tsx`**

Replace the current validation logic (lines 66-135) with a simpler, more professional approach:

Current problem: The system validates against a hardcoded `TATY-8492` or admin-configured code.

New approach:
1. If a referral code is provided, validate it matches a real user's ID prefix
2. Remove dependency on admin-configured referral codes
3. The database trigger `handle_referral_signup` already handles creating the referral record

```typescript
const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
  let validReferrerUserId: string | null = null;
  
  // Validate referral code by checking if a user with this ID prefix exists
  if (referralCode && referralCode.trim()) {
    const normalizedCode = referralCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Query profiles to find a user whose user_id starts with this code (case-insensitive)
    const { data: matchingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('user_id', `${normalizedCode.toLowerCase()}%`)
      .limit(1)
      .maybeSingle();
    
    if (profileError || !matchingProfile) {
      return { error: { message: 'Invalid referral code. Please check the link and try again.' } };
    }
    
    validReferrerUserId = matchingProfile.user_id;
  }
  
  // Proceed with signup...
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: { 
        full_name: fullName, 
        referral_code: referralCode?.trim().toUpperCase() || null,
        referrer_user_id: validReferrerUserId 
      }
    }
  });
  
  // ... rest of the signup logic
};
```

### Part 4: Remove Admin Referral Code Configuration Section

**File: `src/pages/Admin.tsx`**

Remove or hide the Referral Settings section (lines 1306-1344). The referral code should be automatic based on user IDs, not manually configured.

**Option A (Recommended):** Keep only the notification email field
- Remove the referral code input
- Keep the email field for notifications
- Update the description to explain the automatic referral system

**Option B:** Remove the entire section
- Remove lines 1306-1344
- Remove the `ReferralSettings` interface and related state
- Remove `handleSaveReferralSettings` function

Since the email is still useful for notifications, we'll go with Option A:

```typescript
{/* Referral Settings Section */}
<div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
    <Gift className="w-5 h-5 text-purple-500" />
    {t('referralSettings') || 'Referral Notification Settings'}
  </h2>
  <div className="space-y-2">
    <Label className="text-slate-300 text-sm font-semibold">
      {t('referralEmail') || 'Notification Email'}
    </Label>
    <Input
      type="email"
      value={referralSettings.referralEmail}
      onChange={(e) => setReferralSettings(prev => ({ ...prev, referralEmail: e.target.value }))}
      className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold"
      placeholder="email@example.com"
    />
  </div>
  <p className="text-xs text-slate-400 mt-3">
    <strong>Referral codes are automatic.</strong> Each user gets a unique referral link based on their account ID. 
    When someone signs up using a referral link and their investment is activated, you'll receive a notification at this email.
  </p>
  <Button onClick={handleSaveReferralSettings} className="mt-4 bg-purple-600 hover:bg-purple-700" disabled={savingReferral}>
    {savingReferral ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
    Save Notification Settings
  </Button>
</div>
```

### Part 5: Ensure Name Auto-Fills in Profile

The signup process stores `full_name` in `user_metadata`. We need to ensure this is copied to the profiles table.

**File: `src/contexts/AuthContext.tsx`**

After successful signup, explicitly update the profile with the name:

```typescript
// After signup succeeds
if (!error && data?.user) {
  // Ensure profile has the name from signup
  setTimeout(async () => {
    await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', data.user!.id);
  }, 500);
  
  // ... rest of the code
}
```

Alternatively, if there's already a database trigger that creates profiles on signup, ensure it copies the `raw_user_meta_data.full_name` to the profile.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/signup` route |
| `src/pages/Signup.tsx` | New file - redirect to Auth with query params |
| `src/components/dashboard/ReferralBonus.tsx` | Update link to use `/signup` |
| `src/contexts/AuthContext.tsx` | Simplify referral validation to check user ID prefix |
| `src/pages/Admin.tsx` | Remove referral code field, keep only notification email |

---

## Technical Flow After Changes

```text
Referral Flow:
1. User A dashboard → ReferralBonus → Link: msktesla.net/signup?ref=B503E502
2. User B clicks link → /signup redirects to /auth?ref=B503E502
3. Auth page auto-switches to signup mode, auto-fills referral code
4. User B signs up with name, email, password
5. Validation: Check if any user_id starts with 'b503e502'
6. ✓ Match found → User A's ID starts with b503e502
7. Signup succeeds → Profile created with full_name from form
8. Database trigger creates referral record linking A → B
9. Notifications sent to both users
```

---

## Validation Logic Summary

| Code Entered | Validation | Result |
|--------------|------------|--------|
| `B503E502` | User with ID `b503e502-xxxx-xxxx-xxxx-xxxxxxxxxxxx` exists | ✓ Valid |
| `B503E502` (typed wrong) | No user with matching ID prefix | ✗ Invalid |
| `RANDOM123` | No user with matching ID prefix | ✗ Invalid |
| Empty | No validation needed | ✓ Proceeds without referral |

---

## Expected Outcomes

1. **Professional referral links**: `msktesla.net/signup?ref=CODE` instead of `/auth`
2. **Automatic referral codes**: No manual configuration needed in admin
3. **Strict validation**: Referral codes only work when they match a real user's ID
4. **User names display correctly**: In admin panel and pre-filled in profile forms
5. **Simplified admin panel**: Removed redundant referral code field

