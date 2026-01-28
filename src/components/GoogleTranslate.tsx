import { useEffect, useRef, useState, useCallback } from 'react';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          multilanguagePage?: boolean;
        }, elementId: string) => void;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

const GoogleTranslate = () => {
  const initialized = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Hide Google Translate UI elements aggressively
  const hideGoogleUI = useCallback(() => {
    // Inject CSS if not already present
    if (!document.getElementById('gt-hide-styles')) {
      const style = document.createElement('style');
      style.id = 'gt-hide-styles';
      style.textContent = `
        .goog-te-banner-frame, .goog-te-balloon-frame, #goog-gt-tt, .goog-te-ftab-float,
        .goog-tooltip, .goog-tooltip:hover, .goog-text-highlight, .skiptranslate iframe,
        .goog-te-menu-value, .goog-te-gadget-icon, body > .skiptranslate,
        .goog-te-spinner-pos, div[id^="goog-gt-"], .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        iframe.goog-te-menu-frame, iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        body { top: 0 !important; position: static !important; }
        html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }
        #google_translate_element {
          position: fixed !important;
          bottom: -9999px !important;
          left: -9999px !important;
          opacity: 0 !important;
          z-index: -1 !important;
        }
        #google_translate_element .goog-te-combo {
          pointer-events: auto !important;
        }
        font[style*="vertical-align: inherit"] { vertical-align: baseline !important; }
        .goog-te-gadget-simple { display: none !important; }
      `;
      document.head.appendChild(style);
    }

    // Direct element hiding
    const elementsToHide = [
      '.goog-te-banner-frame',
      '#goog-gt-tt',
      '.goog-te-balloon-frame',
      '.goog-te-menu-frame',
      '.skiptranslate'
    ];
    
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.id?.includes('google_translate_element')) {
          htmlEl.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;';
        }
      });
    });

    // Reset body position
    document.body.style.top = '0';
    document.body.style.position = 'static';
    document.documentElement.style.marginTop = '0';
  }, []);

  // Trigger translation using the combo box
  const triggerTranslation = useCallback((langCode: string, attempt = 0) => {
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    
    if (combo && combo.options.length > 0) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Check if translation applied after a delay
      setTimeout(() => {
        const isTranslated = document.documentElement.classList.contains('translated-ltr') ||
                            document.documentElement.classList.contains('translated-rtl');
        
        if (isTranslated || langCode === 'en') {
          setIsTranslating(false);
          hideGoogleUI();
        } else if (attempt < 5) {
          triggerTranslation(langCode, attempt + 1);
        } else {
          // Force reload as last resort
          window.location.reload();
        }
      }, 800);
    } else if (attempt < 10) {
      // Combo not ready yet, retry
      setTimeout(() => triggerTranslation(langCode, attempt + 1), 300);
    } else {
      // Reload if combo never appears
      window.location.reload();
    }
  }, [hideGoogleUI]);

  // Initialize Google Translate
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    hideGoogleUI();

    // Get saved language from localStorage or cookie
    const savedLang = localStorage.getItem('selectedLanguage');
    const cookieMatch = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    const detectedLang = savedLang || cookieMatch?.[1] || 'en';
    setCurrentLanguage(detectedLang);

    // Create container if not exists
    let container = document.getElementById('google_translate_element');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google_translate_element';
      document.body.appendChild(container);
    }

    // Define init function
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'af,sq,am,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,zh-CN,zh-TW,hr,cs,da,nl,en,et,tl,fi,fr,gl,ka,de,el,gu,ht,ha,he,hi,hu,is,ig,id,ga,it,ja,jv,kn,kk,km,rw,ko,ku,ky,lo,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,or,ps,fa,pl,pt,pa,ro,ru,sm,sr,sn,sd,si,sk,sl,so,es,su,sw,sv,tg,ta,tt,te,th,tr,tk,uk,ur,ug,uz,vi,cy,xh,yi,yo,zu',
          layout: 0,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');

        // Apply saved language after init
        setTimeout(() => {
          if (detectedLang && detectedLang !== 'en') {
            triggerTranslation(detectedLang);
          }
          hideGoogleUI();
        }, 1000);
      }
    };

    // Load script
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }

    // Continuously hide Google UI
    const hideInterval = setInterval(hideGoogleUI, 500);
    setTimeout(() => {
      clearInterval(hideInterval);
      setInterval(hideGoogleUI, 3000);
    }, 10000);

    return () => clearInterval(hideInterval);
  }, [hideGoogleUI, triggerTranslation]);

  // Handle language selection
  const handleLanguageSelect = useCallback((code: string) => {
    setIsTranslating(true);
    setModalOpen(false);
    setCurrentLanguage(code);
    localStorage.setItem('selectedLanguage', code);

    // Clear existing cookies
    const hostname = window.location.hostname;
    const domains = ['', hostname, `.${hostname}`];
    domains.forEach(domain => {
      const domainPart = domain ? `; domain=${domain}` : '';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainPart}`;
    });

    if (code === 'en') {
      // Reset to English
      setIsTranslating(false);
      window.location.reload();
      return;
    }

    // Set new cookies
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${hostname}`;
    if (hostname.includes('.')) {
      document.cookie = `googtrans=/en/${code}; path=/; domain=.${hostname}`;
    }

    // Trigger translation
    triggerTranslation(code);
  }, [triggerTranslation]);

  // Get display code
  const getDisplayCode = () => {
    const codes: Record<string, string> = {
      'en': 'EN', 'es': 'ES', 'fr': 'FR', 'de': 'DE', 'ru': 'RU',
      'zh-CN': '中文', 'zh-TW': '繁體', 'ar': 'AR', 'hi': 'HI', 
      'pt-BR': 'PT', 'ja': 'JA', 'ko': 'KO', 'it': 'IT'
    };
    return codes[currentLanguage] || currentLanguage.toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setModalOpen(true)}
        disabled={isTranslating}
        className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground hover:bg-muted/50 px-2 py-1 h-8"
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">{getDisplayCode()}</span>
      </Button>

      {/* Hidden Google Translate container */}
      <div 
        id="google_translate_element" 
        aria-hidden="true"
        style={{ 
          position: 'fixed', 
          bottom: '-9999px', 
          left: '-9999px',
          visibility: 'hidden',
          opacity: 0
        }}
      />

      <LanguageSelectorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentLanguage={currentLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
    </>
  );
};

export default GoogleTranslate;