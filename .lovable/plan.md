

## Fix Visibility of Join Greeting & Session Timeout Settings on Mobile

### Problem
The "Join Greeting Message" textarea and "Session Timeout" input in the admin chat settings panel use dark backgrounds (bg-slate-800) with light text (text-white) and dark labels (text-slate-300/400). On mobile devices, this low-contrast combination makes the text nearly invisible, especially on screens with varying brightness.

### Solution
Apply the same high-contrast visibility pattern already used elsewhere in the admin panel: **white/light backgrounds with bold dark text at full opacity**, ensuring labels, inputs, hints, and values are all clearly readable on any device.

### Changes

**File: `src/components/admin/AdminChatPanel.tsx`** (lines 526-570)

1. **Settings panel container**: Change from `bg-slate-700/50` to a solid light background (`bg-white/95 dark:bg-slate-800`) with a visible border
2. **Labels** ("Join Greeting Message", "Session Timeout"): Change from `text-slate-300` to bold dark text with forced opacity (`text-gray-900 dark:text-white font-semibold` with `style={{ opacity: 1 }}`)
3. **Hint text** ("Use {{name}}...", "Inactive sessions..."): Change from `text-slate-400` to `text-gray-600 dark:text-gray-300` with forced opacity
4. **Textarea** (greeting message): Change from `bg-slate-800 text-white` to `bg-white border-slate-400 text-black` with forced color (`style={{ color: '#000', opacity: 1 }}`)
5. **Timeout number input**: Same treatment -- white background, dark text, forced opacity
6. **"min" label**: Change from `text-slate-400` to dark visible text
7. **Divider border**: Lighten for contrast against new background

This matches the admin UI visibility standard already enforced on other admin forms (e.g., KYC fields, search inputs).

