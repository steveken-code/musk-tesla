

## Make the 3 Chat Avatars Editable from Admin Panel

### Overview

The admin panel already has avatar upload functionality hidden inside the Settings gear dropdown, but it's buried among other settings. This plan creates a dedicated, prominent "Team Avatars" section directly visible in the admin chat panel (not hidden behind a toggle), with larger preview images so uploaded photos are clearly visible.

### What Changes

**File: `src/components/admin/AdminChatPanel.tsx`**

1. **Extract the 3 team avatar cards into a dedicated, always-visible section** at the top of the conversations sidebar (above the conversation list), showing exactly 3 avatar slots in a horizontal row
2. Each slot shows:
   - A large circular preview (64x64px) of the current uploaded photo, or a placeholder with a camera icon if empty
   - The specialist's name and role below
   - Click anywhere on the avatar to upload/replace the photo
   - A small "x" button to remove the photo
3. This section is always visible (not hidden behind the gear icon) so the admin can immediately see and manage the 3 faces that appear on the chat widget
4. Keep the existing team management in the settings panel for adding/removing members and editing names/roles, but the quick avatar preview row is always shown

**File: `src/components/LiveChatWidget.tsx`**

5. No changes needed -- the widget already reads `teamMembers` from `specialist_settings` and renders their `imageUrl` with high-quality attributes. Once the admin uploads photos via the improved admin UI, they automatically appear in the chat widget.

### Technical Details

- Uses the existing `avatars` storage bucket (public) and the existing `specialist_settings` JSON in `admin_settings` table
- The upload logic already works (upload to `team/{timestamp}-{index}.{ext}`, get public URL, save to specialist_settings)
- This is purely a UI reorganization: moving the avatar previews out of the hidden settings panel into a prominent always-visible row
- No database changes, no new dependencies
- Images render with `width={64} height={64} loading="eager"` and `object-cover` for crisp display

