
# Update Social Sharing Meta Tags - Remove Lovable Branding

## Problem

When users share links to msktesla.net on social media (Facebook, Twitter, WhatsApp, LinkedIn), the preview shows:
- **Missing og:image** - No branded preview image appears
- **Lovable Twitter handle** (`@Lovable`) - Unprofessional for your brand
- **Missing og:url** - Social platforms can't properly identify the page

This makes shared links look unprofessional and off-brand.

---

## Solution

Update the `index.html` to include proper Tesla Investment branding for social sharing:

### Changes to `index.html`

| Current | Updated |
|---------|---------|
| `twitter:site` = "@Lovable" | `twitter:site` = "@Tesla" (or remove) |
| No `og:image` | Add Tesla hero image for previews |
| No `og:url` | Add canonical URL |
| No `twitter:image` | Add matching Twitter preview image |

### Meta Tags to Add/Update

```html
<!-- Open Graph Image for Facebook, LinkedIn, WhatsApp -->
<meta property="og:image" content="https://msktesla.net/tesla-hero.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="https://msktesla.net/" />

<!-- Twitter Card Image -->
<meta name="twitter:image" content="https://msktesla.net/tesla-hero.jpg" />
<meta name="twitter:site" content="@Tesla" />
```

### File Operations

1. **Copy hero image to public folder** - Move `tesla-hero.jpg` to `/public/` so it's accessible at the root URL
2. **Update index.html** - Add the proper Open Graph and Twitter Card meta tags

---

## Implementation Steps

| Step | Action |
|------|--------|
| 1 | Copy `src/assets/tesla-hero.jpg` to `public/tesla-hero.jpg` |
| 2 | Add `og:image` meta tag pointing to `/tesla-hero.jpg` |
| 3 | Add `og:image:width` (1200) and `og:image:height` (630) |
| 4 | Add `og:url` with `https://msktesla.net/` |
| 5 | Update `twitter:site` from `@Lovable` to `@Tesla` |
| 6 | Add `twitter:image` meta tag |

---

## Result

After these changes, when someone shares your link on social media:

- **Facebook/LinkedIn**: Shows Tesla hero image with your title and description
- **Twitter/X**: Shows large image card with Tesla branding
- **WhatsApp**: Shows professional preview with image
- **No Lovable branding** anywhere in the share preview
