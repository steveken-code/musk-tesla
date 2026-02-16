

## Fix Settlement Email: White Headers, No Breaking, Professional Support

### Problem Summary
1. **Header text still showing black** in some email clients despite `!important` - need a more bulletproof approach
2. **Email card breaking/splitting** - the card renders in pieces instead of as one cohesive unit
3. **"Do not reply" and support section** need a more professional look

### Changes to `supabase/functions/send-settlement-required/index.ts`

#### 1. Force White Header Text (Bulletproof)
Email clients like Gmail strip `!important` and override `<h1>` styles. The fix:
- Replace `<h1>` with a `<table>` cell (email clients don't override table cell colors)
- Use `<td>` with `color: #ffffff` instead of heading tags
- Keep the `<span>` wrapper with `color: #ffffff` as a fallback
- Apply font styling (size, weight) directly on the `<td>`

#### 2. Prevent Email Card from Breaking
- Add `page-break-inside: avoid` to the main card table
- Set `min-width: 100%` on the outer wrapper to prevent splitting
- Ensure all nested tables use `width="100%"` consistently
- Remove `border-radius: 16px` overflow clipping which can cause render breaks in some clients

#### 3. Professional Support & Footer Section
Replace the current WhatsApp button + "do not reply" with a cleaner, unified support block:
- Styled support card with a subtle border and icon
- "Need Assistance?" heading with WhatsApp link as a clean professional button
- "Available 24/7 | Secure & Confidential" tagline
- Footer: clean single-line copyright with "Confidential communication" note
- Remove the blunt "Please do not reply to this email" - replace with softer "This is a system-generated notification"

### After Deploy
Resend the settlement email to Igor to verify white headers, no card breaking, and professional support look.

