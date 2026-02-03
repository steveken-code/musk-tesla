
# KYC Verification & Settlement Fee Workflow System

## Overview

This plan implements a comprehensive KYC verification and settlement fee workflow for the trading broker platform. When admin confirms a withdrawal (status becomes "confirmed"), the user receives a KYC request email with a link to upload their ID. After admin approves the KYC, a settlement fee email is sent. All emails follow the platform's Tesla-branded professional style.

---

## System Architecture

```text
+-------------------+     +---------------------+     +-------------------+
|   Admin Portal    | --> |  KYC Verification   | --> | Settlement Email  |
|  (Confirm Withdrawal) | |  Email + Upload     |     | (After KYC OK)    |
+-------------------+     +---------------------+     +-------------------+
         |                         |                          |
         v                         v                          v
+-------------------+     +---------------------+     +-------------------+
|   kyc_verifications   |     |  Storage Bucket   |     |   WhatsApp        |
|   (Database Table)    |     |  (ID Documents)   |     |   Support         |
+-------------------+     +---------------------+     +-------------------+
```

---

## Database Changes

### New Table: `kyc_verifications`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `withdrawal_id` | UUID | Reference to withdrawal |
| `user_id` | UUID | User reference |
| `user_name` | TEXT | Full name on ID |
| `bank_country` | TEXT | Country code (RU, US, etc.) |
| `payment_method` | TEXT | "bank_transfer" or "card" |
| `account_number` | TEXT | Bank account / card number |
| `tax_id` | TEXT | TIN/SSN based on country |
| `tax_id_type` | TEXT | "TIN", "SSN", "NIF", etc. |
| `document_url` | TEXT | URL to uploaded passport/ID |
| `document_type` | TEXT | "passport", "national_id", "drivers_license" |
| `status` | TEXT | "pending_kyc", "kyc_submitted", "kyc_approved", "pending_settlement", "completed" |
| `net_amount` | NUMERIC | Amount to disburse |
| `currency` | TEXT | Currency code |
| `admin_notes` | TEXT | Internal notes |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

## Tax ID Format by Country

| Country | Tax ID Label | Format |
|---------|--------------|--------|
| Russia (RU) | TIN / ИНН | 10-12 digits |
| USA (US) | SSN | 9 digits (XXX-XX-XXXX) |
| Germany (DE) | Steuer-ID | 11 digits |
| UK (GB) | NI Number | XX 00 00 00 X |
| France (FR) | NIF | 13 digits |
| Spain (ES) | NIF/NIE | 8 digits + letter |
| Italy (IT) | Codice Fiscale | 16 chars |
| Canada (CA) | SIN | 9 digits |
| Australia (AU) | TFN | 8-9 digits |
| Other EU | Tax ID | Country-specific |

---

## New Edge Functions

### 1. `send-kyc-request` - KYC Verification Request Email

**Trigger:** Admin changes withdrawal status to "confirmed" (not pending/hold)

**Email Content:**
- Subject: "Action Required: Identity Verification for Withdrawal Request [Ref: #TXN-XXXX]"
- Professional AML/CTF compliance language
- Country-specific Tax ID requirement (TIN for Russia, SSN for USA, etc.)
- Secure link to KYC verification page
- Tesla-branded email template with red gradient header

### 2. `send-settlement-required` - Unsettled Funds Email

**Trigger:** Admin approves KYC, clicks "Trigger Settlement Email" button

**Email Content:**
- Subject: "Verification Approved: Final Settlement Required for Fund Disbursement"
- Confirmation that KYC is approved
- Transaction summary (Net Amount, Currency, Bank/Account)
- Settlement clearance requirement explanation
- WhatsApp support contact for completing settlement

### 3. `send-kyc-submission-notification` - Admin Notification

**Trigger:** User successfully uploads KYC document

**Email Content:**
- Notification to admin that a user submitted KYC
- User details and document preview link
- Link to Admin portal to review

---

## Admin Portal Changes

