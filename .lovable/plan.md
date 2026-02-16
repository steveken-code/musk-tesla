

## Enhance Live Chat Support to Look Like a Real Support Center

### What We're Building

Transform the chat support experience to feel like a professional, real support system with multiple specialists -- similar to how Intercom or Zendesk looks. Here's what changes:

### 1. Multi-Avatar "Team Available" Display

Instead of showing just one specialist avatar, the chat widget's landing/header area will display **3 stacked avatars** (overlapping circles) with a **"+3 more" dots indicator**, giving the impression of a full support team standing by.

- The 3 avatars will come from admin-configurable settings (stored in the database)
- If fewer than 3 are configured, fallback placeholder avatars will fill the gaps
- A subtle "3 dots" or "+N" badge shows there are more specialists available

### 2. Admin Panel: Manage Multiple Specialist Avatars

Currently the admin can only set ONE specialist name and ONE avatar. We'll expand this to support a **team roster** of up to 5 specialists:

- Each specialist entry has: **Name**, **Avatar (photo upload)**, and **Role** (e.g. "Senior Support Agent")
- The admin can add/remove specialists from the list
- The first specialist in the list is the "primary" one who actually joins conversations
- All avatars are used for the team display on the user-facing widget
- The existing `specialist_settings` key in `admin_settings` will be extended to store an array of specialists alongside the current single-specialist fields (backward compatible)

### 3. Specialist Join Card Enhancement

When the specialist joins, the notification card will now use the **actual specialist's avatar** from the roster (already partially working) and include their role/title for extra professionalism.

---

### How It Will Look (User Side)

```text
+----------------------------------+
|  [Avatar1][Avatar2][Avatar3] ... |
|  Tesla Support Team              |
|  "3 specialists available"       |
|                                  |
|  Hi there! How can we help?      |
+----------------------------------+
```

When specialist joins:
```text
+----------------------------------+
|  [Specialist Photo]              |
|  Sarah Mitchell                  |
|  Senior Support Agent            |
|  has joined the conversation     |
+----------------------------------+
```

### How It Will Look (Admin Side)

New "Support Team" section in the greeting settings panel:
```text
+----------------------------------+
| Support Team Avatars             |
| [Photo1] Sarah M.    [X Remove] |
| [Photo2] James K.    [X Remove] |
| [Photo3] Lisa R.     [X Remove] |
| [+ Add Specialist]              |
+----------------------------------+
```

---

### Technical Details

**Database**: No new tables needed. The existing `admin_settings` table with `setting_key = 'specialist_settings'` will be extended. The `setting_value` JSON will include a new `teamMembers` array:

```json
{
  "specialistName": "Sarah Mitchell",
  "specialistImageUrl": "https://...",
  "joinGreeting": "Hello! My name is {{name}}...",
  "teamMembers": [
    { "name": "Sarah Mitchell", "imageUrl": "https://...", "role": "Senior Support Agent" },
    { "name": "James Kim", "imageUrl": "https://...", "role": "Support Specialist" },
    { "name": "Lisa Rodriguez", "imageUrl": "https://...", "role": "Support Agent" }
  ]
}
```

**Files to modify**:

1. **`src/components/LiveChatWidget.tsx`**
   - Update the `SpecialistProfile` interface to include `teamMembers` array
   - Fetch and store team members from settings
   - Render stacked avatar group (3 overlapping circles) on the landing screen and header
   - Add "+N more" indicator with animated dots
   - Update the specialist join card to show the role/title

2. **`src/components/admin/AdminChatPanel.tsx`**
   - Add a "Support Team" management section in the greeting settings panel
   - Allow adding up to 5 team members with name, photo upload, and role
   - Save/load team members to/from `specialist_settings`
   - Each team member gets a photo upload button that uploads to the existing `avatars` storage bucket

3. **`src/components/LiveChatWidget.tsx` (Landing screen)**
   - Replace the single avatar with a stacked avatar group component
   - Show "N specialists available" text below the avatars
   - Animate the avatars with a subtle scale-in effect

**Storage**: Uses the existing `avatars` bucket (admin already has full access per existing RLS policies).

**Backward Compatibility**: If `teamMembers` is not set, the system falls back to the single `specialistName`/`specialistImageUrl` fields, so nothing breaks for existing setups.

