
# Plan: Create Shared Email Template Constants & Fix Branding Issues

## Overview

Create a centralized email constants file to prevent future styling inconsistencies and fix the "Tesla Investment Platform" branding issue in the referral notification email.

---

## Issues Found

| File | Issue | Current | Fix |
|------|-------|---------|-----|
| `send-referral-notification/index.ts` | Subject line (Line 65) | "Tesla Investment Platform" | "Tesla Stock Platform" |
| `send-referral-notification/index.ts` | Welcome heading (Line 183) | "Tesla Investment Platform" | "Tesla Stock Platform" |

The `send-withdrawal-status` template is already correctly styled with:
- Greeting: `#374151` (dark gray)
- Section headers: `#3b82f6` (Electric Blue)
- Footer: "Tesla Stock Platform"

---

## Changes Required

### New File: `supabase/functions/_shared/email-constants.ts`

Create a centralized constants file that all email templates can import:

```typescript
// Branding
export const PLATFORM_NAME = "Tesla Stock Platform";
export const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
export const DASHBOARD_URL = "https://msktesla.net/dashboard";
export const WHATSAPP_DEFAULT = "+12186500840";

// Colors - Light Theme (white background)
export const COLORS = {
  // Text
  greetingText: "#374151",        // Dark gray - "Hello Name,"
  bodyText: "#374151",            // Dark gray - paragraph text
  secondaryText: "#6b7280",       // Medium gray - labels, captions
  mutedText: "#9ca3af",           // Light gray - disclaimers
  darkText: "#111827",            // Near black - important values
  
  // Accents
  sectionHeader: "#3b82f6",       // Electric Blue - section titles
  userNameHighlight: "#3b82f6",   // Electric Blue - name highlights (optional)
  successAmount: "#059669",       // Green - money values
  successText: "#166534",         // Dark green - success messages
  
  // Backgrounds
  cardBackground: "#f9fafb",      // Light gray - card backgrounds
  footerBackground: "#f9fafb",    // Light gray - footer
  
  // Borders
  cardBorder: "#e5e7eb",          // Light border
  divider: "#e5e7eb",             // Row dividers
  
  // Tesla Red (primary brand)
  teslaRed: "#dc2626",
  teslaRedDark: "#b91c1c",
  teslaRedDarkest: "#991b1b",
};

// Header gradient (Tesla Red)
export const HEADER_GRADIENT = "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)";

// Common styles
export const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
```

---

### File: `supabase/functions/send-referral-notification/index.ts`

#### Fix 1: Update Subject Line (Line 65)

**Current:**
```typescript
subject = '🎉 New Referral Signup - Tesla Investment Platform';
```

**Updated:**
```typescript
subject = '🎉 New Referral Signup - Tesla Stock Platform';
```

#### Fix 2: Update Welcome Heading (Line 183)

**Current:**
```typescript
<h2 style="color: #3b82f6; margin: 0 0 20px; font-size: 24px;">Welcome to Tesla Investment Platform!</h2>
```

**Updated:**
```typescript
<h2 style="color: #3b82f6; margin: 0 0 20px; font-size: 24px;">Welcome to Tesla Stock Platform!</h2>
```

---

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/_shared/email-constants.ts` | **CREATE** - New shared constants file |
| `supabase/functions/send-referral-notification/index.ts` | **UPDATE** - Fix 2 branding references |

---

## Benefits of Shared Constants

1. **Single source of truth** - Change colors/branding in one place
2. **Consistency** - All emails use the same values
3. **Easier maintenance** - Future updates only require changing constants file
4. **Prevents typos** - Import constants instead of hardcoding hex codes
5. **Documentation** - Constants file serves as a style guide

---

## Color Reference (Standardized)

| Element | Color | Hex Code |
|---------|-------|----------|
| Greeting text | Dark Gray | `#374151` |
| Body text | Dark Gray | `#374151` |
| Section headers | Electric Blue | `#3b82f6` |
| User name highlight | Electric Blue | `#3b82f6` |
| Money amounts | Green | `#059669` |
| Success text | Dark Green | `#166534` |
| Labels/captions | Medium Gray | `#6b7280` |
| Disclaimers | Light Gray | `#9ca3af` |
| Tesla Red (header) | Red | `#dc2626` |

