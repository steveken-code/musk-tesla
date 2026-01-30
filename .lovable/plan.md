

# Expand Language Selector & Debug Translation System

## Overview
Add 25+ more languages to bring the total to 50+ supported languages, and fix any potential translation issues to ensure Google Translate works reliably across the site.

---

## Current State Analysis

| Component | Status |
|-----------|--------|
| Languages in Selector | 28 languages |
| Languages in Hook | 28 mapped to Google codes |
| Languages in Context Type | 28 in Language type union |
| Google Translate | Working but may have edge cases |

---

## Languages to Add (25 New)

### Southeast Asia & Pacific
| Code | Flag | Name | Native Name | Google Code |
|------|------|------|-------------|-------------|
| `id` | 🇮🇩 | Indonesian | Bahasa Indonesia | id |
| `ms` | 🇲🇾 | Malay | Bahasa Melayu | ms |
| `tl` | 🇵🇭 | Filipino | Tagalog | tl |
| `my` | 🇲🇲 | Burmese | မြန်မာ | my |

### South Asia
| Code | Flag | Name | Native Name | Google Code |
|------|------|------|-------------|-------------|
| `bn` | 🇧🇩 | Bengali | বাংলা | bn |
| `ta` | 🇮🇳 | Tamil | தமிழ் | ta |
| `te` | 🇮🇳 | Telugu | తెలుగు | te |
| `ur` | 🇵🇰 | Urdu | اردو | ur |
| `ne` | 🇳🇵 | Nepali | नेपाली | ne |

### Middle East & Africa
| Code | Flag | Name | Native Name | Google Code |
|------|------|------|-------------|-------------|
| `he` | 🇮🇱 | Hebrew | עברית | he |
| `fa` | 🇮🇷 | Persian | فارسی | fa |
| `sw` | 🇰🇪 | Swahili | Kiswahili | sw |
| `af` | 🇿🇦 | Afrikaans | Afrikaans | af |

### Eastern Europe & Central Asia
| Code | Flag | Name | Native Name | Google Code |
|------|------|------|-------------|-------------|
| `uk` | 🇺🇦 | Ukrainian | Українська | uk |
| `bg` | 🇧🇬 | Bulgarian | Български | bg |
| `hr` | 🇭🇷 | Croatian | Hrvatski | hr |
| `sr` | 🇷🇸 | Serbian | Српски | sr |
| `lt` | 🇱🇹 | Lithuanian | Lietuvių | lt |
| `lv` | 🇱🇻 | Latvian | Latviešu | lv |
| `ka` | 🇬🇪 | Georgian | ქართული | ka |
| `az` | 🇦🇿 | Azerbaijani | Azərbaycan | az |
| `kk` | 🇰🇿 | Kazakh | Қазақ | kk |
| `uz` | 🇺🇿 | Uzbek | O'zbek | uz |

### Others
| Code | Flag | Name | Native Name | Google Code |
|------|------|------|-------------|-------------|
| `ca` | 🇪🇸 | Catalan | Català | ca |
| `eu` | 🇪🇸 | Basque | Euskara | eu |

---

## Potential Translation Issues & Fixes

### Issue 1: Widget Not Ready on Fast Connections
**Problem:** Google Translate widget may not be fully initialized when trying to restore language on reload.

**Fix:** Increase polling frequency and add more robust readiness checks in `useGoogleTranslate.ts`.

### Issue 2: Language Not Persisting After Page Navigation (SPA)
**Problem:** Since this is a React SPA, route changes don't reload the page, but Google Translate state may be lost.

**Fix:** The current implementation already handles this by storing in localStorage and restoring on mount.

### Issue 3: Chinese Language Code
**Current:** `'zh': 'zh-CN'` (Simplified Chinese only)

**Add:** Also support Traditional Chinese `zh-TW` as a separate option.

### Issue 4: Type Safety
**Problem:** The `Language` type in LanguageContext doesn't include all new languages.

