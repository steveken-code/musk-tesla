

# Fix Lovable Branding - Replace Favicon & Force WhatsApp Refresh

## Problem Identified

| Issue | Location | Status |
|-------|----------|--------|
| Favicon shows Lovable heart | Browser tab, Android home screen | **Needs fix** |
| WhatsApp preview shows old data | Link preview card | **Cached - needs refresh** |
| og:image meta tag | index.html | Already fixed |
| twitter:image meta tag | index.html | Already fixed |

---

## Solution

### Part 1: Replace Favicon with Tesla Logo

The current `public/favicon.ico` is still the Lovable heart. We need to replace it with a Tesla logo.

**Change in `index.html`:**
```html
<!-- Current (Lovable favicon via external URL) -->
<link rel="icon" type="image/x-icon" href="https://storage.googleapis.com/gpt-engineer-file-uploads/...">

<!-- New (Tesla logo from project assets) -->
<link rel="icon" type="image/png" href="/tesla-favicon.png">
```

**File Operations:**
1. Copy `src/assets/tesla-logo.png` to `public/tesla-favicon.png`
2. Update `index.html` to point to the local Tesla favicon

### Part 2: Force WhatsApp Cache Refresh

WhatsApp caches link previews for 7-30 days. To force an immediate refresh, you need to:

1. **Add a cache-busting parameter to the og:image URL** (temporary trick):
   ```html
   <meta property="og:image" content="https://msktesla.net/tesla-hero.jpg?v=2" />
   ```

2. **After publishing**, share this exact link in WhatsApp to test:
   ```
   https://msktesla.net/?v=2
   ```
   The query parameter forces WhatsApp to fetch fresh metadata.

---

## Implementation Steps

| Step | Action |
|------|--------|
| 1 | Copy `src/assets/tesla-logo.png` to `public/tesla-favicon.png` |
| 2 | Update favicon link in `index.html` to use local Tesla logo |
| 3 | Add cache-busting `?v=2` parameter to og:image and twitter:image URLs |
| 4 | Publish the site |
| 5 | Test by sharing `https://msktesla.net/?v=2` in WhatsApp |

---

## File Changes

### `index.html`

**Favicon update (line ~48):**
```html
<!-- Replace external Lovable favicon with Tesla logo -->
<link rel="icon" type="image/png" href="/tesla-favicon.png">
```

**Cache-busting for images (lines ~35-40):**
```html
<meta property="og:image" content="https://msktesla.net/tesla-hero.jpg?v=2" />
<meta name="twitter:image" content="https://msktesla.net/tesla-hero.jpg?v=2" />
```

---

## Result

After these changes:

| Element | Before | After |
|---------|--------|-------|
| Browser tab icon | Lovable heart | Tesla "T" logo |
| Android home screen | Lovable heart | Tesla "T" logo |
| WhatsApp preview | Cached old data | Fresh Tesla hero image |
| Share appearance | Unprofessional | Professional Tesla branding |

