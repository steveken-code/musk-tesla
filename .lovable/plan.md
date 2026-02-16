

## Improve Team Avatar Upload UI + Image Quality

### Overview

The admin panel already has team avatar upload functionality, but the upload area is small and the landing page avatar images lack quality attributes (no explicit dimensions, no eager loading). This plan enhances the admin UI to make uploading real photos more prominent and improves the rendering quality of the 3 landing avatars.

### Changes

**File: `src/components/admin/AdminChatPanel.tsx`**

1. **Enlarge the existing team member avatar display** from `w-9 h-9` to `w-12 h-12` so uploaded photos are more visible in the admin panel
2. **Add a camera/upload icon overlay** on each team member avatar to make it obvious they are clickable for photo upload
3. **Add "Click photo to change" helper text** below each avatar to guide the admin
4. **Improve the image rendering** with `loading="eager"`, explicit `width/height` attributes, and `imageRendering: 'auto'` style to prevent pixelation

**File: `src/components/LiveChatWidget.tsx`**

1. **Add quality attributes to the 3 landing page avatars** (lines 762-767): add `width={72}`, `height={72}`, `loading="eager"`, and `style={{ imageRendering: 'auto' }}` so uploaded real photos render crisp and clear instead of blurry
2. **Same fix for header avatars** (lines 1359-1364): add quality attributes there too

### Technical Details

- No database changes needed -- the existing `specialist_settings` JSON in `admin_settings` table and the `avatars` storage bucket already handle everything
- The avatar images are already uploaded to the public `avatars` bucket with correct paths (`team/{timestamp}-{index}.{ext}`)
- These are purely UI improvements: bigger upload targets in admin, sharper rendering in the chat widget
- No new dependencies needed
