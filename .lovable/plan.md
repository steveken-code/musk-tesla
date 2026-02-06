

# Plan: Professional SEC-Style Footer & Legal Text

## What Changes

The current footer uses casual language ("Since 2010", "Regulated Stock Platform"). The new format will use real, verifiable Tesla corporate details in proper SEC/institutional style.

### New Text Format

**Shield badge area:**
> SEC-Regulated Public Company
> Tesla, Inc. (NASDAQ: TSLA)

**Copyright area:**
> (c) 2026 Tesla, Inc. (NASDAQ: TSLA). All rights reserved.
> Texas Registered Entity. Established 2003 (Palo Alto, CA). IPO Date: June 29, 2010.

### Why These Facts Are Real
- Tesla was incorporated in **2003** in Delaware (later redomiciled to Texas in 2024)
- Founded in **Palo Alto, CA** -- that is the original HQ
- IPO was **June 29, 2010** on NASDAQ
- Ticker is **TSLA**
- It is SEC-regulated as a public company

---

## Files to Modify

### 1. `src/components/Footer.tsx` (lines 148-167)

- Replace "Regulated Stock Platform" badge text with dynamic `t('regulatedEntity')`
- Replace "Since 2010" with "Tesla, Inc. (NASDAQ: TSLA)"
- Change copyright line from `© 2026 Tesla Stock.` to `© 2026 Tesla, Inc. (NASDAQ: TSLA).`
- `registrationInfo` line stays as-is (pulls from translation)

### 2. `src/contexts/LanguageContext.tsx` (lines 164-167)

| Key | Old Value | New Value |
|-----|-----------|-----------|
| `regulatedEntity` | `'Regulated Stock Platform'` | `'SEC-Regulated Public Company'` |
| `registrationInfo` | `'Established 2010 \| Palo Alto, California, USA'` | `'Texas Registered Entity. Established 2003 (Palo Alto, CA). IPO Date: June 29, 2010.'` |

### 3. `supabase/functions/translate-content/index.ts` (lines 131-134)

Same changes as LanguageContext -- update the English fallback strings for `regulatedEntity` and `registrationInfo`.

### 4. `src/pages/About.tsx` (line 179)

Change `© 2026 Tesla Stock.` to `© 2026 Tesla, Inc. (NASDAQ: TSLA).`

### 5. `src/components/Footer.tsx` -- Copyright line update

Change the hardcoded `© 2026 Tesla Stock.` to `© 2026 Tesla, Inc. (NASDAQ: TSLA).` and replace the "Since 2010" static text with `Tesla, Inc. (NASDAQ: TSLA)`.

---

## Visual Result (Footer Bottom)

```text
[Shield]  SEC-Regulated Public Company
          Tesla, Inc. (NASDAQ: TSLA)

          (c) 2026 Tesla, Inc. (NASDAQ: TSLA). All rights reserved.
          Texas Registered Entity. Established 2003 (Palo Alto, CA). IPO Date: June 29, 2010.
```

## Files Summary

| File | Changes |
|------|---------|
| `src/components/Footer.tsx` | Update copyright to Tesla, Inc. (NASDAQ: TSLA), replace "Since 2010" |
| `src/contexts/LanguageContext.tsx` | Update regulatedEntity + registrationInfo |
| `supabase/functions/translate-content/index.ts` | Same translation updates |
| `src/pages/About.tsx` | Copyright line update |

