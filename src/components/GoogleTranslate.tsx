import { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

const GoogleTranslate = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Define the callback before loading the script
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,it,pt,ru,zh-CN,zh-TW,ja,ko,ar,hi,th,vi,nl,pl,tr,sv,da,no,fi,cs,hu,ro,el,he,id,ms,tl,uk,bg,hr,sk,sl,et,lv,lt',
          layout: 0, // SIMPLE layout
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setIsLoaded(true);
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add custom styles to hide Google Translate branding
    const style = document.createElement('style');
    style.textContent = `
      .goog-te-banner-frame { display: none !important; }
      .goog-te-gadget { font-size: 0 !important; }
      .goog-te-gadget img { display: none !important; }
      .goog-te-gadget-simple { 
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        font-size: 0 !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value {
        color: inherit !important;
        font-family: inherit !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span {
        color: hsl(var(--foreground)) !important;
        font-size: 12px !important;
        font-weight: 500 !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span:nth-child(3) {
        display: none !important;
      }
      .goog-te-menu-frame {
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
      }
      body { top: 0 !important; }
      .skiptranslate { display: none !important; }
      #google_translate_element .goog-te-gadget-simple {
        display: inline-flex !important;
        align-items: center !important;
        gap: 4px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 min-w-[80px] h-8 px-2.5 border-border/50 bg-transparent hover:bg-muted/50"
        onClick={() => {
          const translateElement = document.querySelector('.goog-te-gadget-simple') as HTMLElement;
          if (translateElement) {
            translateElement.click();
          }
        }}
      >
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium hidden sm:inline">Translate</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </Button>
      
      {/* Hidden Google Translate element */}
      <div 
        id="google_translate_element" 
        className="absolute opacity-0 pointer-events-none top-0 left-0 w-0 h-0 overflow-hidden"
      />
    </div>
  );
};

export default GoogleTranslate;