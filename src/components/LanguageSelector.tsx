import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface Language {
  code: string;
  label: string;
  name: string;
  region: string;
}

const languages: Language[] = [
  // Europe
  { code: 'en', label: '🇺🇸 English', name: 'english', region: 'Europe & Americas' },
  { code: 'de', label: '🇩🇪 Deutsch', name: 'german', region: 'Europe & Americas' },
  { code: 'fr', label: '🇫🇷 Français', name: 'french', region: 'Europe & Americas' },
  { code: 'es', label: '🇪🇸 Español', name: 'spanish', region: 'Europe & Americas' },
  { code: 'it', label: '🇮🇹 Italiano', name: 'italian', region: 'Europe & Americas' },
  { code: 'nl', label: '🇳🇱 Nederlands', name: 'dutch', region: 'Europe & Americas' },
  { code: 'pt', label: '🇧🇷 Português', name: 'portuguese', region: 'Europe & Americas' },
  { code: 'pl', label: '🇵🇱 Polski', name: 'polish', region: 'Europe & Americas' },
  { code: 'cs', label: '🇨🇿 Čeština', name: 'czech', region: 'Europe & Americas' },
  { code: 'sk', label: '🇸🇰 Slovenčina', name: 'slovak', region: 'Europe & Americas' },
  { code: 'hu', label: '🇭🇺 Magyar', name: 'hungarian', region: 'Europe & Americas' },
  { code: 'ro', label: '🇷🇴 Română', name: 'romanian', region: 'Europe & Americas' },
  { code: 'el', label: '🇬🇷 Ελληνικά', name: 'greek', region: 'Europe & Americas' },
  { code: 'sl', label: '🇸🇮 Slovenščina', name: 'slovenian', region: 'Europe & Americas' },
  { code: 'et', label: '🇪🇪 Eesti', name: 'estonian', region: 'Europe & Americas' },
  // Nordic
  { code: 'sv', label: '🇸🇪 Svenska', name: 'swedish', region: 'Nordic' },
  { code: 'no', label: '🇳🇴 Norsk', name: 'norwegian', region: 'Nordic' },
  { code: 'da', label: '🇩🇰 Dansk', name: 'danish', region: 'Nordic' },
  { code: 'fi', label: '🇫🇮 Suomi', name: 'finnish', region: 'Nordic' },
  // Asia
  { code: 'zh', label: '🇨🇳 中文', name: 'chinese', region: 'Asia' },
  { code: 'ja', label: '🇯🇵 日本語', name: 'japanese', region: 'Asia' },
  { code: 'ko', label: '🇰🇷 한국어', name: 'korean', region: 'Asia' },
  { code: 'hi', label: '🇮🇳 हिंदी', name: 'hindi', region: 'Asia' },
  { code: 'th', label: '🇹🇭 ไทย', name: 'thai', region: 'Asia' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt', name: 'vietnamese', region: 'Asia' },
  // Middle East & Russia
  { code: 'ar', label: '🇸🇦 العربية', name: 'arabic', region: 'Middle East & Russia' },
  { code: 'tr', label: '🇹🇷 Türkçe', name: 'turkish', region: 'Middle East & Russia' },
  { code: 'ru', label: '🇷🇺 Русский', name: 'russian', region: 'Middle East & Russia' },
];

const regionOrder = ['Europe & Americas', 'Nordic', 'Asia', 'Middle East & Russia'];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set(regionOrder));
  
  const currentLang = languages.find(l => l.code === language);

  // Group languages by region
  const languagesByRegion = regionOrder.reduce((acc, region) => {
    acc[region] = languages.filter(l => l.region === region);
    return acc;
  }, {} as Record<string, Language[]>);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const handleSelect = (code: string) => {
    setLanguage(code as any);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 min-w-[80px]"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.code.toUpperCase() || 'EN'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      {showDropdown && createPortal(
        <div className="fixed inset-0 z-[9999]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-16 right-4 w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ maxHeight: 'calc(100vh - 100px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Select Language</span>
              </div>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {regionOrder.map(region => {
                const regionLangs = languagesByRegion[region];
                if (regionLangs.length === 0) return null;

                return (
                  <div key={region}>
                    {/* Region Header */}
                    <button
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      {expandedRegions.has(region) ? (
                        <ChevronDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                        {region}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {regionLangs.length}
                      </span>
                    </button>

                    {/* Languages in Region */}
                    {expandedRegions.has(region) && (
                      <div>
                        {regionLangs.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                              language === lang.code
                                ? 'bg-primary/10 border-l-2 border-l-primary'
                                : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                            }`}
                          >
                            <span className="text-lg">{lang.label.split(' ')[0]}</span>
                            <span className={`font-medium text-sm flex-1 text-left ${
                              language === lang.code ? 'text-primary' : ''
                            }`}>
                              {lang.label.split(' ').slice(1).join(' ')}
                            </span>
                            {language === lang.code && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LanguageSelector;