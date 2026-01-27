import { useEffect, useRef, useState, useCallback } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LanguageSelectorModal from './LanguageSelectorModal';

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: new (config: {
          pageLanguage: string;
          includedLanguages?: string;
          layout?: number;
          autoDisplay?: boolean;
        }, elementId: string) => void;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

// Map language codes to display names
const languageCodeToDisplay: Record<string, string> = {
  'en': 'EN',
  'es': 'ES',
  'fr': 'FR',
  'de': 'DE',
  'zh-CN': 'ZH',
  'zh-TW': 'ZH',
  'ru': 'RU',
  'ar': 'AR',
  'hi': 'HI',
  'pt-BR': 'PT',
  'pt-PT': 'PT',
  'ja': 'JA',
  'ko': 'KO',
  'it': 'IT',
  'nl': 'NL',
  'pl': 'PL',
  'tr': 'TR',
  'vi': 'VI',
  'th': 'TH',
  'uk': 'UK',
};

const GoogleTranslate = () => {
  const initialized = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const translationCheckInterval = useRef<number | null>(null);

  // Get current language from Google Translate cookie
  const detectCurrentLanguage = useCallback(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLanguage(match[1]);
    } else {
      setCurrentLanguage('en');
    }
  }, []);

  // Comprehensive function to hide all Google Translate UI elements
  const hideGoogleTranslateUI = useCallback(() => {
    // Hide banner frame (the top bar)
    const bannerFrame = document.querySelector('.goog-te-banner-frame') as HTMLElement;
    if (bannerFrame) {
      bannerFrame.style.display = 'none';
      bannerFrame.style.visibility = 'hidden';
      bannerFrame.style.height = '0';
    }

    // Hide all skiptranslate elements (popup boxes)
    document.querySelectorAll('.skiptranslate').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.id?.includes('google_translate_element')) {
        htmlEl.style.display = 'none';
        htmlEl.style.visibility = 'hidden';
        htmlEl.style.height = '0';
      }
    });

    // Hide tooltips and popups
    const elementsToHide = [
      '#goog-gt-tt',
      '.goog-te-balloon-frame',
      '.goog-tooltip',
      '.goog-te-menu-frame',
      '.goog-te-spinner-pos'
    ];
    
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    });

    // Reset body position that Google Translate might have changed
    document.body.style.top = '0';
    document.body.style.position = 'static';
    document.documentElement.style.marginTop = '0';
    
    // Remove any margin-top from html that translation adds
    const computedStyle = window.getComputedStyle(document.documentElement);
    if (computedStyle.marginTop !== '0px') {
      document.documentElement.style.marginTop = '0';
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Define the callback before loading the script
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            // Empty string = all languages supported
            includedLanguages: '',
            // Layout 0 = dropdown only (no inline)
            layout: 0,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        
        // Force translation on page load if cookie exists
        setTimeout(() => {
          const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
          if (match && match[1] && match[1] !== 'en') {
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo) {
              combo.value = match[1];
              combo.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          hideGoogleTranslateUI();
        }, 500);
        
        // Start monitoring for translation UI elements
        setTimeout(hideGoogleTranslateUI, 100);
        setTimeout(hideGoogleTranslateUI, 1000);
        setTimeout(hideGoogleTranslateUI, 2000);
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add comprehensive CSS to hide Google Translate UI and ensure translation works
    const style = document.createElement('style');
    style.id = 'google-translate-custom-styles';
    style.textContent = `
      /* Completely hide Google branding banner */
      .goog-te-banner-frame,
      .goog-te-banner-frame.skiptranslate,
      iframe.goog-te-banner-frame {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Prevent page shifts */
      body {
        top: 0 !important;
        position: static !important;
      }
      
      html.translated-ltr,
      html.translated-rtl,
      html[class*="translated"] {
        margin-top: 0 !important;
        padding-top: 0 !important;
      }
      
      /* Keep the translate element functional but visually hidden */
      #google_translate_element {
        position: fixed !important;
        bottom: -9999px !important;
        left: -9999px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      
      /* Ensure the combo box is accessible for programmatic control */
      #google_translate_element .goog-te-combo {
        pointer-events: auto !important;
      }
      
      /* Hide skip translate containers except our main element */
      body > .skiptranslate:not(#google_translate_element),
      .skiptranslate:not(#google_translate_element) {
        display: none !important;
        height: 0 !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Hide all Google UI elements */
      .goog-te-spinner-pos,
      .goog-logo-link,
      #goog-gt-tt,
      .goog-tooltip,
      .goog-tooltip-content,
      .goog-te-balloon-frame,
      .goog-te-menu-frame,
      .goog-te-menu2,
      .goog-te-menu-value,
      .goog-te-gadget-icon,
      .goog-te-gadget img,
      .VIpgJd-ZVi9od-ORHb-OEVmcd,
      .VIpgJd-ZVi9od-l4eHX-hSRGPd,
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
      #goog-gt-,
      [id^="goog-gt-"] {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Hide text highlight effects from translation hover */
      .goog-text-highlight {
        background-color: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
      
      /* Ensure translated text looks natural */
      font[style*="vertical-align: inherit"] {
        vertical-align: baseline !important;
      }
      
      /* Hide the gadget simple but keep combo functional */
      .goog-te-gadget-simple {
        position: absolute !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      
      /* Smooth page transition */
      body.translating {
        opacity: 0.7;
        transition: opacity 0.2s ease-out;
        pointer-events: none;
      }
      
      body.translated {
        opacity: 1;
        transition: opacity 0.3s ease-in;
      }
      
      /* Hide Google's floating widgets and popups */
      .goog-te-ftab-frame,
      #\\:1\\.container,
      div[id^=":"][id$=".container"],
      iframe[src*="translate.google"],
      .goog-te-spinner-pos {
        display: none !important;
      }
      
      /* Disable the default browser translation bar prompt */
      html {
        translate: no;
      }
    `;
    document.head.appendChild(style);
    
    // Add meta tag to prevent browser's built-in translation prompt
    const metaTranslate = document.createElement('meta');
    metaTranslate.name = 'google';
    metaTranslate.content = 'notranslate';
    // We actually WANT Google Translate to work, so remove this if it blocks it
    // document.head.appendChild(metaTranslate);

    // Continuous monitoring to hide any Google UI that appears
    const monitoringInterval = setInterval(hideGoogleTranslateUI, 300);
    
    // Stop aggressive monitoring after 5 seconds, then check less frequently
    setTimeout(() => {
      clearInterval(monitoringInterval);
      // Continue checking but less frequently
      setInterval(hideGoogleTranslateUI, 2000);
    }, 5000);

    // Check for language changes
    const interval = setInterval(detectCurrentLanguage, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(monitoringInterval);
    };
  }, [detectCurrentLanguage, hideGoogleTranslateUI]);

  // Apply translation on initial load if cookie exists
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1] && match[1] !== 'en') {
      setCurrentLanguage(match[1]);
      document.body.classList.add('translated');
    }
  }, []);

  const handleLanguageSelect = (code: string) => {
    setIsTranslating(true);
    setModalOpen(false);
    
    // Add translating class for smooth transition
    document.body.classList.add('translating');
    document.body.classList.remove('translated');
    
    // Clear any existing googtrans cookies on all possible domains
    const hostname = window.location.hostname;
    const clearCookies = () => {
      const paths = ['/', ''];
      const domains = [hostname, '.' + hostname, ''];
      
      paths.forEach(path => {
        domains.forEach(domain => {
          const domainPart = domain ? `; domain=${domain}` : '';
          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path || '/'}${domainPart}`;
        });
      });
    };
    
    clearCookies();
    
    // Set the new Google Translate cookie
    if (code === 'en') {
      // For English, just clear and reload
      setCurrentLanguage('en');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return;
    }
    
    // Set new language cookies on multiple domain configurations for cross-browser support
    const setCookies = (langCode: string) => {
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${hostname}`;
      if (hostname.includes('.')) {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${hostname}`;
      }
    };
    
    setCookies(code);
    setCurrentLanguage(code);
    
    // Try to trigger Google Translate directly via the combo box
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (combo) {
      // Set value and trigger change
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Monitor for translation completion
      let checkCount = 0;
      const maxChecks = 30; // 3 seconds max
      
      translationCheckInterval.current = window.setInterval(() => {
        checkCount++;
        hideGoogleTranslateUI();
        
        // Check if body has translated class or max time reached
        const isTranslated = document.documentElement.classList.contains('translated-ltr') ||
                            document.documentElement.classList.contains('translated-rtl');
        
        if (isTranslated || checkCount >= maxChecks) {
          if (translationCheckInterval.current) {
            clearInterval(translationCheckInterval.current);
          }
          setIsTranslating(false);
          document.body.classList.remove('translating');
          document.body.classList.add('translated');
          hideGoogleTranslateUI();
        }
      }, 100);
      
      // Fallback: ensure we exit translating state
      setTimeout(() => {
        if (translationCheckInterval.current) {
          clearInterval(translationCheckInterval.current);
        }
        setIsTranslating(false);
        document.body.classList.remove('translating');
        document.body.classList.add('translated');
        hideGoogleTranslateUI();
      }, 3000);
    } else {
      // Combo not ready - reload the page to apply translation
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  };

  const displayCode = languageCodeToDisplay[currentLanguage] || currentLanguage.toUpperCase().substring(0, 2);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={() => setModalOpen(true)}
            disabled={isTranslating}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-muted hover:border-electric-blue/50 transition-all duration-200 cursor-pointer group disabled:opacity-70 disabled:cursor-wait"
            aria-label="Select Language"
          >
            {isTranslating ? (
              <Loader2 className="w-4 h-4 text-electric-blue animate-spin shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-electric-blue group-hover:text-electric-blue transition-colors shrink-0" />
            )}
            <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
              {displayCode}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <p className="text-sm">{isTranslating ? 'Translating...' : 'Translate Page'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Hidden Google Translate element - must exist in DOM for translation to work */}
      <div 
        id="google_translate_element" 
        aria-hidden="true"
        style={{ 
          position: 'absolute', 
          top: '-9999px', 
          left: '-9999px', 
          visibility: 'hidden',
          height: 0,
          overflow: 'hidden'
        }}
      />

      <LanguageSelectorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentLanguage={currentLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
    </TooltipProvider>
  );
};

export default GoogleTranslate;