### Remove Languages Dropdown
- Remove the language selector from the admin header to create more space
- Existing functionality preserved; just UI cleanup

### New "KYC Management" Tab
Add a new tab in the admin portal (alongside Investments, Withdrawals, Emails, Security):

**KYC Pending Review Section:**
- List of users awaiting KYC approval
- User name, country, document type, submission date
- Preview uploaded document (passport/ID)
- Approve / Reject buttons

### Enhanced Withdrawal Management Form

When admin clicks on a withdrawal to manage KYC:

**Form Fields:**
1. **User Name** (pre-filled from profile)
2. **Bank Country** (dropdown with all countries)
3. **Payment Method** (toggle: Bank Transfer / Card)
4. **Tax ID Field** (dynamic label based on country):
   - Russia: "TIN / ИНН" 
   - USA: "SSN"
   - Germany: "Steuer-ID"
   - UK: "NI Number"
   - Other: "Tax ID"
5. **Account/Card Number** (with country-specific validation)
6. **Net Amount** (admin enters the final amount)
7. **Currency** (dropdown)

**KYC Status Indicator:**
- Document upload status (Pending / Submitted / Approved)
- Preview uploaded ID if available

**Action Buttons:**
1. **Send KYC Request** - Sends the KYC verification email
2. **Approve KYC** - Marks KYC as approved
3. **Trigger Settlement Email** - Sends the unsettled funds email
4. **Mark Completed** - Final completion

### High-End Fintech UI Styling
- Dark slate theme with gradient accents
- Bank-specific styling based on selected country:
  - Russia: Sberbank-inspired green accents
  - US: Chase/BoA-inspired blue
  - Europe: Revolut-inspired purple/pink
- Smooth animations and transitions
- Professional data presentation cards

---

## User-Facing KYC Page

### New Route: `/verify-identity`

Query params: `?token=xxx&withdrawal_id=xxx`

