import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Search, X, Globe, Check } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface InvestmentCountrySelectorProps {
  selectedCountry: string;
  onCountrySelect: (countryCode: string) => void;
  countries: Country[];
}

const InvestmentCountrySelector = ({ 
  selectedCountry, 
  onCountrySelect, 
  countries 
}: InvestmentCountrySelectorProps) => {
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort countries alphabetically
  const sortedCountries = useMemo(() => 
    [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries]
  );
  
  // Filter countries based on search (prefix-only)
  const filteredCountries = useMemo(() => {
    const queryRaw = searchQuery.trim().toLowerCase();
    if (!queryRaw) return sortedCountries;

    return sortedCountries.filter((c) => {
      const nameLower = c.name.toLowerCase();
      const codeLower = c.code.toLowerCase();
      return nameLower.startsWith(queryRaw) || codeLower.startsWith(queryRaw);
    });
  }, [sortedCountries, searchQuery]);

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Focus search input when dropdown opens (desktop)
  useEffect(() => {
    if (showDropdown && !isMobile && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      });
    }
  }, [showDropdown, isMobile]);

  const handleSelect = (countryCode: string) => {
    onCountrySelect(countryCode);
    setShowDropdown(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleClose = () => {
    setShowDropdown(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex].code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  }, [showDropdown, filteredCountries, highlightedIndex]);

  // Highlight matching text in country name
  const HighlightedName = ({ name, query }: { name: string; query: string }) => {
    if (!query.trim()) {
      return <span>{name}</span>;
    }
    
    const lowerName = name.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerName.indexOf(lowerQuery);
    
    if (index === -1) {
      return <span>{name}</span>;
    }
    
    return (
      <span>
        {name.slice(0, index)}
        <span className="bg-yellow-200 text-yellow-900 font-bold rounded px-0.5">
          {name.slice(index, index + query.length)}
        </span>
        {name.slice(index + query.length)}
      </span>
    );
  };

  // Render country button - Flat list without continent grouping
  const CountryButton = ({ country, index }: { country: Country; index: number }) => (
    <button
      key={country.code}
      type="button"
      onClick={() => handleSelect(country.code)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 border-b border-border last:border-b-0 ${
        selectedCountry === country.code 
          ? 'bg-primary/10 border-l-4 border-l-primary' 
          : index === highlightedIndex
            ? 'bg-muted border-l-4 border-l-primary/50'
            : 'bg-card border-l-4 border-l-transparent hover:bg-muted'
      }`}
    >
      <span className="text-2xl flex-shrink-0">{country.flag}</span>
      <span 
        className={`font-semibold text-sm flex-1 text-left ${
          selectedCountry === country.code ? 'text-primary' : 'text-foreground'
        }`}
      >
        <HighlightedName name={country.name} query={searchQuery} />
      </span>
      {selectedCountry === country.code && (
        <Check className="w-5 h-5 text-primary flex-shrink-0" />
      )}
    </button>
  );

  // Mobile dropdown using Vaul Drawer
  const MobileDrawer = () => {
    const mobileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (showDropdown) {
        const timer = setTimeout(() => {
          mobileInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, []);

    return (
      <Drawer open={showDropdown} onOpenChange={setShowDropdown} modal={true}>
        <DrawerContent className="max-h-[85vh] bg-card">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                {t('selectCountry') || 'Select Country'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-3 rounded-full transition-colors bg-muted hover:bg-muted/80"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-border bg-card">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <input
                ref={mobileInputRef}
                type="text"
                inputMode="text"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={t('searchCountry') || 'Type country name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-14 pr-14 h-14 rounded-xl focus:outline-none transition-all bg-background border-2 border-slate-400 text-foreground font-semibold text-base focus:border-electric-blue"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    mobileInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-muted"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Country List - Flat alphabetical, no continents */}
          <div 
            ref={listRef}
            className="overflow-y-auto overscroll-contain flex-1 bg-card"
            style={{ maxHeight: 'calc(85vh - 180px)' }}
          >
            {filteredCountries.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground font-medium">
                {t('noCountriesFound') || 'No countries found'}
              </div>
            ) : (
              <div className="animate-in fade-in duration-200">
                {filteredCountries.map((country, index) => (
                  <CountryButton key={country.code} country={country} index={index} />
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  // Desktop dropdown content - Flat list, no continents
  const DesktopDropdown = () => (
    <div 
      className="absolute left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in slide-in-from-top-2 fade-in duration-200 border-2 border-border bg-card"
    >
      {/* Search Input */}
      <div className="p-3 bg-card border-b-2 border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={t('searchCountry') || 'Type country name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-10 h-12 rounded-xl focus:outline-none transition-all bg-background border-2 border-slate-400 text-foreground font-semibold focus:border-electric-blue"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Country List - Flat alphabetical */}
      <div 
        ref={listRef} 
        className="overflow-y-auto bg-card" 
        style={{ maxHeight: '300px' }}
      >
        {filteredCountries.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground font-medium">
            {t('noCountriesFound') || 'No countries found'}
          </div>
        ) : (
          <div className="animate-in fade-in duration-150">
            {filteredCountries.map((country, index) => (
              <CountryButton key={country.code} country={country} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
        <Globe className="w-4 h-4 text-slate-500" />
        {t('selectCountry') || 'Select Your Country'}
        <span className="text-destructive">*</span>
      </label>
      
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 bg-card ${
          selectedCountry 
            ? 'border-electric-blue/50 hover:border-electric-blue' 
            : 'border-slate-400 hover:border-electric-blue/60'
        }`}
      >
        {selectedCountryData ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCountryData.flag}</span>
            <span className="font-semibold text-foreground">{selectedCountryData.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{t('chooseCountry') || 'Choose your country...'}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile: Use Vaul Drawer */}
      {isMobile && <MobileDrawer />}

      {/* Desktop: Render inline dropdown */}
      {showDropdown && !isMobile && <DesktopDropdown />}

      {!selectedCountry && (
        <p className="text-xs text-muted-foreground">
          {t('countryRequired') || 'Please select your country to see payment options'}
        </p>
      )}
    </div>
  );
};

export default InvestmentCountrySelector;