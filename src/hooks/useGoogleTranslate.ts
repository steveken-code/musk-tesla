import { useCallback, useEffect, useState, useRef } from 'react';

// Language code mapping to Google Translate codes
const googleLangMap: Record<string, string> = {
  'en': 'en',
  'de': 'de',
  'fr': 'fr',
  'es': 'es',
  'it': 'it',
  'nl': 'nl',
  'pt': 'pt',
  'pl': 'pl',
  'cs': 'cs',
  'sk': 'sk',
  'hu': 'hu',
  'ro': 'ro',
  'el': 'el',
  'sl': 'sl',
  'et': 'et',
  'sv': 'sv',
  'no': 'no',
  'da': 'da',
  'fi': 'fi',
  'zh': 'zh-CN',
  'ja': 'ja',
  'ko': 'ko',
  'hi': 'hi',
  'th': 'th',
  'vi': 'vi',
  'ar': 'ar',
  'tr': 'tr',
  'ru': 'ru',
  'id': 'id',
  'ms': 'ms',
  'tl': 'tl',
  'my': 'my',
  'bn': 'bn',
  'ta': 'ta',
  'te': 'te',
  'ur': 'ur',
  'ne': 'ne',
  'he': 'iw',
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

const STORAGE_KEY = 'google-translate-language';

export const useGoogleTranslate = () => {
  const [isReady, setIsReady] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const hasRestoredRef = useRef(false);

  // Trigger translation with the Google Translate widget
  const triggerTranslation = useCallback((langCode: string) => {
    const googleCode = googleLangMap[langCode] || langCode;
    const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (gtCombo) {
      setIsTranslating(true);
      gtCombo.value = googleCode;
      gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        setIsTranslating(false);
      }, 2500);
      return true;
    }
    return false;
  }, []);

  // Check if Google Translate widget is ready
  useEffect(() => {
    const checkReady = () => {
      const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      const gtFrame = document.querySelector('.goog-te-menu-frame');
      
      if (gtCombo) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (checkReady()) return;

    // Poll more frequently for widget readiness
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 200);

    // Extend timeout to 20 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Restore language on mount when Google Translate is ready
  useEffect(() => {
    if (!isReady || hasRestoredRef.current) return;

    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && savedLang !== 'en') {
      hasRestoredRef.current = true;
      
      // Wait longer for React to fully render all content (2 seconds)
      const timeout = setTimeout(() => {
        triggerTranslation(savedLang);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isReady, triggerTranslation]);

  // Re-trigger translation for dynamic content (call after route changes or new content loads)
  const retriggerTranslation = useCallback(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && savedLang !== 'en') {
      // Small delay to allow DOM updates
      setTimeout(() => {
        triggerTranslation(savedLang);
      }, 500);
    }
  }, [triggerTranslation]);

  const setLanguage = useCallback((langCode: string) => {
    const googleCode = googleLangMap[langCode] || langCode;
    
    // Save to localStorage for persistence
    localStorage.setItem(STORAGE_KEY, langCode);
    
    // If resetting to English, clear the translation
    if (langCode === 'en') {
      // Reset Google Translate by clearing the cookie and reloading
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
      
      // Try to find and click the "Show original" button
      const frame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
      if (frame?.contentDocument) {
        const button = frame.contentDocument.querySelector('.goog-te-button button') as HTMLButtonElement;
        if (button) {
          button.click();
          return true;
        }
      }
      
      // Alternative: Set to original via combo
      const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (gtCombo) {
        gtCombo.value = '';
        gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
        // Reload to fully reset
        setTimeout(() => window.location.reload(), 500);
        return true;
      }
      return false;
    }
    
    // Set the new language
    setIsTranslating(true);
    
    const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtCombo) {
      gtCombo.value = googleCode;
      gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        setIsTranslating(false);
      }, 2500);
      
      return true;
    }
    
    // Alternative: Try using the Google Translate frame
    const frame = document.querySelector('.goog-te-menu-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      const links = frame.contentDocument.querySelectorAll('a');
      links.forEach((link) => {
        if (link.getAttribute('href')?.includes(googleCode)) {
          link.click();
        }
      });
      
      setTimeout(() => {
        setIsTranslating(false);
      }, 2500);
      
      return true;
    }

    setIsTranslating(false);
    return false;
  }, []);

  const resetToOriginal = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    hasRestoredRef.current = false;
    
    // Clear translation cookies
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
    
    // Reset to original language
    const frame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      const button = frame.contentDocument.querySelector('.goog-te-button button') as HTMLButtonElement;
      if (button) {
        button.click();
        return true;
      }
    }
    
    // Alternative: Reload the page
    window.location.reload();
    return true;
  }, []);

  const getSavedLanguage = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }, []);

  return { 
    setLanguage, 
    resetToOriginal, 
    isReady, 
    isTranslating, 
    getSavedLanguage,
    retriggerTranslation 
  };
};
