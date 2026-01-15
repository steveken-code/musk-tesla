import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Search, X, Globe, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

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

  const scrollYRef = useRef(0);

  // Detect mobile - use 768px for better tablet/phone coverage
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sort countries alphabetically
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  
  // Filter countries based on search
  const filteredCountries = sortedCountries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchQuery]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('button');
      const highlightedItem = items[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  // Lock body scroll when dropdown is open on mobile - iOS safe approach
  useEffect(() => {
    if (showDropdown && isMobile) {
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    } else {
      const scrollY = scrollYRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, scrollY);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
    };
  }, [showDropdown, isMobile]);

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

  // Focus search input when dropdown opens - with preventScroll for iOS
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      });
    }
  }, [showDropdown]);

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

  // Mobile dropdown content - FIXED: full opacity, high contrast, visible typed text
  const MobileDropdown = () => (
    <div className="fixed inset-0 z-[9999]">
      {/* Semi-transparent dark overlay */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />
      
      {/* Dropdown card - positioned from top with high contrast */}
      <div 
        className="absolute top-16 left-3 right-3 bg-white rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-top-4 fade-in duration-200"
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        {/* Header - higher contrast */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-300 bg-slate-100 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-700" />
            <span 
              className="text-[17px] leading-6 font-bold"
              style={{ color: '#111111', opacity: 1 }}
            >
              {t('selectCountry') || 'Select Country'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2.5 bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-900" />
          </button>
        </div>

        {/* Search Input - FIXED: forced dark text color for visibility */}
        <div className="p-3 bg-slate-50 border-b-2 border-slate-300">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
              style={{ color: '#374151', opacity: 1 }}
            />
            <input
              ref={searchInputRef}
              type="text"
              inputMode="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t('searchCountry') || 'Search country...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-12 h-14 text-[17px] leading-6 font-semibold bg-white border-2 border-slate-400 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none transition-colors"
              style={{
                color: '#111111',
                WebkitTextFillColor: '#111111',
                caretColor: '#111111',
                opacity: 1,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-800" />
              </button>
            )}
          </div>
        </div>

        {/* Country List - scrollable with keyboard highlight, FIXED opacity */}
        <div 
          ref={listRef}
          className="overflow-y-auto overscroll-contain touch-pan-y bg-white rounded-b-2xl"
          style={{ maxHeight: '240px', WebkitOverflowScrolling: 'touch' }}
        >
          {filteredCountries.length === 0 ? (
            <div 
              className="p-6 text-center text-[16px] font-semibold"
              style={{ color: '#374151', opacity: 1 }}
            >
              {t('noCountriesFound') || 'No countries found'}
            </div>
          ) : (
            <div>
              {filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`w-full flex items-center gap-3 px-4 py-4 transition-colors border-b border-slate-200 last:border-b-0 ${
                    selectedCountry === country.code 
                      ? 'bg-teal-100 border-l-4 border-l-teal-500' 
                      : index === highlightedIndex
                        ? 'bg-slate-200 border-l-4 border-l-teal-400 ring-2 ring-inset ring-teal-500'
                        : 'bg-white border-l-4 border-l-transparent hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0" style={{ opacity: 1 }}>{country.flag}</span>
                  <span 
                    className="font-bold text-[16px] leading-6 flex-1 text-left"
                    style={{ 
                      color: selectedCountry === country.code ? '#0f766e' : '#111111',
                      opacity: 1,
                      WebkitTextFillColor: selectedCountry === country.code ? '#0f766e' : '#111111'
                    }}
                  >
                    {country.name}
                  </span>
                  {selectedCountry === country.code && (
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0" style={{ opacity: 1 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop dropdown content - unified design with keyboard navigation
  const DesktopDropdown = () => (
    <div 
      className="absolute left-0 right-0 mt-2 bg-slate-200 border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden z-50"
    >
      {/* Search Input - high contrast */}
      <div className="p-3 border-b border-slate-300 bg-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchCountry') || 'Search country...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-11 pr-10 h-11 bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          )}
        </div>
      </div>

      {/* Country List - ~3 rows visible, scrollable with keyboard highlight */}
      <div ref={listRef} className="overflow-y-auto bg-white" style={{ maxHeight: '180px' }}>
        {filteredCountries.length === 0 ? (
          <div className="p-4 text-center text-slate-500 font-medium">
            {t('noCountriesFound') || 'No countries found'}
          </div>
        ) : (
          filteredCountries.map((country, index) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-slate-200 last:border-b-0 ${
                selectedCountry === country.code 
                  ? 'bg-teal-100 border-l-4 border-l-teal-500' 
                  : index === highlightedIndex
                    ? 'bg-slate-200 border-l-4 border-l-teal-400 ring-2 ring-inset ring-teal-500'
                    : 'bg-white border-l-4 border-l-transparent hover:bg-slate-100'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{country.flag}</span>
              <span className={`font-semibold ${
                selectedCountry === country.code ? 'text-teal-700' : 'text-slate-900'
              }`}>
                {country.name}
              </span>
              {selectedCountry === country.code && (
                <Check className="w-5 h-5 text-teal-600 ml-auto flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
        <Globe className="w-4 h-4 text-tesla-red" />
        {t('selectCountry') || 'Select Your Country'}
        <span className="text-red-500">*</span>
      </label>
      
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 shadow-lg ${
          selectedCountry 
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-teal-500/60 hover:border-teal-400' 
            : 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600 hover:border-slate-500'
        }`}
      >
        {selectedCountryData ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCountryData.flag}</span>
            <span className="font-semibold text-white">{selectedCountryData.name}</span>
          </div>
        ) : (
          <span className="text-slate-400">{t('chooseCountry') || 'Choose your country...'}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Mobile: Render in portal as bottom sheet */}
      {showDropdown && isMobile && createPortal(<MobileDropdown />, document.body)}

      {/* Desktop: Render inline */}
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
