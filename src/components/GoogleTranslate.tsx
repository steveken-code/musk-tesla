import { useEffect, useRef, useState, useCallback } from 'react';
import { Globe } from 'lucide-react';
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

  // Get current language from Google Translate cookie
  const detectCurrentLanguage = useCallback(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLanguage(match[1]);
    } else {
      setCurrentLanguage('en');
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
            includedLanguages: '',
            layout: 0,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles to completely hide Google Translate widget and auto-dismiss bar
    const style = document.createElement('style');
    style.id = 'google-translate-custom-styles';
    style.textContent = `
      /* Hide Google branding banner completely */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; position: static !important; }
      
      /* Prevent page jumps when translating */
      html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }
      
      /* Keep the translate element functional but visually hidden */
      #google_translate_element {
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        visibility: hidden !important;
      }
      
      /* Hide the "Powered by Google" and skip translate elements */
      body > .skiptranslate { 
        display: none !important; 
        height: 0 !important;
        visibility: hidden !important;
      }
      .goog-te-spinner-pos { display: none !important; }
      .goog-logo-link { display: none !important; }
      
      /* Auto-dismiss any floating translation bars */
      #goog-gt-tt { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      
      /* Hide the gadget simple but keep combo functional */
      .goog-te-gadget-simple { 
        position: absolute !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Smooth page transition after language change */
      body.translating {
        opacity: 0;
        transition: opacity 0.3s ease-out;
      }
      body.translated {
        opacity: 1;
        transition: opacity 0.4s ease-in;
      }
    `;
    document.head.appendChild(style);

    // Auto-dismiss any Google Translate bars that appear
    const autoDismissTranslateBar = () => {
      // Hide banner frame
      const bannerFrame = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (bannerFrame) {
        bannerFrame.style.display = 'none';
      }
      
      // Hide any skiptranslate elements except the main translate element
      const skipTranslate = document.querySelectorAll('body > .skiptranslate');
      skipTranslate.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.display = 'none';
        htmlEl.style.height = '0';
        htmlEl.style.visibility = 'hidden';
      });
      
      // Reset body position
      document.body.style.top = '0';
      document.body.style.position = 'static';
      
      // Remove margin-top from html
      document.documentElement.style.marginTop = '0';
    };
    
    // Run auto-dismiss immediately and periodically
    autoDismissTranslateBar();
    const dismissInterval = setInterval(autoDismissTranslateBar, 500);
    
    // Stop checking after 3 seconds (translation should be complete)
    setTimeout(() => {
      clearInterval(dismissInterval);
      autoDismissTranslateBar();
      document.body.classList.remove('translating');
      document.body.classList.add('translated');
    }, 3000);

    // Check for language changes
    const interval = setInterval(detectCurrentLanguage, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(dismissInterval);
    };
  }, [detectCurrentLanguage]);

  // Smooth transition effect when language changes
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1] && match[1] !== 'en') {
      document.body.classList.add('translated');
    }
  }, []);

  const handleLanguageSelect = (code: string) => {
    // Add translating class for smooth transition out
    document.body.classList.add('translating');
    document.body.classList.remove('translated');
    
    // Clear any existing googtrans cookies first
    const hostname = window.location.hostname;
    const domains = [hostname, '.' + hostname, ''];
    
    domains.forEach(domain => {
      if (domain) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      } else {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      }
    });
    
    // Set the new Google Translate cookie
    if (code === 'en') {
      // For English, clear the cookie to reset
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    } else {
      // Set new language
      document.cookie = `googtrans=/en/${code}; path=/`;
      document.cookie = `googtrans=/en/${code}; path=/; domain=${hostname}`;
    }
    
    setCurrentLanguage(code);
    
    // Try to trigger Google Translate directly via the combo box
    const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Give time for translation to apply, then fade back in
      setTimeout(() => {
        document.body.classList.remove('translating');
        document.body.classList.add('translated');
      }, 1500);
    } else {
      // Fallback: Reload the page to apply translation
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  };

  const displayCode = languageCodeToDisplay[currentLanguage] || currentLanguage.toUpperCase().substring(0, 2);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={() => setModalOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-muted hover:border-electric-blue/50 transition-all duration-200 cursor-pointer group"
            aria-label="Select Language"
          >
            <Globe className="w-4 h-4 text-electric-blue group-hover:text-electric-blue transition-colors shrink-0" />
            <span className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
              {displayCode}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <p className="text-sm">Translate Page</p>
        </TooltipContent>
      </Tooltip>

      {/* Hidden Google Translate element - must exist in DOM for translation to work */}
      <div 
        id="google_translate_element" 
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', visibility: 'hidden' }}
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
