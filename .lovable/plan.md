

## Make Chat Header Show Team Avatars (Intercom-Style)

### What Changes

When no specialist has joined the conversation yet, the chat window header will display the **stacked team avatars** (the same ones from the landing screen) instead of the generic support icon. This creates a consistent, professional Intercom-like feel across all chat steps. Once a specialist joins, the header switches to show that specific specialist's photo and name (existing behavior).

Also removing the "3 specialists available" text from the landing screen as requested -- replacing it with a cleaner, more professional tagline.

### Changes in Detail

**File: `src/components/LiveChatWidget.tsx`**

1. **Header area (lines 1286-1310)**: When `specialistJoined` is false, replace the single avatar circle with a mini stacked avatar group (3 small overlapping circles, ~28px each) inside the header. When `specialistJoined` is true, keep the current single specialist avatar behavior.

2. **Landing screen (lines 768-773)**: Remove the "{totalSpecialists} specialists available" line. Replace with a cleaner subtitle like "We typically reply under {replyTime}" -- no specialist count shown.

3. **Remove the large support icon** from the landing screen top (line 714) since the team avatars already serve that purpose, making the layout cleaner.

### Visual Result

**Header (before specialist joins):**
```text
+------------------------------------------+
| [Av1][Av2][Av3]  Support Center      [X] |
| (green dot) Typically replies under 30m   |
+------------------------------------------+
```

**Header (after specialist joins):**
```text
+------------------------------------------+
| [Specialist Photo]  Sarah Mitchell   [X] |
| (green dot) Active                        |
+------------------------------------------+
```

**Landing screen (cleaned up):**
```text
+----------------------------------+
|  [Avatar1][Avatar2][Avatar3] ... |
|                                  |
|  Support Center                  |
|  Questions? Chat with us.        |
|  (green dot) We typically reply  |
|  under 30 minutes                |
+----------------------------------+
```

### Technical Details

- Reuse the existing `teamAvatars` array for the header display
- Header avatars will be smaller (28px) with tighter overlap (-8px spacing) to fit the header bar
- White border on avatars for contrast against the blue gradient header
- No new dependencies or database changes needed

