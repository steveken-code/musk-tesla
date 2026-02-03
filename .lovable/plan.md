
# Fix KYC Verification Page Issues

## Problems Identified

### 1. File Upload Failing
**Root Cause**: The storage RLS policy requires `auth.uid()` to match the folder name for uploads:
```sql
-- Current policy
((bucket_id = 'kyc-documents') AND ((auth.uid())::text = (storage.foldername(name))[1]))
```

Users clicking the email link are **not authenticated**, so `auth.uid()` is NULL and the upload is blocked.

**Solution**: Create an Edge Function to handle document uploads server-side using the service role key (bypasses RLS).

---

### 2. Tax ID Input Not Visible
**Current**: `className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"`

The opacity on the background may affect text visibility. Need explicit high-contrast styling.

**Solution**: Add `!opacity-100` and enforce bold, high-contrast text with `text-white font-semibold`.

---

### 3. No WhatsApp Link in Support Section
**Current** (line 429-431):
```tsx
<p className="text-center text-sm text-slate-500 mt-6">
  Need help? Contact our support team via WhatsApp for assistance.
</p>
```

**Solution**: Add a professional WhatsApp button/link using the same phone number from `SupportButtons.tsx` (+12186500840).

---

### 4. Logo Needs Updating
**Current**: Uses `src/assets/tesla-logo-clean.png`
**Requested**: Use the new transparent background logo uploaded by user.

**Solution**: Copy the uploaded logo to `src/assets/` and import it in `VerifyIdentity.tsx`.

---

## Implementation Plan

### Step 1: Create Edge Function for Document Upload
Create `supabase/functions/upload-kyc-document/index.ts`:
- Accept: file (base64), fileName, userId, kycId, documentType
- Validate the KYC token matches the user
- Upload to storage using service role (bypasses RLS)
- Return the document URL

### Step 2: Update VerifyIdentity.tsx

| Change | Location | Description |
|--------|----------|-------------|
| Logo | Line 10, 294 | Import and use new logo |
| Tax ID Input | Line 398-404 | Add explicit opacity-100, font-bold styling |
| WhatsApp Link | Line 429-431 | Replace plain text with clickable WhatsApp button |
| Upload Logic | handleSubmit | Call Edge Function instead of direct storage upload |

### Step 3: Copy New Logo
Copy `user-uploads://new_tesla-removebg-preview_1-4.png` to `src/assets/tesla-logo-kyc.png`

---

## Technical Details

### Edge Function: upload-kyc-document

```typescript
// Receives:
{
  file: string; // base64 encoded
  fileName: string;
  contentType: string;
  kycId: string;
  token: string;
  withdrawalId: string;
  documentType: string;
}

// Process:
1. Validate token + withdrawalId match KYC record
2. Decode base64 to binary
3. Upload to storage using service role
4. Generate signed URL
5. Update kyc_verifications record with document_url
6. Return success
```

### Updated Tax ID Input Styling
```tsx
<Input
  type="text"
  value={taxId}
  onChange={(e) => setTaxId(e.target.value)}
  placeholder={taxIdConfig.placeholder}
  className="bg-slate-700 border-slate-500 text-white font-semibold placeholder:text-slate-400 [opacity:1_!important] focus:border-tesla-red"
  style={{ color: '#ffffff', fontWeight: 600 }}
/>
```

### WhatsApp Support Section
```tsx
<div className="text-center mt-6 space-y-3">
  <p className="text-sm text-slate-400">Need help with your verification?</p>
  <a
    href="https://wa.me/12186500840"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
  >
    <MessageCircle className="w-5 h-5" />
    Contact Support via WhatsApp
  </a>
</div>
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/assets/tesla-logo-kyc.png` | Copy from user upload |
| `supabase/functions/upload-kyc-document/index.ts` | Create new Edge Function |
| `supabase/config.toml` | Add function config |
| `src/pages/VerifyIdentity.tsx` | Update logo, input styling, WhatsApp link, upload logic |

---

## After Implementation

1. User clicks email link (not logged in)
2. Token validates via Edge Function (already working)
3. User selects document type and uploads file
4. File converts to base64, sent to new Edge Function
5. Edge Function uploads using service role (bypasses RLS)
6. Tax ID input is clearly visible with high contrast
7. User can click WhatsApp button for support
8. Professional Tesla logo with transparent background displays
