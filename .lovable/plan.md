

## Fix: WhatsApp Support Visibility + Settlement Email Redesign

### Issue 1: WhatsApp Support Button Hidden During Profile Edit

The profile edit modal and the WhatsApp/support buttons both sit at `z-50`. When the modal opens, its full-screen backdrop covers the support buttons completely.

**Fix**: Increase the SupportButtons z-index to `z-[60]` so they always float above modals. This way WhatsApp and Telegram icons remain visible and clickable even while editing profile.

**File**: `src/components/SupportButtons.tsx`
- Change `z-50` to `z-[60]` on the container div

---

### Issue 2: Settlement Email - Switch from Dark to White/Light Theme

The current settlement email uses a dark theme (black background `#0f0f0f`). The user wants it redesigned to match the standard light-themed transactional emails (like Eric's email) -- wide, white background, white heading area with the Tesla Red gradient header, and professional light card styling.

**Changes to `supabase/functions/send-settlement-required/index.ts`**:

1. **Body background**: Change from `#0f0f0f` dark to `#f3f4f6` light gray (matching other emails)
2. **Main card**: Change from dark gradient to `#ffffff` white with light border and shadow
3. **Header**: Keep the Tesla Red gradient with white text -- "Verification Approved" and "Final Settlement Required for Fund Disbursement" in white
4. **Text colors**: Switch all body text from light-on-dark to dark-on-light using the shared COLORS constants (greetingText, bodyText, secondaryText, etc.)
5. **Transaction Summary card**: Use light card background (`#f9fafb`) with light borders instead of dark gradients
6. **Table text**: Reference labels in `secondaryText` gray, values in `darkText` near-black
7. **Footer**: Light background matching other transactional emails

### Issue 3: Crypto Withdrawals - Don't Say "Account"

For crypto/USDT withdrawals, the destination should never say "Bank Account". Currently the code has `destinationLabel` which correctly shows "USDT Wallet" for crypto, but the email body text says "designated Bank Account" for all types.

**Fix**: Update the body paragraph that currently says "transfer of your withdrawal to your designated Bank Account" to dynamically use the correct label -- "USDT Wallet" for crypto, "Bank Account" for bank transfers. This already partially exists in the `destinationLabel` variable but isn't used in the prose paragraph.

---

### Summary of Files Modified

| File | Change |
|------|--------|
| `src/components/SupportButtons.tsx` | Increase z-index from `z-50` to `z-[60]` |
| `supabase/functions/send-settlement-required/index.ts` | Full light-theme redesign using shared COLORS constants, fix crypto label in body text |

### What You Will See

- **WhatsApp button**: Always visible, even when the profile edit modal is open
- **Settlement email**: Wide, white/light themed email with Tesla Red gradient header showing "Verification Approved" in white text, clean transaction summary card on light background, and correct "USDT Wallet" label for crypto withdrawals instead of "Account"

