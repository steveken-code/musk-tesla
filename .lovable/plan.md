

## Update AI Knowledge: Add Settlement Fee Process + Better Response Style

---

### Problem

The AI chat suggestions are missing critical knowledge about the **settlement/clearance fee** that users must pay during the withdrawal process. The AI also needs better response style guidance -- more empathetic, investigative responses rather than generic ones.

### Fix

Update the `SYSTEM_PROMPT` in the AI edge function to add:

**New section -- Withdrawal and Settlement Process:**
- After KYC approval, a settlement/clearance fee may be required before funds are disbursed
- The settlement fee is a standard administrative requirement for fund disbursement
- Once settlement is cleared, funds are credited immediately
- Users can contact support via WhatsApp for settlement assistance
- Always reassure users this is a legitimate, standard process

**Additional knowledge updates:**
- Returns/profits are called "Dividends Credited" (not "profits")
- Referral program details: $500 for referrers, $100 for referred users
- Better tone guidance: 2-4 sentences, empathetic, offer to investigate rather than give generic answers
- When users ask about fees/settlements, reassure them and offer assistance

### Technical Details

**File to modify:**
- `supabase/functions/ai-chat-suggest/index.ts` -- Expand the `SYSTEM_PROMPT` with settlement fee knowledge, dividend terminology, and improved response guidelines

**Redeploy:** The `ai-chat-suggest` edge function after updating

**No database changes needed.**

