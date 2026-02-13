

## Fix Slow Chat Loading + Specialist Image Clarity

---

### 1. Fix Slow Chat Loading (N+1 Query Problem)

**Root cause:** When loading conversations (lines 98-147 in `AdminChatPanel.tsx`), the code loops through every conversation and makes **2 separate database queries per conversation** -- one for unread count and one for last message preview. With 20 conversations, that is 40+ sequential queries, causing major delays.

**Fix:** Replace the per-conversation loop with **two batch queries**:

- **Batch unread counts:** A single query fetching all unread user messages grouped by conversation_id, then counting in JS
- **Batch last messages:** Use a single RPC call or fetch recent messages across all conversations in one query, then map them by conversation_id

Alternatively, use a simpler approach:
- Fetch all unread messages (sender_type='user', is_read=false) in one query, then group by conversation_id in JS
- Fetch the latest message per conversation using a single query with `ORDER BY created_at DESC` and deduplication in JS

This reduces ~40 queries down to **3 total queries** (conversations + unread messages + last messages).

**File:** `src/components/admin/AdminChatPanel.tsx` (lines 98-147)

---

### 2. Fix Specialist Image Blurriness

**Root cause:** In `Admin.tsx` line 2097, when uploading the specialist image, it is stored in the `avatars` bucket. The image URL gets a cache-buster appended (`?t=${Date.now()}`). The blur is likely caused by:

1. The image being compressed/resized by the storage bucket
2. The preview in admin uses a `w-14 h-14` container (56x56px) which is fine, but the chat widget uses `w-7 h-7` (28px) containers for message avatars and `w-10 h-10` (40px) for the header -- these are small enough that any compression artifact becomes visible

**Fix:**
- Ensure the specialist image in the chat header uses a slightly larger rendered size with explicit `width`/`height` attributes to request proper resolution
- Add `loading="eager"` and remove any potential lazy-loading that could cause placeholder blur
- Ensure `object-cover` is consistently applied (already done in most places, but verify the admin preview at line 2067)

**File:** `src/components/LiveChatWidget.tsx` (avatar rendering lines)

---

### Technical Summary

**Files to modify:**
- `src/components/admin/AdminChatPanel.tsx` -- Replace N+1 conversation loop with batch queries
- `src/components/LiveChatWidget.tsx` -- Minor image rendering improvements for clarity

**No database or edge function changes needed.**

