

## Add Team Avatars Management Card in Admin Chat Tab

### The Problem

The 3 team avatars (shown to guests on the chat widget welcome screen) are currently editable only inside the tiny chat sidebar panel. You want them in a proper, full-width card in the admin Chat tab -- the same area where "Support Agent Profile" and "Customer Support Specialist" cards are -- so you can clearly see the photos, change them, and save.

### What Changes

**File: `src/pages/Admin.tsx`**

Add a new **"Team Avatars"** card between the "Customer Support Specialist" card (line 2118) and the `AdminChatPanel` component (line 2122). This card will:

1. Show all 3 team member avatars in a horizontal row, each displayed at a large size (80x80px) so the photos are clearly visible
2. Below each photo: the member's name and role
3. Click on any photo to upload a replacement image from your device
4. A small "x" button on each avatar to remove the current photo
5. A single **"Save Avatars"** button at the bottom that saves all changes to the database
6. When saved, the new photos immediately appear on the chat widget for guests/users

**File: `src/components/admin/AdminChatPanel.tsx`**

Remove the duplicate "Support Team" avatar row from the chat sidebar (lines 733-839) since it's now managed in the main Admin.tsx card above. This keeps the sidebar clean with just conversations.

### How It Works

- Uses the existing `specialistSettings.teamMembers` array (same data source)
- Uploads photos to the existing `avatars` storage bucket
- Saves to `specialist_settings` in `admin_settings` table
- The `LiveChatWidget` already reads from this data, so new photos appear automatically
- No database changes needed

### Visual Layout

```text
+--------------------------------------------------+
|  Team Avatars                                     |
|  Manage the photos shown on the chat widget       |
|                                                   |
|   [Photo 1]      [Photo 2]      [Photo 3]        |
|   Sarah M.       James W.       Lisa C.           |
|   Senior Agent   Agent          Agent             |
|                                                   |
|   [ Save Avatars ]                                |
+--------------------------------------------------+
```

### Files Modified

- `src/pages/Admin.tsx` -- Add the Team Avatars card
- `src/components/admin/AdminChatPanel.tsx` -- Remove the sidebar avatar row (no longer needed)
