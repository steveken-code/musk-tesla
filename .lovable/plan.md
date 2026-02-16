

## Fix Settlement Email: Compact Layout + White Header + Resend to Igor

### Issues Found
1. **Header text appearing black** - Igor received the email before the latest deployment took effect. The code already has `color: #ffffff` but needs redeployment and a fresh send.
2. **Email too long/tall** - Too much vertical spacing and padding makes the email scroll excessively.
3. **"Pending Clearance" badge breaking** - Needs `white-space: nowrap` to stay on one line.
4. **Igor's destination** - His pending withdrawal (TXN-76166D82, $26,000) is crypto (SOL network, wallet `G1Gyyn...LxL4`), so it should show "USDT Wallet" not bank.

### Changes to `supabase/functions/send-settlement-required/index.ts`

**Compact the layout (reduce vertical height):**
- Reduce outer padding from `40px 20px` to `24px 16px`
- Reduce header padding from `32px 40px` to `24px 32px`
- Reduce main content padding from `40px` to `28px 32px`
- Reduce greeting margin from `24px` bottom to `16px`
- Reduce success badge padding from `20px` to `14px`
- Reduce spacing between paragraphs from `24px` to `16px`
- Reduce transaction summary card padding from `24px` to `18px`
- Reduce table row padding from `10px` to `8px`
- Remove the suggested message box entirely (saves significant height)
- Reduce WhatsApp CTA margin from `16px 0 32px 0` to `12px 0 20px 0`
- Reduce footer padding from `24px 40px` to `16px 32px`

**Fix "Pending Clearance" badge:**
- Add `white-space: nowrap; display: inline-block;` to prevent line breaks

**Confirm header is white:**
- Header h1 and subtitle are already `#ffffff` - redeploying ensures the latest code is live

### After Deploy: Send Test Email to Igor

Send settlement email with his actual withdrawal data:
- Email: igorelchaninov84@gmail.com
- Name: Igor
- Withdrawal ID: 76166d82-0057-4269-80e4-a2278ad4051d
- Amount: $26,000.00
- Country: BE
- Payment method: crypto (SOL)
- Account: G1GyynKfahTLzbW7HQ7uhs5ytL37yQQ6PkoULhYyLxL4

This will display as "USDT Wallet (G1Gyyn...LxL4)" with the white header on the red gradient, in a compact layout.

