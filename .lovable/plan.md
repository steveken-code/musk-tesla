

## Make the Team Avatars Section More Prominent in Admin Chat Panel

### Where It Is

The Team Avatars row is located in the **Admin Panel > Chat tab > left sidebar**, just above the conversation list. It's the horizontal row of circular photos with names underneath. Currently it has a tiny "TEAM AVATARS" uppercase label and a thin bottom border -- easy to miss.

### What Changes

**File: `src/components/admin/AdminChatPanel.tsx` (lines 733-834)**

Make the section visually stand out with:

1. **Prominent header** -- Replace the tiny 10px uppercase label with a proper header using an icon (Users icon) + "Support Team" title + a subtitle "Click to upload or change photos"
2. **Distinct border and background** -- Add a rounded border container (`border border-slate-600 rounded-lg`) with a slightly brighter background (`bg-slate-800/80`) and inner padding, so it looks like a dedicated card/panel rather than a subtle divider
3. **Add margin spacing** -- Add `mx-3 my-3` so the card floats inside the sidebar with visible separation from edges
4. **Electric-blue accent** -- Add a small electric-blue left border or top accent line to match the platform's visual identity standard

### No Functional Changes

- The upload, remove, and save logic stays exactly the same
- No database or storage changes
- Only the wrapper/container styling and header label are updated