**Page Content:**
1. **Header:** Tesla Stock Platform branding with security badge
2. **Instructions:** Clear AML/CTF compliance explanation
3. **Upload Section:**
   - Document type selector (Passport, National ID, Driver's License)
   - Drag-and-drop or click to upload
   - Image preview with crop/rotate
   - Accept formats: JPG, PNG, PDF (max 10MB)
4. **Tax ID Input:** Country-specific field (TIN for RU, SSN for US)
5. **Submit Button:** Upload to Supabase Storage
6. **Confirmation:** Success message with support contact

---

## Storage Configuration

### New Bucket: `kyc-documents`
- **Public:** No (private bucket for security)
- **Max file size:** 10MB
- **Allowed types:** image/jpeg, image/png, application/pdf

### RLS Policies:
- Users can upload to their own folder: `user_id/document_*`
- Admins can read all documents
- No public access

---

## Email Templates

### KYC Request Email (Tesla Red Theme)

```
Subject: Action Required: Identity Verification for Withdrawal Request [Ref: #TXN-8829]

Dear [User Name],

To comply with international Anti-Money Laundering (AML) and Counter-Terrorist 
Financing (CTF) regulations, we require a formal Identity Verification (KYC) 
to process your recent withdrawal request.

[Complete KYC Verification Button]

Requirements:
- Government-Issued ID: Passport, National ID, or Driver's License
- Tax Identification: [TIN for Russian Federation / SSN for US residents / etc.]

Your funds are currently held in a secured 'Pending' status and will proceed 
to the next stage once your identity is confirmed.

Transaction Reference: #TXN-8829
Withdrawal Amount: $X,XXX.XX
```

### Settlement Required Email (Tesla Red Theme)

```
Subject: Verification Approved: Final Settlement Required for Fund Disbursement

Dear [User Name],

Your KYC verification has been successfully approved by our compliance department.

To finalize the transfer of your withdrawal to your designated [Bank Name], 
you are required to resolve the Unsettled Fund Liability.

Transaction Summary:
- Net Amount: $X,XXX.XX USD
- Settlement Status: Pending Clearance
- Required Action: Complete Unsettled Fund Liquidation

Once this administrative settlement is cleared, the automated disbursement 
system will credit the funds to your account immediately.

[Contact Support on WhatsApp Button]
```

---

## Implementation Files

### New Files to Create:

| File | Purpose |
|------|---------|
| `supabase/functions/send-kyc-request/index.ts` | KYC request email function |
| `supabase/functions/send-settlement-required/index.ts` | Settlement fee email function |
| `supabase/functions/send-kyc-admin-notification/index.ts` | Admin notification when user submits KYC |
| `src/pages/VerifyIdentity.tsx` | User KYC document upload page |
| `src/components/admin/KYCManagementModal.tsx` | Admin KYC review modal |
| `src/components/admin/WithdrawalKYCForm.tsx` | Enhanced withdrawal form with KYC fields |
| `src/data/taxIdFormats.ts` | Country-specific tax ID formats and validation |

### Files to Modify:

| File | Changes |
|------|---------|
| `src/pages/Admin.tsx` | Add KYC tab, remove language dropdown, add KYC management UI |
| `src/App.tsx` | Add `/verify-identity` route |
| `supabase/config.toml` | Add new edge functions configuration |

---

## Workflow Summary

```text
1. User requests withdrawal
2. Admin reviews and clicks "Confirm" (not pending/hold)
3. System creates kyc_verifications record
4. send-kyc-request email sent to user
5. User clicks link, uploads ID on /verify-identity page
6. Document stored in kyc-documents bucket
7. Admin receives notification email
8. Admin reviews document in portal
9. Admin clicks "Approve KYC"
10. Admin clicks "Trigger Settlement Email"
11. send-settlement-required email sent to user
12. User contacts WhatsApp support
13. Admin marks withdrawal as completed
```

---

## Technical Details

### Country-to-TaxID Mapping Function

```typescript
function getTaxIdConfig(countryCode: string) {
  const configs = {
    RU: { label: 'TIN / ИНН', format: '10-12 digits', regex: /^\d{10,12}$/ },
    US: { label: 'SSN', format: 'XXX-XX-XXXX', regex: /^\d{3}-?\d{2}-?\d{4}$/ },
    DE: { label: 'Steuer-ID', format: '11 digits', regex: /^\d{11}$/ },
    GB: { label: 'NI Number', format: 'XX 00 00 00 X', regex: /^[A-Z]{2}\d{6}[A-D]$/i },
    // ... other countries
  };
  return configs[countryCode] || { label: 'Tax ID', format: 'Country-specific', regex: /^.{1,50}$/ };
}
```

### Bank Account Validation by Country

```typescript
function getAccountConfig(countryCode: string) {
  const configs = {
    RU: { type: 'card', label: 'Card Number', length: 16 },
    US: { type: 'routing_account', routingLength: 9, accountLength: '8-12' },
    GB: { type: 'sort_account', sortLength: 6, accountLength: 8 },
    // EU countries use IBAN
    DE: { type: 'iban', prefix: 'DE', length: 22 },
    FR: { type: 'iban', prefix: 'FR', length: 27 },
    // ... other countries from existing countryBankingSystems.ts
  };
  return configs[countryCode];
}
```

---

## Security Considerations

1. **Document Storage:** Private bucket with RLS policies
2. **Token Validation:** Unique, time-limited tokens for KYC links
3. **Admin Only:** All KYC approval actions require admin role verification
4. **Input Sanitization:** All user inputs sanitized before database storage
5. **Rate Limiting:** Edge functions protected with rate limiting

---

## Estimated Complexity

| Component | Effort |
|-----------|--------|
| Database migration | Low |
| Storage bucket setup | Low |
| 3 Edge functions | Medium |
| KYC upload page | Medium |
| Admin portal updates | Medium-High |
| Email templates | Low |
| **Total** | **Medium-High** |

This implementation adds a professional, bank-grade KYC verification workflow that integrates seamlessly with the existing withdrawal system and follows the platform's Tesla-branded design language.
