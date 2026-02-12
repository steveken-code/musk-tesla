

# Fix Settlement Email Template - Standardize Crypto and Bank Withdrawals

## Problem

The "Verification Approved - Final Settlement Required" email renders differently for crypto vs bank withdrawals. The template should look identical regardless of payment method, with only the destination details changing contextually.

## Root Cause

The current edge function template is a single dark-theme template. The inconsistency likely happened because of a deployment timing issue -- one user received the email from an older version. The fix is to ensure the template is clean, standardized, and uses the correct professional branding for both crypto and bank methods.

## Changes

### File: `supabase/functions/send-settlement-required/index.ts`

**Keep the dark theme template (matching Eric's version)** with these refinements:

1. **Standardize the email width** to 650px (matching the professional branding spec from other emails like withdrawal confirmation and trade closed)

2. **Crypto vs Bank differentiation** -- only these fields change:
   - **Destination row**: Shows "USDT Wallet (0x1a2b...cdef)" for crypto, or "United States (****1234)" for bank
   - **Body text**: Says "your designated USDT Wallet" for crypto, or "your designated Bank Account" for bank
   - No other visual or structural differences

3. **Ensure consistent styling across both paths:**
   - Dark background `#0f0f0f` with `#1a1a1a` cards
   - Tesla Red gradient header with white text ("Verification Approved" + "Final Settlement Required for Fund Disbursement")
   - Green success badge for KYC approval
   - Transaction summary table with consistent row styling
   - Blue CTA button for WhatsApp
   - All text colors: white for primary, `#a1a1aa` for secondary, `#71717a` for labels

4. **Import and use shared constants** from `_shared/email-constants.ts` for `FROM_EMAIL`, `HEADER_GRADIENT`, `FONT_FAMILY`, and `COLORS` to prevent future drift

5. **Currency display**: Show symbol only (e.g., `$9,993.00`) without currency code suffix, matching the platform standard

## No database changes required

This is purely an edge function template fix. The function will be redeployed automatically.
