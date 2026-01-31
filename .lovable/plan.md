

# Replace Favicon with Clean Tesla Logo for Android Sharing

## Current Issue

The favicon in `index.html` (line 49) points to an external Google Storage URL which may still show the old icon or display incorrectly on Android sharing. The uploaded Tesla logo has a transparent background which is perfect for a clean favicon.

---

## Solution

Replace the current favicon with your uploaded Tesla logo image, properly optimized for Android sharing and browser tabs.

### Implementation Steps

| Step | Action |
|------|--------|
| 1 | Copy your uploaded Tesla logo to `public/tesla-favicon.png` |
| 2 | Update `index.html` favicon link to use the local file with cache-busting |
| 3 | Add Apple Touch Icon for iOS home screen (uses same image) |

---

## File Changes

### Step 1: Copy Image Asset

Copy `user-uploads://new_tesla-removebg-preview_1.png` to `public/tesla-favicon.png`

### Step 2: Update `index.html`

**Replace line 49:**
```html
<!-- Current -->
<link rel="icon" type="image/png" href="https://storage.googleapis.com/gpt-engineer-file-uploads/RgeOmCMpxub19VnIJaaDhiTqRR62/uploads/1769857052987-new_tesla-removebg-preview (1).png">

<!-- New - Local file with cache-busting -->
<link rel="icon" type="image/png" href="/tesla-favicon.png?v=3">
```

**Add Apple Touch Icon (after favicon line):**
```html
<link rel="apple-touch-icon" href="/tesla-favicon.png?v=3">
```

---

## Why This Works

| Aspect | Solution |
|--------|----------|
| **Transparent background** | Your PNG has no white BG - will display cleanly on any device theme |
| **Local file** | No dependency on external Google Storage URL |
| **Cache-busting `?v=3`** | Forces Android and all browsers to fetch the new icon immediately |
| **Apple Touch Icon** | Ensures iOS devices also use the Tesla logo when adding to home screen |

---

## Result

After publishing:
- **Browser tabs**: Show red Tesla "T" logo on dark/light backgrounds
- **Android home screen**: Clean Tesla logo with transparent background
- **iOS home screen**: Same clean Tesla logo
- **WhatsApp/sharing previews**: Tesla branding throughout

