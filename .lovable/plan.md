

# Live Chat Widget Mobile and UX Fixes

## Issues Found

1. **Long messages can overflow** -- The message bubble uses `whitespace-pre-wrap` but lacks `word-break: break-word` or `overflow-wrap: break-word`, meaning very long unbroken strings (like URLs) can extend outside the bubble container.

2. **Chat bubble icon positioning** -- The chat bubble sits at `bottom-24` which overlaps with the WhatsApp support button at `bottom-6`. Need to adjust spacing so they don't overlap.

3. **Messages area scrolling** -- The messages container needs `-webkit-overflow-scrolling: touch` for smoother iOS scrolling.

4. **File picker buttons not fully activated** -- The "Photo Library", "Take Photo", and "Choose File" buttons all work via hidden file inputs, but "Photo Library" and "Choose File" both point to the same `fileInputRef`. "Choose File" should accept all file types (not just images) to differentiate it, or at minimum use a different `accept` attribute.

5. **Header subtitle** -- "We typically reply instantly" text needs to be updated to "Tesla Stock Platform" as requested.

---

## Changes

### File: `src/components/LiveChatWidget.tsx`

1. **Fix message text overflow**: Add `break-words overflow-hidden` to message bubble text to prevent long words/URLs from exceeding the bubble width.

2. **Update header subtitle**: Change "We typically reply instantly" to "Tesla Stock Platform".

3. **Improve messages scroll area**: Add `-webkit-overflow-scrolling: touch` style for smooth iOS scrolling.

4. **Differentiate file picker options**:
   - "Photo Library" -- `accept="image/*"` (gallery only, no capture)
   - "Take a Photo" -- `accept="image/*" capture="environment"` (camera)
   - "Choose File" -- `accept="image/*,.pdf,.doc,.docx"` (broader file types)

5. **Fix chat bubble positioning**: Move from `bottom-24` to `bottom-[88px]` to sit above the WhatsApp button without overlapping.

6. **Add word-break CSS to message bubbles**: Apply `break-all` or `overflow-wrap: anywhere` so long unbroken text wraps inside the bubble.

### File: `src/components/admin/AdminChatPanel.tsx`

1. **Fix message text overflow**: Same `break-words` fix for admin-side message bubbles.

2. **Differentiate file picker options**: Same fix as user widget -- separate accept types for the three buttons.

---

## Technical Details

### Message bubble overflow fix (both files)
```tsx
// Current
<p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>

// Fixed - add overflow-wrap
<p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
```

Also add `overflow-hidden` to the outer bubble container to prevent any edge-case overflow.

### File picker differentiation
```tsx
// Dedicated file input for "Choose File" with broader accept
<input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />

// Separate gallery input (images only, no capture)
<input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

// Camera input stays the same
<input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
```

### Header text update
```tsx
<p className="text-white/70 text-[11px] truncate">Tesla Stock Platform</p>
```

### Scroll smoothness
```tsx
<div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-muted/30"
  style={{ WebkitOverflowScrolling: 'touch' }}>
```

### Files to modify
- `src/components/LiveChatWidget.tsx` -- 6 targeted edits
- `src/components/admin/AdminChatPanel.tsx` -- 2 targeted edits

