

# Language Selector Enhancements

## Overview
Enhance the language selector with keyboard navigation, ensure localStorage persistence triggers Google Translate on page load, and update all red (primary) styling to Tesla Electric Blue for consistency with the design standards.

---

## Issues Identified

| Issue | Current State | Required Change |
|-------|---------------|-----------------|
| Keyboard Navigation | Not implemented | Add arrow key support |
| Persistence on Reload | Language saved but Google Translate not triggered | Trigger Google Translate on mount if language != 'en' |
| Red Styling | Uses `text-primary` (Tesla Red) | Change to `text-electric-blue` |

---

## Changes Summary

### 1. Add Keyboard Navigation
**File:** `src/components/LanguageSelector.tsx`

Add state for tracking the focused index and keyboard event handlers:

```tsx
const [focusedIndex, setFocusedIndex] = useState(-1);

// Add to the existing useEffect for keydown handling
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    setShowDropdown(false);
    setSearchQuery('');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    setFocusedIndex(prev => 
      prev < filteredLanguages.length - 1 ? prev + 1 : 0
    );
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setFocusedIndex(prev => 
      prev > 0 ? prev - 1 : filteredLanguages.length - 1
    );
  } else if (e.key === 'Enter' && focusedIndex >= 0) {
    e.preventDefault();
    handleSelect(filteredLanguages[focusedIndex].code);
  }
};
```

Add auto-scroll for focused item and visual focus indicator.

---

### 2. Trigger Google Translate on Page Load
**File:** `src/components/LanguageSelector.tsx`

Add useEffect to trigger Google Translate when component mounts if the stored language is not English:

```tsx
// Trigger Google Translate on mount if language is not English
useEffect(() => {
  if (language !== 'en') {
    // Small delay to ensure Google Translate is ready
    const timeout = setTimeout(() => {
      setGoogleTranslate(language);
    }, 1500);
    return () => clearTimeout(timeout);
  }
}, []); // Run only on mount
```

---

### 3. Change Red to Electric Blue
**File:** `src/components/LanguageSelector.tsx`

Update all `primary` color references to `electric-blue`:

| Line | Current | Updated |
|------|---------|---------|
| 110 | `text-primary` | `text-electric-blue` |
| 131 | `text-primary` | `text-electric-blue` |
| 152 | `focus:ring-primary/50 focus:border-primary/50` | `focus:ring-electric-blue/50 focus:border-electric-blue/50` |
| 174 | `bg-primary/10 border-l-primary` | `bg-electric-blue/10 border-l-electric-blue` |
| 180 | `text-primary` | `text-electric-blue` |
| 186 | `text-primary` | `text-electric-blue` |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LanguageSelector.tsx` | Add keyboard navigation, persistence trigger, change red to electric-blue |

---

## Technical Implementation

### Complete Updated LanguageSelector Structure

```tsx
const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const { setLanguage: setGoogleTranslate, isReady } = useGoogleTranslate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Trigger Google Translate on mount if language is not English
  useEffect(() => {
    if (language !== 'en' && isReady) {
      setGoogleTranslate(language);
    }
  }, [isReady]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;
      
      switch (e.key) {
        case 'Escape':
          setShowDropdown(false);
          setSearchQuery('');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev < filteredLanguages.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredLanguages.length - 1
          );
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < filteredLanguages.length) {
            e.preventDefault();
            handleSelect(filteredLanguages[focusedIndex].code);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, focusedIndex, filteredLanguages]);

  // Auto-scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('button');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  return (
    // Component JSX with electric-blue styling
  );
};
```

---

## Visual Changes

### Before (Red/Primary)
- Globe icon: Red
- Selected language highlight: Red border, red text
- Search focus ring: Red
- Checkmark: Red

### After (Electric Blue)
- Globe icon: Electric Blue
- Selected language highlight: Electric Blue border, blue text
- Search focus ring: Electric Blue
- Checkmark: Electric Blue
- Focused item (keyboard): Ring highlight in Electric Blue

---

## Accessibility Improvements

1. **Arrow Key Navigation**: Users can navigate the language list with Up/Down arrows
2. **Enter to Select**: Press Enter to select the focused language
3. **Escape to Close**: Press Escape to close the dropdown
4. **Focus Visible**: Keyboard-focused items have a visible ring indicator
5. **Auto-scroll**: Focused items automatically scroll into view

---

## Result After Changes

1. **Keyboard Accessible** - Full arrow key navigation with visual focus indicator
2. **Persistent Selection** - Language choice triggers Google Translate on page reload
3. **Consistent Styling** - All accents use Tesla Electric Blue instead of red
4. **Professional UX** - Matches the dashboard's electric-blue visual standard

