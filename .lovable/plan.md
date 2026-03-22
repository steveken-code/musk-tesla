

## Conditional Notification System

### What We're Building
A system where the admin can create a status alert (Active/Inactive toggle, subject line, body text) that displays on the user dashboard. Active = green success alert, Inactive = orange warning alert.

### Architecture
Uses the existing `admin_settings` table with a new key `dashboard_notification` storing `{ active: boolean, subject: string, message: string }`.

### Steps

**1. Add a "Notifications" tab to the Admin panel**
- Add `'notifications'` to the `activeTab` union type
- Create a new tab section with:
  - A toggle switch (Active/Inactive)
  - Subject line input field
  - Message body textarea
  - Save button
- Save/load from `admin_settings` with key `dashboard_notification`

**2. Create a `DashboardNotification` component**
- New file: `src/components/dashboard/DashboardNotification.tsx`
- On mount, fetches `dashboard_notification` from `admin_settings`
- If **Active**: renders a green success `Alert` with the subject as title and message as description
- If **Inactive**: renders an amber/orange warning `Alert` with the subject as title and message as description
- Users can dismiss the alert (stored in sessionStorage so it reappears next session)
- Subscribe to realtime changes on `admin_settings` so updates appear live

**3. Place the notification on the Dashboard**
- Import `DashboardNotification` in `Dashboard.tsx`
- Render it just above the `WelcomeCard` component

### Technical Details
- Uses existing `admin_settings` table — no database migration needed
- Uses existing shadcn `Alert`, `AlertTitle`, `AlertDescription` components
- Uses existing `Switch`, `Input`, `Textarea`, `Button` UI components
- Realtime subscription ensures users see updates without refreshing

