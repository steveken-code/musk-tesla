

## Update AI Chat System Prompt with Accurate Platform Knowledge

---

### Problem

The AI auto-suggestion in the admin chat panel gives generic/incorrect replies because the system prompt lacks specific knowledge about how the Tesla Stock Platform actually works. For example, it told a user to "choose an investment plan" when the platform has no plans -- users simply deposit an amount of their choice.

### Fix

Update the `SYSTEM_PROMPT` in `supabase/functions/ai-chat-suggest/index.ts` to include detailed, accurate platform knowledge:

**How the platform actually works (to be embedded in the prompt):**

1. **Sign Up** -- Create an account on the platform
2. **Verify Identity** -- Complete KYC verification for security
3. **Deposit** -- Go to the dashboard, enter any amount (minimum $500), select your country, and you will be shown payment details (bank transfer or crypto) to send your funds to
4. **Trading** -- Once the admin confirms your deposit, the platform's professional traders invest your funds in Tesla stock. There are NO plans to choose from -- you simply deposit and the team handles the trading
5. **Profits** -- Your investment grows over time as trades generate returns. You can track your portfolio performance on the dashboard
6. **Withdraw** -- Request a withdrawal anytime from the dashboard by selecting your country, withdrawal method (bank transfer, mobile money, crypto, etc.), and entering your payment details

**Key facts the AI must know:**
- There are NO investment plans or tiers -- users deposit any amount they want (min $500)
- The platform trades Tesla stock on behalf of users
- Users do NOT trade themselves -- professional traders handle it
- Deposits are made via bank transfer or cryptocurrency
- Withdrawals support multiple methods depending on the user's country
- Users can track their investments and profits on the dashboard
- The platform has a referral program with bonus rewards

### Technical Details

**File to modify:**
- `supabase/functions/ai-chat-suggest/index.ts` -- Update the `SYSTEM_PROMPT` constant (lines 8-20) with accurate platform knowledge

**Redeploy:** The `ai-chat-suggest` edge function after updating

**No database changes needed.**

