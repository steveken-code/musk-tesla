
## What’s happening (root cause)
I checked the current Admin fetching logic and the database, and the problem is real:

- The Admin page shows name/email/photo from **public.profiles** (it loads investments, then does a second query to `profiles` for those `user_id`s).
- At least one investment belongs to a `user_id` that **does not have a profiles row** yet.
  - That user *does* exist in the authentication users table and already has `email` + `full_name` saved in metadata, but **profiles is missing**, so Admin can’t display name/email/photo and falls back to “User-xxxx” (and emails may fall back to “Valued Investor”).

The main technical reason: `handle_new_user()` exists, but there is **no automatic “create profile on signup” trigger** (and we should not attach triggers to reserved auth schemas). So some users end up without a `profiles` record unless we create it ourselves from the app.

Also, the profile edit modal currently uses `.update(...).eq('user_id', userId)`:
- If the profile row doesn’t exist, that update can “succeed” without changing anything, so the user thinks they saved, but Admin still shows no name/photo.

## Goals (what we will fix)
1. Every user who signs in will always have a `profiles` row (with name/email) automatically.
2. Profile “Save changes” must always persist (even if the row didn’t exist yet).
3. Admin must show user name/email/photo reliably (no more “Investor” / user id fallback for normal cases).
4. Emails should never greet users as “Valued Investor” when we have enough info to use a real name (or at least email prefix).

## Implementation plan (code changes)
### A) Guarantee profiles row exists for every authenticated user
- In `src/contexts/AuthContext.tsx`:
  - After a successful sign-in (and/or when auth state changes to SIGNED_IN), run a small “ensure profile exists” routine:
    1) Try `insert` with “ignore duplicates” (so it only creates the row if missing).
    2) If the row exists but `full_name` or `email` is null, update only those missing fields.
  - This avoids overwriting a user’s edited name later (important).

Result: even users who somehow missed profile creation will get fixed automatically the first time they log in.

### B) Fix the “Save profile” flow so it never silently fails
- In `src/components/ProfileCompletionModal.tsx`:
  - Replace the current `profiles.update(...).eq('user_id', userId)` with an **upsert** using `onConflict: 'user_id'`.
  - Include `email: currentEmail` in the upsert payload (since email is read-only but should be saved if missing).
  - Keep the avatar upload as-is; it’s already doing cache-busting (`?t=...`) which is correct.

Result: if a user had no profile row, pressing “Save Profile” will actually create it and the name/photo will start appearing.

### C) Make Admin repair missing profile rows for existing investments (one-click + automatic option)
- In `src/pages/Admin.tsx`:
  - During `fetchData()`, after loading profiles for investment userIds:
    - Detect which investment `user_id`s still have no profiles row.
  - Add a “Fix missing user profiles” action that calls a backend function to backfill those missing profiles (admin-only).
  - After backfill completes, call `fetchData()` again so the Admin UI updates immediately.

Why this is needed: it fixes old records right away without waiting for the user to log in again.

### D) Stop “Valued Investor” from appearing in emails when we can infer a real display name
There are two layers where “Valued Investor” can appear:

1) **Frontend callers** (Admin/Dashboard) sometimes pass `userName: profile.full_name || 'Valued Investor'`.
   - Update these call sites to use a more “real” fallback:
     - `full_name` if present
     - else email prefix (before @)
     - else “User”
   - Files to update include:
     - `src/pages/Admin.tsx`
     - `src/pages/Dashboard.tsx`

2) **Backend email templates** (the backend functions themselves) also contain `userName || 'Valued Investor'`.
   - Update these functions so the fallback is:
     - `userName` if provided
     - else derive from `userEmail` (prefix before `@`)
     - else “Hello”
   - Functions to adjust (based on code search):
     - `supabase/functions/send-trade-closed/index.ts`
     - `supabase/functions/send-investment-activation/index.ts`
     - `supabase/functions/send-withdrawal-status/index.ts`
     - `supabase/functions/send-withdrawal-request/index.ts`
     - `supabase/functions/send-password-reset/index.ts` (uses `name || 'Valued Investor'`)

Result: even if name is missing, emails look professional (“Hello igor2,”) instead of “Valued Investor”.

### E) Admin-only backend function to backfill profiles (secure)
- Create a new backend function (edge function) like `sync-missing-profiles`:
  - Requires Authorization header
  - Verifies the caller is admin (same pattern already used in `send-trade-closed`)
  - Accepts a list of `userIds`
  - For each userId:
    - reads user email + metadata name from auth admin API (service role)
    - upserts into `public.profiles` (user_id, email, full_name)
  - Returns how many profiles were created/updated

This keeps the backfill secure and prevents non-admins from creating/editing other users’ profile rows.

## How we will verify (end-to-end tests)
1. Create a brand-new user on `/auth` with a full name.
2. Log in and open Dashboard:
   - Confirm profile row exists and the header/menu shows name/email correctly.
3. Upload avatar + change name in Profile modal and click Save:
   - Confirm the UI updates immediately.
4. Open Admin:
   - Confirm the investment card shows:
     - avatar image (if uploaded)
     - full name
     - email
     - no user-id fallback for that user
5. Trigger an email (investment activation / trade closed / withdrawal status):
   - Confirm greeting uses the real name (or email prefix), never “Valued Investor”.

## Notes on professionalism (what you asked for)
- Showing “Valued Investor” in the greeting is only acceptable as a last-resort fallback; it looks generic and can reduce trust.
- A stronger professional fallback is:
  - real name if known,
  - otherwise email prefix (it still feels personal),
  - otherwise “Hello” / “Hello there”.

This plan ensures your Admin + emails always display something credible and user-specific.

## Expected impact
- New users: always have name/email in profile and Admin.
- Existing users missing profiles: fixed automatically (on login) and immediately fixable by Admin.
- “Investor” / ID-only display will largely disappear except in true edge-cases where we genuinely have no data.

