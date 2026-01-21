import { useEffect, useRef } from 'react';

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
      /* Hide Google branding banner */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      
      /* Style the main gadget container */
      .goog-te-gadget { 
        font-size: 0 !important; 
        font-family: inherit !important;
      }
      .goog-te-gadget img { display: none !important; }
      .goog-te-gadget-simple { 
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 0.5rem !important;
        padding: 0.5rem 0.75rem !important;
        font-size: 0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      .goog-te-gadget-simple:hover {
        background: hsl(var(--muted)) !important;
        border-color: hsl(var(--primary) / 0.5) !important;
      }
      
      /* Style the selected language text */
      .goog-te-gadget-simple .goog-te-menu-value {
        color: hsl(var(--foreground)) !important;
        font-family: inherit !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span {
        color: hsl(var(--foreground)) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
      }
      /* Hide the dropdown arrow text */
      .goog-te-gadget-simple .goog-te-menu-value span:nth-child(3) {
        display: none !important;
      }
      /* Style the dropdown arrow */
      .goog-te-gadget-simple .goog-te-menu-value span[style*="border-left"] {
        border-left-color: hsl(var(--muted-foreground)) !important;
      }
      
      /* Style the dropdown menu iframe container */
      .goog-te-menu-frame {
        box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
        border-radius: 0.75rem !important;
        border: 1px solid hsl(var(--border)) !important;
      }
      
      /* Hide the "Powered by Google" text */
      .skiptranslate { display: none !important; }
      #google_translate_element .goog-te-gadget-simple {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        min-width: 100px !important;
      }
      
      /* Additional dropdown menu styling (injected into iframe) */
      .goog-te-menu2 {
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 0.5rem !important;
        max-height: 400px !important;
        overflow-y: auto !important;
      }
      .goog-te-menu2-item {
        padding: 8px 16px !important;
        font-size: 14px !important;
      }
      .goog-te-menu2-item:hover {
        background: hsl(var(--muted)) !important;
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

  return (
    <div className="relative">
      {/* Google Translate renders its own styled dropdown here */}
      <div 
        id="google_translate_element" 
        className="translate-widget"
      />
    </div>
  );
};

export default GoogleTranslate;
