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
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: '',
          layout: 0,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles to completely hide Google Translate widget and auto-dismiss bar
    const style = document.createElement('style');
    style.textContent = `
      /* Hide Google branding banner completely */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; position: static !important; }
      
      /* Prevent page jumps when translating */
      html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }
      
      /* Hide the entire Google Translate gadget completely */
      #google_translate_element {
        position: fixed !important;
        top: -9999px !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      .goog-te-gadget-simple { display: none !important; }
      .goog-te-combo { display: none !important; }
      
      /* Hide the "Powered by Google" and skip translate elements */
      body > .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      .goog-logo-link { display: none !important; }
      
      /* Hide the Google Translate menu/popup that appears */
      .goog-te-menu-frame { display: none !important; }
      .goog-te-menu2 { display: none !important; }
      
      /* Auto-dismiss any floating translation bars */
      #goog-gt-tt { display: none !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
      
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
      
      // Hide any skiptranslate elements
      const skipTranslate = document.querySelectorAll('.skiptranslate');
      skipTranslate.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
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
    
    // Stop checking after 5 seconds (translation should be complete)
    setTimeout(() => {
      clearInterval(dismissInterval);
      // Final cleanup
      autoDismissTranslateBar();
      // Add translated class for smooth appearance
      document.body.classList.remove('translating');
      document.body.classList.add('translated');
    }, 3000);

    // Check for language changes
    const interval = setInterval(detectCurrentLanguage, 1000);

    return () => {
      clearInterval(interval);
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [detectCurrentLanguage]);

  // Smooth transition effect when language changes
  useEffect(() => {
    // Check if page just loaded after a language change
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1] && match[1] !== 'en') {
      // Page was translated, add smooth fade-in
      document.body.classList.add('translated');
    }
  }, []);

  const handleLanguageSelect = (code: string) => {
    // Add translating class for smooth transition out
    document.body.classList.add('translating');
    document.body.classList.remove('translated');
    
    // Set the Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${code}; path=/`;
    
    setCurrentLanguage(code);
    
    // Delay reload slightly for smooth fade-out effect
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
            <div 
              id="google_translate_element" 
              className="hidden"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <p className="text-sm">Translate Page</p>
        </TooltipContent>
      </Tooltip>

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
