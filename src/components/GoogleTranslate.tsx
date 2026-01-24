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
      
      /* Hide the entire Google Translate gadget visually but keep it interactive */
      #google_translate_element { 
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 0 !important;
        overflow: visible !important;
        z-index: 20 !important;
      }
      
      /* Make the gadget clickable */
      .goog-te-gadget-simple { 
        position: absolute !important;
        width: 100% !important;
        height: 100% !important;
        top: 0 !important;
        left: 0 !important;
        cursor: pointer !important;
        z-index: 25 !important;
        background: transparent !important;
        border: none !important;
      }
      
      /* Style the select dropdown to be visible when clicked */
      .goog-te-combo {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        opacity: 0 !important;
        cursor: pointer !important;
        z-index: 30 !important;
      }
      
      /* Hide the "Powered by Google" and skip translate elements */
      body > .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      .goog-logo-link { display: none !important; }
      .goog-te-gadget span { display: none !important; }
      
      /* Style the dropdown menu iframe container */
      .goog-te-menu-frame {
        box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        border-radius: 12px !important;
        border: 1px solid hsl(var(--border)) !important;
        z-index: 9999 !important;
      }
      
      /* Dropdown menu styling */
      .goog-te-menu2 {
        background: hsl(222, 47%, 11%) !important;
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
      .goog-te-menu2-item span,
      .goog-te-menu2-item div {
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
    // Try multiple methods to trigger the Google Translate dropdown
    const gadgetSimple = document.querySelector('.goog-te-gadget-simple') as HTMLElement;
    const gadgetCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    const gadgetMenu = document.querySelector('.goog-te-gadget-simple span') as HTMLElement;
    
    if (gadgetCombo) {
      // If there's a select dropdown, open it
      gadgetCombo.focus();
      gadgetCombo.click();
      // Trigger mouse event to open dropdown
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
      gadgetCombo.dispatchEvent(event);
    } else if (gadgetMenu) {
      gadgetMenu.click();
    } else if (gadgetSimple) {
      gadgetSimple.click();
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
