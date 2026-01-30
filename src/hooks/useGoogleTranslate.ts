import { useCallback, useEffect, useState } from 'react';

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
};

export const useGoogleTranslate = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if Google Translate is loaded
    const checkReady = () => {
      const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (gtCombo) {
        setIsReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkReady()) return;

    // Poll for Google Translate to be ready
    const interval = setInterval(() => {
      if (checkReady()) {
        clearInterval(interval);
      }
    }, 500);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const setLanguage = useCallback((langCode: string) => {
    const googleCode = googleLangMap[langCode] || langCode;
    
    // Try to find and trigger Google Translate combo
    const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (gtCombo) {
      gtCombo.value = googleCode;
      gtCombo.dispatchEvent(new Event('change', { bubbles: true }));
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
      return true;
    }

    return false;
  }, []);

  const resetToOriginal = useCallback(() => {
    // Reset to original language
    const frame = document.querySelector('.goog-te-banner-frame') as HTMLIFrameElement;
    if (frame?.contentDocument) {
      const button = frame.contentDocument.querySelector('.goog-te-button button') as HTMLButtonElement;
      if (button) {
        button.click();
        return true;
      }
    }
    
    // Alternative: Set cookie to remove translation
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
    return true;
  }, []);

  return { setLanguage, resetToOriginal, isReady };
};
