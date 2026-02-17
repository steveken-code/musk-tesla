

## Polish Live Chat Landing Screen + Update Plan.md

### Changes Overview

Two files need updating: the plan document and the live chat widget's visual design for the landing screen resources section.

### 1. Update `.lovable/plan.md`

Mark the current plan as **completed** and document what was implemented (Hi there greeting, recent conversations, helpful resources, footer branding, FAQ interactivity).

### 2. Redesign Helpful Resources Cards (Professional Look)

**File:** `src/components/LiveChatWidget.tsx`

Replace the current emoji-based icons with proper SVG icons and the WhatsApp PNG asset for a polished, real-world feel:

| Item | Current | New |
|------|---------|-----|
| How do I make an investment? | 📈 emoji in blue circle | Lucide `TrendingUp` icon in a blue-50 circle |
| How do I withdraw funds? | 💸 emoji in blue circle | Lucide `Wallet` icon in a purple-50 circle |
| Account verification help | 🪪 emoji in blue circle | Lucide `ShieldCheck` icon in an amber-50 circle |
| Contact support via WhatsApp | 💬 emoji in green circle | Actual `whatsapp-icon.png` image (already in assets) |

### 3. Visual Enhancements to Resource Cards

- Each card gets a **distinct background tint** on the icon circle (blue, purple, amber, green) instead of all being the same blue-50
- The WhatsApp card uses the real WhatsApp logo image (`src/assets/whatsapp-icon.png`) rendered as an `<img>` tag inside the circle
- Icons rendered as Lucide React components (already installed) instead of emoji text
- Subtle left-accent color bar on hover for each card to add depth

### 4. Recent Conversations Polish

- Add a `MessageSquare` Lucide icon instead of the inline SVG for the conversation icon circle
- Give the circle a subtle blue-50 tint for consistency

### Technical Details

- Import `TrendingUp`, `Wallet`, `ShieldCheck`, `MessageSquare` from `lucide-react` (already available)
- Import `whatsappIcon` from `@/assets/whatsapp-icon.png`
- Replace the `faqItems` array to use component references or string identifiers for icon type instead of emoji strings
- Update the rendering logic to use Lucide components for non-WhatsApp items and `<img>` for the WhatsApp item
- Each icon circle gets its own tailored background color class
- No structural changes to the data flow or interactivity -- only visual presentation updates

