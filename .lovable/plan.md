
# Live Chat Widget -- Icon, Scrollbar, and Professional Animations

## Changes

### 1. Replace support icon with new headset agent image
- Copy `user-uploads://live_img-removebg-preview-2.png` to `src/assets/live-support-icon.png` (overwrite)
- All references auto-update since they import from the same path

### 2. Reduce chat bubble size to match WhatsApp (w-12 h-12)
- Current: `w-14 h-14` -- too large compared to WhatsApp's `w-12 h-12`
- Change to `w-12 h-12` with matching image sizing, consistent with the WhatsApp button in `SupportButtons.tsx`

### 3. Add chat-scrollbar to admin panel
- Add the `chat-scrollbar` class to the messages container in `AdminChatPanel.tsx` (line 327: `overflow-y-auto p-4 space-y-3`)

### 4. Professional avatar animations (Framer Motion)

**Entrance (3-second delay):**
- Chat bubble slides in from bottom-right with spring physics after a 3s delay
- Uses `localStorage` flag `chat-avatar-visited` so the entrance animation only plays once per session

**Idle state (subtle bounce):**
- After entrance, the bubble enters a gentle infinite bounce (`y: [0, -4, 0]`) every 3 seconds to signal "I'm here"

**Alert state (new message):**
- When `unreadCount > 0`, the bubble does a quick scale pulse animation to draw attention

### 5. Multilingual greeting
- Detect browser language via `navigator.language`
- Show localized "Hello!" and "How can we help you?" in the empty chat state
- Supported: EN, ES, FR, DE, ZH (fallback to EN)

---

## Technical Details

### Files to modify
- **Copy**: `user-uploads://live_img-removebg-preview-2.png` to `src/assets/live-support-icon.png`
- **Modify**: `src/components/LiveChatWidget.tsx` -- bubble size, animations, multilingual greetings
- **Modify**: `src/components/admin/AdminChatPanel.tsx` -- add `chat-scrollbar` class

### Chat bubble animation variants
```tsx
const hasVisited = localStorage.getItem('chat-avatar-visited');

const bubbleVariants = {
  hidden: { y: 60, opacity: 0, scale: 0.8 },
  visible: {
    y: 0, opacity: 1, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15, delay: hasVisited ? 0 : 3 }
  },
  idle: {
    y: [0, -4, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};
// Set visited flag after first render
useEffect(() => { localStorage.setItem('chat-avatar-visited', 'true'); }, []);
```

### Bubble size reduction
```tsx
// From w-14 h-14 to w-12 h-12 (matching WhatsApp)
className="... w-12 h-12 ..."
<img src={liveSupportIcon} className="w-12 h-12 object-cover" />
```

### Multilingual greeting data
```tsx
const getGreeting = () => {
  const lang = navigator.language.split('-')[0];
  const translations: Record<string, { hi: string; help: string }> = {
    en: { hi: "Hello there!", help: "How can we help you?" },
    es: { hi: "Hola!", help: "Como podemos ayudarte?" },
    fr: { hi: "Bonjour !", help: "Comment pouvons-nous vous aider ?" },
    de: { hi: "Hallo!", help: "Wie konnen wir Ihnen helfen?" },
    zh: { hi: "你好!", help: "我们能为您提供什么帮助？" },
  };
  return translations[lang] || translations['en'];
};
```

### Admin panel scrollbar (line 327)
```tsx
// Add chat-scrollbar class
<div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-3">
```
