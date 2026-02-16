

## Fix: Make Team Avatars Card Always Visible in Admin Chat Tab

### The Problem

The Team Avatars card you added is invisible because it has a condition: it only shows when `teamMembers` already exists and has items. But your database currently has no `teamMembers` saved yet -- so the card never appears. It's a chicken-and-egg problem.

### The Fix

**File: `src/pages/Admin.tsx`**

1. **Remove the conditional render** -- The card currently wraps in `{(specialistSettings.teamMembers || []).length > 0 && (...)}`. Remove this condition so the card always shows.

2. **Default to 3 empty team member slots** -- When `teamMembers` is empty or missing, automatically populate 3 default placeholder members (e.g., "Agent 1", "Agent 2", "Agent 3" with empty photos). This way, even on first load, the admin sees 3 avatar slots ready to be filled.

3. **Initialize defaults on load** -- In the data fetch logic (around line 437), if `teamMembers` is empty/missing, set it to 3 default members:
   - Member 1: name "Agent 1", role "Support Agent", imageUrl ""
   - Member 2: name "Agent 2", role "Support Agent", imageUrl ""
   - Member 3: name "Agent 3", role "Support Agent", imageUrl ""

4. **Make names editable inline** -- Add small text inputs below each avatar so the admin can also rename the agents directly from this card (not just change photos).

### What You Will See

After this fix, when you go to Admin > Chat tab and scroll down past the "Customer Support Specialist" card, you will always see the Team Avatars card with 3 avatar slots -- even if no photos have been uploaded yet. Each slot shows a camera icon placeholder, and you can click to upload, then hit "Save Avatars".

### Files Modified

- `src/pages/Admin.tsx` -- Remove conditional, add default team members, make names editable

