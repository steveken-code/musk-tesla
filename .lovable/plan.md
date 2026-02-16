
## Bulletproof White Headers + Professional Footer for ALL Email Templates

### Problem
- 11 email templates still use `<h1>` tags for header text, which email clients (Gmail, Outlook) can override to black
- Only `send-settlement-required` has the bulletproof `<table>/<td>` header and professional "Need Assistance?" footer
- Support sections and footers are inconsistent across templates

### The Fix
Replace all `<h1>`/`<p>` header text with the proven `<table role="presentation">` + `<td>` + `<span>` structure from the settlement template. Also standardize the footer and support section across all templates.

### Bulletproof Header Pattern (applied to all)
Replace `<h1 style="color: #ffffff">` with:
```text
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800;">
      <span style="color: #ffffff;">Tesla Stock Platform</span>
    </td>
  </tr>
  <tr>
    <td align="center" style="color: #ffffff; font-size: 16px; padding-top: 10px;">
      <span style="color: #ffffff;">[Subtitle Text]</span>
    </td>
  </tr>
</table>
```

### Professional Footer Pattern (applied to all)
Replace the current simple footer with a "Need Assistance?" support card + compact copyright line, matching the settlement template.

### Anti-Break Pattern (applied to all)
Add `page-break-inside: avoid` and `min-width: 100%` to outer wrapper tables.

### Files to Modify (11 email templates)

| # | File | Current Header Issue |
|---|------|---------------------|
| 1 | `send-welcome-email/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 2 | `send-investment-confirmation/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 3 | `send-investment-activation/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 4 | `send-password-reset/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 5 | `send-withdrawal-request/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 6 | `send-withdrawal-confirmation/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 7 | `send-withdrawal-status/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 8 | `send-profit-notification/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 9 | `send-trade-closed/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 10 | `send-chat-verification/index.ts` | Uses `<h1>` + `<p>` subtitle |
| 11 | `send-admin-notification/index.ts` | Uses `<h1>` for "ADMIN ALERT" |
| 12 | `send-kyc-request/index.ts` | Uses `<h1>` for verification header |
| 13 | `send-referral-notification/index.ts` | 3 sub-templates, all use `<h1>` |
| 14 | `send-chat-notification/index.ts` | Uses `<h1>` in div-based layout |
| 15 | `resend-verification-email/index.ts` | Uses `<h1>` for "TESLAINVEST" |
| 16 | `send-kyc-admin-notification/index.ts` | Uses `<h1>` for "New KYC Submission" |

### What Changes Per Template

For each template:
1. **Header**: Replace `<h1>` and `<p>` tags with `<table>/<td>/<span>` structure, all with `color: #ffffff`
2. **Outer table**: Add `page-break-inside: avoid; min-width: 100%`
3. **Footer**: Replace with professional compact footer matching settlement template
4. **Support section**: Where applicable, replace WhatsApp/support buttons with the clean "Need Assistance?" card pattern

### No Changes
- `send-settlement-required/index.ts` - already has the bulletproof pattern (this is the reference template)

### After Deploy
All 15+ email functions will be redeployed automatically. A test email can be sent to verify.
