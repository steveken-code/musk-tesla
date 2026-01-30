import { useState, useMemo, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGoogleTranslate } from '@/hooks/useGoogleTranslate';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown, Check, X, Search } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Language {
  code: string;
  flag: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pt', flag: '🇧🇷', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish', nativeName: 'Polski' },
  { code: 'cs', flag: '🇨🇿', name: 'Czech', nativeName: 'Čeština' },
  { code: 'sk', flag: '🇸🇰', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'hu', flag: '🇭🇺', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', flag: '🇷🇴', name: 'Romanian', nativeName: 'Română' },
  { code: 'el', flag: '🇬🇷', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'sl', flag: '🇸🇮', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'et', flag: '🇪🇪', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'sv', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', flag: '🇳🇴', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', flag: '🇩🇰', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', flag: '🇫🇮', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский' },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const { setLanguage: setGoogleTranslate } = useGoogleTranslate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Filter languages based on search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languages;
    const query = searchQuery.toLowerCase();
    return languages.filter(lang => 
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showDropdown]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setSearchQuery('');
      }
    };

    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDropdown]);

  const handleSelect = (code: string) => {
    setLanguage(code as any);
    setGoogleTranslate(code);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <Button 
        ref={buttonRef}
        variant="outline" 
        size="sm" 
        className="gap-2 min-w-[90px] border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline font-medium">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      {showDropdown && createPortal(
        <div className="fixed inset-0 z-[9999]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Dropdown Panel */}
          <div 
            className="absolute top-16 right-4 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Select Language</span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                      language === lang.code
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${language === lang.code ? 'text-primary' : 'text-foreground'}`}>
                        {lang.nativeName}
                      </div>
                      <div className="text-xs text-muted-foreground">{lang.name}</div>
                    </div>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No languages found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-muted/30 border-t border-border">
              <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
                <span>Powered by</span>
                <span className="font-medium text-foreground/70">Google Translate</span>
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSelector;
