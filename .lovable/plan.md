

# Configurable Auto-Reply Greeting from Admin Panel

## Overview
Replace the hardcoded proactive greeting in the chat widget with admin-configurable messages stored in the database. Admins will be able to set separate greetings for guests and logged-in users, with variable support (`{{user_name}}`), character limits, and a live preview.

## Changes

### 1. Admin Panel -- Chat Greeting Settings
Add a "Chat Greeting Settings" card above the `AdminChatPanel` in the chat tab of `src/pages/Admin.tsx`. This card will contain:

- A toggle between "Default Greeting" and "Custom Auto-Reply"
- Two text areas (max 300 characters each):
  - **Guest greeting** -- shown to unauthenticated visitors
  - **Logged-in user greeting** -- shown to authenticated users (supports `{{user_name}}`)
- A character counter below each textarea
- A "Preview" button that shows exactly how the message will render in the chat bubble
- A "Save" button that persists to `admin_settings` with key `chat_greeting_settings`

### 2. LiveChatWidget -- Fetch greeting from database
Update the proactive greeting logic in `src/components/LiveChatWidget.tsx` to:
- Fetch the `chat_greeting_settings` from `admin_settings` on mount
- If custom mode is enabled, use the appropriate message (guest vs logged-in)
- Replace `{{user_name}}` with the user's name if logged in
- Fall back to the current hardcoded `getGreeting()` if no custom setting exists or if "Default" mode is selected

### 3. No database migration needed
The `admin_settings` table already supports arbitrary JSON in `setting_value`. We just add a new `setting_key = 'chat_greeting_settings'`.

---

## Technical Details

### Files to modify
- `src/pages/Admin.tsx` -- add greeting settings UI in the chat tab
- `src/components/LiveChatWidget.tsx` -- fetch and use admin-configured greeting

### Data shape stored in `admin_settings`

```json
{
  "setting_key": "chat_greeting_settings",
  "setting_value": {
    "mode": "custom",
    "guestGreeting": "Welcome to Tesla Stock Platform! A verified support agent will be with you shortly.",
    "userGreeting": "Welcome back, {{user_name}}! How can we assist you today? A verified agent will be with you shortly."
  }
}
```

### Admin UI (in Admin.tsx chat tab)

```text
+---------------------------------------------+
| Chat Greeting Settings                      |
|---------------------------------------------|
| Mode: [Default] [Custom]                    |
|                                             |
| Guest Greeting:                             |
| +------------------------------------------+|
| | Welcome to Tesla Stock...                ||
| +------------------------------------------+|
| 58/300 characters                           |
|                                             |
| Logged-in User Greeting:                    |
| +------------------------------------------+|
| | Welcome back, {{user_name}}! ...         ||
| +------------------------------------------+|
| 72/300 characters                           |
| Supports: {{user_name}}                     |
|                                             |
| [Preview]  [Save]                           |
+---------------------------------------------+
```

The settings card is rendered above `<AdminChatPanel />` inside the `activeTab === 'chat'` block. It follows the same styling patterns as existing settings sections (slate-800 card, slate-700 borders, electric-blue accents).

### Loading and saving logic (Admin.tsx)

- On mount (`loadSettings`), fetch `chat_greeting_settings` from `admin_settings` alongside other settings
- Save uses the existing upsert pattern (check if exists, then update or insert)
- State: `chatGreetingSettings` with `{ mode, guestGreeting, userGreeting }`

### LiveChatWidget.tsx changes

- Add a `useEffect` that fetches `admin_settings` where `setting_key = 'chat_greeting_settings'` (using the anon-accessible read -- the table's RLS already allows reads for `authenticated` and we need to add anon read for this specific key, or fetch via a simple select since admin_settings may already be readable)
- In the proactive greeting `useEffect`, use the fetched greeting instead of `getGreeting()`
- Replace `{{user_name}}` with `profileData?.full_name || 'there'` for logged-in users
- Keep `getGreeting()` as the fallback when no custom setting exists

### RLS consideration
The `admin_settings` table likely only allows admin access. We need to allow anon/authenticated users to SELECT rows where `setting_key = 'chat_greeting_settings'`. This will be done via a new RLS policy:

```sql
CREATE POLICY "Anyone can read chat greeting settings"
  ON admin_settings FOR SELECT
  USING (setting_key = 'chat_greeting_settings');
```

This is safe because it only exposes the greeting text, not sensitive admin settings.
