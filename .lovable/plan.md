

## Plan: Fix Chat Verification Code — Invalid Code Issue

### Root Cause
The `chat_verification_codes` table has an RLS policy `No direct access to verification codes — FOR ALL USING (false)` that blocks all client-side reads. The frontend query at line 484 of `LiveChatWidget.tsx` uses the anon key, so the SELECT always returns zero rows, making every code appear "invalid."

### Solution
Create a new Edge Function `verify-chat-code` that runs with the service role (bypasses RLS) to verify codes server-side.

### Steps

1. **Create Edge Function `verify-chat-code`**
   - Accepts `{ email, code }` in the request body
   - Uses service role client to query `chat_verification_codes` for a matching, unexpired, unverified code
   - If found, marks it as `verified = true` and returns success
   - If not found or expired, returns an appropriate error
   - Add CORS headers, set `verify_jwt = false` in config.toml

2. **Update `LiveChatWidget.tsx` `handleVerifyCode` function**
   - Replace the direct Supabase query (lines 484-492) with a call to `supabase.functions.invoke('verify-chat-code', { body: { email, code } })`
   - Handle the response to set success or error states accordingly

### Files Changed
- `supabase/functions/verify-chat-code/index.ts` (new)
- `supabase/config.toml` (add function config)
- `src/components/LiveChatWidget.tsx` (update handleVerifyCode)