**Fix:** Update the type union to include all 50+ language codes.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/LanguageSelector.tsx` | Add 25+ new languages to the `languages` array |
| `src/hooks/useGoogleTranslate.ts` | Add 25+ new language codes to `googleLangMap` |
| `src/contexts/LanguageContext.tsx` | Update `Language` type to include all new codes |

---

## Implementation Details

### 1. LanguageSelector.tsx - Add New Languages

```typescript
const languages: Language[] = [
  // Existing 28 languages...
  
  // NEW: Southeast Asia & Pacific
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', flag: '🇲🇾', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'tl', flag: '🇵🇭', name: 'Filipino', nativeName: 'Tagalog' },
  { code: 'my', flag: '🇲🇲', name: 'Burmese', nativeName: 'မြန်မာ' },
  
  // NEW: South Asia
  { code: 'bn', flag: '🇧🇩', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ne', flag: '🇳🇵', name: 'Nepali', nativeName: 'नेपाली' },
  
  // NEW: Middle East & Africa
  { code: 'he', flag: '🇮🇱', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'fa', flag: '🇮🇷', name: 'Persian', nativeName: 'فارسی' },
  { code: 'sw', flag: '🇰🇪', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'af', flag: '🇿🇦', name: 'Afrikaans', nativeName: 'Afrikaans' },
  
  // NEW: Eastern Europe & Central Asia
  { code: 'uk', flag: '🇺🇦', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'bg', flag: '🇧🇬', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', flag: '🇭🇷', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sr', flag: '🇷🇸', name: 'Serbian', nativeName: 'Српски' },
  { code: 'lt', flag: '🇱🇹', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'lv', flag: '🇱🇻', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'ka', flag: '🇬🇪', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'az', flag: '🇦🇿', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'kk', flag: '🇰🇿', name: 'Kazakh', nativeName: 'Қазақ' },
  { code: 'uz', flag: '🇺🇿', name: 'Uzbek', nativeName: "O'zbek" },
  
  // NEW: Traditional Chinese
  { code: 'zh-TW', flag: '🇹🇼', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  
  // NEW: Regional European
  { code: 'ca', flag: '🇪🇸', name: 'Catalan', nativeName: 'Català' },
  { code: 'eu', flag: '🇪🇸', name: 'Basque', nativeName: 'Euskara' },
];
```

### 2. useGoogleTranslate.ts - Add Google Code Mappings

```typescript
const googleLangMap: Record<string, string> = {
  // Existing mappings...
  
  // NEW mappings
  'id': 'id',
  'ms': 'ms',
  'tl': 'tl',
  'my': 'my',
  'bn': 'bn',
  'ta': 'ta',
  'te': 'te',
  'ur': 'ur',
  'ne': 'ne',
  'he': 'iw',  // Google uses 'iw' for Hebrew
  'fa': 'fa',
  'sw': 'sw',
  'af': 'af',
  'uk': 'uk',
  'bg': 'bg',
  'hr': 'hr',
  'sr': 'sr',
  'lt': 'lt',
  'lv': 'lv',
  'ka': 'ka',
  'az': 'az',
  'kk': 'kk',
  'uz': 'uz',
  'zh-TW': 'zh-TW',
  'ca': 'ca',
  'eu': 'eu',
};
```

### 3. LanguageContext.tsx - Update Type

```typescript
type Language = 'en' | 'ru' | 'fr' | 'de' | 'es' | 'zh' | 'zh-TW' | 'ar' | 'pt' | 'ja' | 'ko' | 'hi' | 'it' | 'tr' | 'vi' | 'th' | 'hu' | 'cs' | 'el' | 'pl' | 'ro' | 'da' | 'et' | 'fi' | 'nl' | 'no' | 'sk' | 'sl' | 'sv' | 'id' | 'ms' | 'tl' | 'my' | 'bn' | 'ta' | 'te' | 'ur' | 'ne' | 'he' | 'fa' | 'sw' | 'af' | 'uk' | 'bg' | 'hr' | 'sr' | 'lt' | 'lv' | 'ka' | 'az' | 'kk' | 'uz' | 'ca' | 'eu';
```

---

## Result After Changes

| Metric | Before | After |
|--------|--------|-------|
| Total Languages | 28 | 54 |
| Coverage | Europe, Americas, Major Asian | Global coverage including Africa, Central Asia |
| Chinese Variants | 1 (Simplified) | 2 (Simplified + Traditional) |
| RTL Languages | 1 (Arabic) | 3 (Arabic, Hebrew, Persian, Urdu) |

---

## Testing Recommendations

After implementation, test these scenarios:
1. Search for a new language (e.g., "Ukrainian") and select it
2. Verify the page translates correctly
3. Reload the page and verify translation persists
4. Switch back to English and verify content resets
5. Test RTL languages (Arabic, Hebrew, Persian) to ensure layout doesn't break

