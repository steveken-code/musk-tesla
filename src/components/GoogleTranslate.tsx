import { useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Define the callback before loading the script
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          // Empty string = ALL supported languages (100+), sorted alphabetically by Google
          includedLanguages: '',
          layout: 0, // SIMPLE dropdown layout
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

    // Add custom styles to integrate with site design
    const style = document.createElement('style');
    style.textContent = `
      /* Hide Google branding banner completely */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; position: static !important; }
      
      /* Prevent page jumps when translating */
      html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }
      
      /* Hide the entire Google Translate gadget - we use our own globe icon */
      #google_translate_element { 
        position: absolute !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      }
      
      /* But keep the gadget clickable for programmatic access */
      .goog-te-gadget-simple { 
        position: absolute !important;
        opacity: 0 !important;
        width: 100% !important;
        height: 100% !important;
        top: 0 !important;
        left: 0 !important;
        cursor: pointer !important;
        z-index: 10 !important;
        pointer-events: auto !important;
      }
      
      /* Hide the "Powered by Google" and skip translate elements */
      body > .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      
      /* Style the dropdown menu iframe container */
      .goog-te-menu-frame {
        box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
        border-radius: 12px !important;
        border: 1px solid hsl(var(--border)) !important;
      }
      
      /* Dropdown menu styling */
      .goog-te-menu2 {
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 12px !important;
        max-height: 400px !important;
        overflow-y: auto !important;
        padding: 8px 0 !important;
      }
      .goog-te-menu2-item {
        padding: 10px 16px !important;
        font-size: 14px !important;
        font-family: inherit !important;
      }
      .goog-te-menu2-item:hover {
        background: hsl(var(--muted)) !important;
      }
      .goog-te-menu2-item span {
        color: hsl(var(--foreground)) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleGlobeClick = () => {
    // Find and click the Google Translate dropdown to open it
    const translateElement = document.querySelector('.goog-te-gadget-simple') as HTMLElement;
    if (translateElement) {
      translateElement.click();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            onClick={handleGlobeClick}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card/50 hover:bg-muted hover:border-electric-blue/50 transition-all duration-200 cursor-pointer group"
            aria-label="Select Language"
          >
            <Globe className="w-4 h-4 text-electric-blue group-hover:text-electric-blue transition-colors shrink-0 animate-pulse-gentle" />
            <div 
              id="google_translate_element" 
              className="absolute inset-0 opacity-0"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-card border-border">
          <p className="text-sm">Translate Page</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
export default GoogleTranslate;
