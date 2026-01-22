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
      /* Hide Google branding banner completely */
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; position: static !important; }
      
      /* Prevent page jumps when translating */
      html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }
      
      /* Style the main gadget container */
      .goog-te-gadget { 
        font-size: 0 !important; 
        font-family: inherit !important;
        line-height: 1 !important;
      }
      .goog-te-gadget img { display: none !important; }
      .goog-te-gadget > span { display: none !important; }
      
      .goog-te-gadget-simple { 
        background: transparent !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 6px !important;
        padding: 6px 10px !important;
        font-size: 0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        display: inline-flex !important;
        align-items: center !important;
        min-width: auto !important;
        max-width: 90px !important;
        overflow: hidden !important;
      }

        /* Mobile: keep it visible next to the hamburger without stretching */
        @media (max-width: 767px) {
          .goog-te-gadget-simple {
            max-width: 76px !important;
            padding: 6px 8px !important;
          }
          .goog-te-gadget-simple .goog-te-menu-value span {
            font-size: 11px !important;
          }
        }
      .goog-te-gadget-simple:hover {
        background: hsl(var(--muted)) !important;
        border-color: hsl(var(--brand-purple) / 0.5) !important;
      }
      
      /* Style the selected language text */
      .goog-te-gadget-simple .goog-te-menu-value {
        color: hsl(var(--foreground)) !important;
        font-family: inherit !important;
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }
      .goog-te-gadget-simple .goog-te-menu-value span {
        color: hsl(var(--foreground)) !important;
        font-size: 12px !important;
        font-weight: 500 !important;
      }
      /* Only show first 2 letters of language */
      .goog-te-gadget-simple .goog-te-menu-value span:first-child {
        max-width: 50px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      /* Hide extra spans */
      .goog-te-gadget-simple .goog-te-menu-value span:nth-child(2),
      .goog-te-gadget-simple .goog-te-menu-value span:nth-child(3) {
        display: none !important;
      }
      /* Style the dropdown arrow */
      .goog-te-gadget-simple .goog-te-menu-value span[style*="border-left"] {
        border-left-color: hsl(var(--muted-foreground)) !important;
        margin-left: 4px !important;
      }
      
      /* Hide the "Powered by Google" and skip translate elements */
      #google_translate_element .skiptranslate { display: block !important; }
      body > .skiptranslate { display: none !important; }
      .goog-te-spinner-pos { display: none !important; }
      
      /* Style the dropdown menu iframe container */
      .goog-te-menu-frame {
        box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
        border-radius: 8px !important;
        border: 1px solid hsl(var(--border)) !important;
      }
      
      /* Dropdown menu styling */
      .goog-te-menu2 {
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 8px !important;
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
    <div className="relative flex items-center">
      <div 
        id="google_translate_element" 
        className="translate-widget [&_.goog-te-gadget]:!leading-none"
      />
    </div>
  );
};

export default GoogleTranslate;
