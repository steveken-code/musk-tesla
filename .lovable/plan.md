

# Plan: Standardize Email Template Styling

## Overview

Fix color inconsistencies and branding across all email templates to ensure a cohesive, professional appearance.

---

## Changes Summary

| Issue | Current | Fix |
|-------|---------|-----|
| Greeting text color | Purple `#c4b5fd` in some templates | Dark gray `#374151` |
| Section headers | Mixed colors | Electric Blue `#3b82f6` |
| Footer branding | "TeslaInvest" in some | "Tesla Stock Platform" everywhere |

---

## Files to Update

### 1. `supabase/functions/send-withdrawal-request/index.ts`

**Greeting text** (Line ~95):
- Change: `color: #c4b5fd` → `color: #374151`

**Section header "Withdrawal Details"** (Line ~107):
- Change: `color: #c4b5fd` → `color: #3b82f6`

---

### 2. `supabase/functions/send-withdrawal-status/index.ts`

**Greeting text** (multiple status types):
- Change: `color: #c4b5fd` → `color: #374151`

**Section headers** (Withdrawal Details, Transaction Summary):
- Change: `color: #c4b5fd` → `color: #3b82f6`

---

### 3. `supabase/functions/send-investment-activation/index.ts`

**Greeting text**:
- Change: `color: #c4b5fd` → `color: #374151`

**Section header "Investment Details"**:
- Change: `color: #c4b5fd` → `color: #3b82f6`

---

### 4. `supabase/functions/send-investment-confirmation/index.ts`

**Footer branding**:
- Change: "TeslaInvest" → "Tesla Stock Platform"

---

### 5. `supabase/functions/send-profit-notification/index.ts`

**Greeting text**:
- Verify and fix if using purple instead of dark gray

**Footer branding**:
- Standardize to "Tesla Stock Platform"

---

### 6. `supabase/functions/send-referral-notification/index.ts`

**Review and fix**:
- Greeting text color
- Section headers
- Footer branding consistency

---

### 7. `supabase/functions/send-trade-closed/index.ts`

**Review and fix**:
- Greeting text color
- Section headers
- Footer branding consistency

---

### 8. `supabase/functions/send-withdrawal-confirmation/index.ts`

**Review and fix**:
- Greeting text color
- Section headers
- Footer branding consistency

---

## Color Reference Guide

| Element | Color Code | Usage |
|---------|------------|-------|
| Greeting text | `#374151` | "Hello [Name]," |
| User name highlight | `#3b82f6` | Name inside greeting (optional accent) |
| Section headers | `#3b82f6` | "Withdrawal Details", "Investment Details" |
| Body text | `#374151` | Main paragraph content |
| Secondary text | `#6b7280` | Labels, captions |
| Success amounts | `#059669` | Money values (green) |
| Footer text | `#6b7280` | Copyright, disclaimers |

---

## Expected Result

All email templates will have:
- Consistent dark gray (`#374151`) greeting text on light backgrounds
- Electric Blue (`#3b82f6`) section headers for brand recognition
- "Tesla Stock Platform" branding in all footers
- Professional, cohesive appearance across all user communications

---

## Files Count: 8 edge functions to update

