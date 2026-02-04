

# Plan: Fix Withdrawal Completed Email - White Text & Spam Prevention

## Current State Analysis

After examining `supabase/functions/send-withdrawal-status/index.ts`:

1. **Text Colors (Lines 247-252)**:
   - "Tesla Stock Platform" uses `color: #FFFFFF` (white) ✅
   - "Transaction Receipt" uses `color: rgba(255, 255, 255, 0.95)` (also white) ✅
   
   **The text is already styled white**, but some email clients may not render `rgba()` correctly. I'll change to explicit `#FFFFFF` for maximum compatibility.

2. **Spam Issues (Lines 426-434)**: 
   Currently only using `X-Mailer` header. Missing critical deliverability headers that help emails land in primary inbox.

---

## Changes Required

### File: `supabase/functions/send-withdrawal-status/index.ts`

#### Change 1: Ensure Pure White Text for Header (Maximum Compatibility)

**Location**: Lines 247-252

**Current**:
```html
<h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
  Tesla Stock Platform
</h1>
<p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 600;">
  ${status === 'completed' ? 'Transaction Receipt' : 'Withdrawal Status Update'}
</p>
```

**Updated**:
```html
<h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
  Tesla Stock Platform
</h1>
<p style="margin: 15px 0 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">
  ${status === 'completed' ? 'Transaction Receipt' : 'Withdrawal Status Update'}
</p>
```

This changes the subtitle from `rgba(255, 255, 255, 0.95)` to `#FFFFFF` for guaranteed white rendering across all email clients (Outlook, Gmail, Apple Mail, etc.).

#### Change 2: Add High-Priority Deliverability Headers

**Location**: Lines 426-435 (the fetch call to Resend API)

**Current**:
```typescript
body: JSON.stringify({
  from: FROM_EMAIL,
  to: [userEmail],
  subject: subject,
  headers: {
    "X-Mailer": "Tesla Stock Platform",
  },
  html: emailHtml,
}),
```

**Updated**:
```typescript
body: JSON.stringify({
  from: FROM_EMAIL,
  to: [userEmail],
  subject: subject,
  reply_to: "support@msktesla.net",
  headers: {
    "X-Mailer": "Tesla Stock Platform",
    "X-Priority": "1",
    "X-MSMail-Priority": "High",
    "Importance": "high",
    "X-Entity-Ref-ID": transactionId,
  },
  html: emailHtml,
}),
```

**What these headers do**:
| Header | Purpose |
|--------|---------|
| `reply_to` | Provides valid reply address (improves trust score) |
| `X-Priority: 1` | Marks as high priority (some clients respect this) |
| `X-MSMail-Priority: High` | Microsoft Outlook priority header |
| `Importance: high` | Standard email importance header |
| `X-Entity-Ref-ID` | Unique transaction reference (helps with threading) |

---

## Summary

| Issue | Fix |
|-------|-----|
| "Transaction Receipt" text not appearing white | Change from `rgba(255,255,255,0.95)` to `#FFFFFF` |
| Emails going to spam | Add priority headers, reply-to, and unique transaction reference |

---

## File to Modify

| File | Location | Changes |
|------|----------|---------|
| `supabase/functions/send-withdrawal-status/index.ts` | Lines 247-252 | Pure white color for subtitle |
| `supabase/functions/send-withdrawal-status/index.ts` | Lines 426-435 | Add deliverability headers |

