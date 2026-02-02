
# Fix Referral Display - Show Friend Names & Photos

## Problem Identified

The referral tracking table shows "User 28e0bc..." instead of "Igor 2" because of **Row-Level Security (RLS)** restrictions:

| Policy | Effect |
|--------|--------|
| `Users can view own profile` | Users can only see their own profile row |
| **Result** | When you try to fetch Igor 2's profile, RLS blocks it |

The database has "Igor 2" with a photo, but you can't access it due to security policies.

## Solution

Create a **secure view** that exposes only the minimum public profile info (name + avatar) needed for referral displays, without exposing sensitive data like email or phone.

## Implementation Plan

### Step 1: Create Public Referral Profile View

Create a SQL migration to add a secure view:

```sql
-- Create a view for public referral profile display
-- Only exposes name and avatar, no PII like email/phone
CREATE VIEW public.referral_profiles AS
SELECT 
  user_id,
  full_name,
  avatar_url
FROM public.profiles;

-- Enable RLS bypass via view (security invoker off means it uses definer's permissions)
-- The view will be readable by authenticated users for referral display purposes
```

Then add an RLS policy to allow reading from this view for referral purposes.

### Step 2: Alternative - Add RLS Policy for Referral Access

Add a new RLS policy that allows users to view profiles of people they have referred:

```sql
-- Allow users to view profiles of users they referred
CREATE POLICY "Users can view referred user profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.referrals
      WHERE referrer_user_id = auth.uid()
      AND referred_user_id = profiles.user_id
    )
  );
```

This is the **recommended approach** - minimal, secure, and targeted.

### Step 3: Update ReferralBonus Component for Better Display

Enhance the referral cards with:

1. **Larger avatars** - w-10 h-10 instead of w-8 h-8
2. **Premium styling** - Gradient borders, hover effects
3. **Better fallback** - Colorful initials when no photo
4. **Animation** - Stagger animation for each referral card

```tsx
// Enhanced referral card
<motion.div
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.1 }}
  className="flex items-center justify-between p-3 rounded-xl 
    bg-gradient-to-r from-slate-800/80 to-slate-700/50 
    border border-electric-blue/20 hover:border-electric-blue/40 
    transition-all duration-300"
>
  {/* Avatar with ring effect */}
  {record.profile?.avatar_url ? (
    <img 
      src={record.profile.avatar_url} 
      alt={name}
      className="w-10 h-10 rounded-full object-cover 
        ring-2 ring-electric-blue/50 ring-offset-2 ring-offset-slate-800"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric-blue to-blue-600 
      flex items-center justify-center text-sm font-bold text-white shadow-lg">
      {name.charAt(0).toUpperCase()}
    </div>
  )}
  
  {/* Name with better typography */}
  <p className="text-sm font-semibold text-foreground">{name}</p>
</motion.div>
```

## Visual Enhancement

```text
Current:                      Enhanced:
┌─────────────────────┐       ┌─────────────────────────────┐
│ [○] User 28e0bc...  │  →    │ [📷 Igor 2 Photo]           │
│     2/2/2026        │       │                             │
│        $500 Active  │       │  Igor 2           $500      │
└─────────────────────┘       │  Feb 2, 2026       Active   │
                              │  ─────────────────────────  │
                              │  ⭐ Premium Card Style      │
                              └─────────────────────────────┘
```

## Files Changed

| File | Change |
|------|--------|
| Database Migration | Add RLS policy for referral profile access |
| `src/components/dashboard/ReferralBonus.tsx` | Enhanced card design with animations |

## Result

- **Igor 2's name and photo** will display properly
- **Premium card styling** makes referrals look cool
- **Secure** - only exposes name/avatar to referrers, not email/phone
- **Responsive** - looks great on all screen sizes
