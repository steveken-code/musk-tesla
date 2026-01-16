import { useState, useRef, useEffect, useCallback, useDeferredValue } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, ChevronRight, Search, X, Globe, Check } from 'lucide-react';
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

// Continent mapping for all countries
const continentMap: Record<string, string> = {
  // Europe
  'AL': 'Europe', 'AD': 'Europe', 'AT': 'Europe', 'BY': 'Europe', 'BE': 'Europe',
  'BA': 'Europe', 'BG': 'Europe', 'HR': 'Europe', 'CY': 'Europe', 'CZ': 'Europe',
  'DK': 'Europe', 'EE': 'Europe', 'FI': 'Europe', 'FR': 'Europe', 'DE': 'Europe',
  'GR': 'Europe', 'HU': 'Europe', 'IS': 'Europe', 'IE': 'Europe', 'IT': 'Europe',
  'XK': 'Europe', 'LV': 'Europe', 'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe',
  'MT': 'Europe', 'MD': 'Europe', 'MC': 'Europe', 'ME': 'Europe', 'NL': 'Europe',
  'MK': 'Europe', 'NO': 'Europe', 'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe',
  'RU': 'Europe', 'SM': 'Europe', 'RS': 'Europe', 'SK': 'Europe', 'SI': 'Europe',
  'ES': 'Europe', 'SE': 'Europe', 'CH': 'Europe', 'UA': 'Europe', 'GB': 'Europe', 'VA': 'Europe',
  // Americas
  'CA': 'Americas', 'MX': 'Americas', 'US': 'Americas', 'BZ': 'Americas', 'CR': 'Americas',
  'SV': 'Americas', 'GT': 'Americas', 'HN': 'Americas', 'NI': 'Americas', 'PA': 'Americas',
  'AG': 'Americas', 'BS': 'Americas', 'BB': 'Americas', 'CU': 'Americas', 'DM': 'Americas',
  'DO': 'Americas', 'GD': 'Americas', 'HT': 'Americas', 'JM': 'Americas', 'KN': 'Americas',
  'LC': 'Americas', 'VC': 'Americas', 'TT': 'Americas', 'AR': 'Americas', 'BO': 'Americas',
  'BR': 'Americas', 'CL': 'Americas', 'CO': 'Americas', 'EC': 'Americas', 'GY': 'Americas',
  'PY': 'Americas', 'PE': 'Americas', 'SR': 'Americas', 'UY': 'Americas', 'VE': 'Americas',
  // Asia
  'CN': 'Asia', 'HK': 'Asia', 'JP': 'Asia', 'KP': 'Asia', 'KR': 'Asia', 'MO': 'Asia',
  'MN': 'Asia', 'TW': 'Asia', 'BN': 'Asia', 'KH': 'Asia', 'ID': 'Asia', 'LA': 'Asia',
  'MY': 'Asia', 'MM': 'Asia', 'PH': 'Asia', 'SG': 'Asia', 'TH': 'Asia', 'TL': 'Asia',
  'VN': 'Asia', 'AF': 'Asia', 'BD': 'Asia', 'BT': 'Asia', 'IN': 'Asia', 'MV': 'Asia',
  'NP': 'Asia', 'PK': 'Asia', 'LK': 'Asia', 'KZ': 'Asia', 'KG': 'Asia', 'TJ': 'Asia',
  'TM': 'Asia', 'UZ': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'BH': 'Asia', 'GE': 'Asia',
  'IR': 'Asia', 'IQ': 'Asia', 'IL': 'Asia', 'JO': 'Asia', 'KW': 'Asia', 'LB': 'Asia',
  'OM': 'Asia', 'PS': 'Asia', 'QA': 'Asia', 'SA': 'Asia', 'SY': 'Asia', 'TR': 'Asia',
  'AE': 'Asia', 'YE': 'Asia',
  // Africa
  'DZ': 'Africa', 'EG': 'Africa', 'LY': 'Africa', 'MA': 'Africa', 'SD': 'Africa', 'TN': 'Africa',
  'BJ': 'Africa', 'BF': 'Africa', 'CV': 'Africa', 'CI': 'Africa', 'GM': 'Africa', 'GH': 'Africa',
  'GN': 'Africa', 'GW': 'Africa', 'LR': 'Africa', 'ML': 'Africa', 'MR': 'Africa', 'NE': 'Africa',
  'NG': 'Africa', 'SN': 'Africa', 'SL': 'Africa', 'TG': 'Africa', 'AO': 'Africa', 'CM': 'Africa',
  'CF': 'Africa', 'TD': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'GQ': 'Africa', 'GA': 'Africa',
  'ST': 'Africa', 'BI': 'Africa', 'KM': 'Africa', 'DJ': 'Africa', 'ER': 'Africa', 'ET': 'Africa',
  'KE': 'Africa', 'MG': 'Africa', 'MW': 'Africa', 'MU': 'Africa', 'MZ': 'Africa', 'RW': 'Africa',
  'SC': 'Africa', 'SO': 'Africa', 'SS': 'Africa', 'TZ': 'Africa', 'UG': 'Africa', 'ZM': 'Africa',
  'ZW': 'Africa', 'BW': 'Africa', 'SZ': 'Africa', 'LS': 'Africa', 'NA': 'Africa', 'ZA': 'Africa',
  // Oceania
  'AU': 'Oceania', 'FJ': 'Oceania', 'NZ': 'Oceania', 'PG': 'Oceania', 'WS': 'Oceania',
  'SB': 'Oceania', 'TO': 'Oceania', 'VU': 'Oceania',
};

const continentOrder = ['Europe', 'Americas', 'Asia', 'Africa', 'Oceania'];

const InvestmentCountrySelector = ({ 
  selectedCountry, 
  onCountrySelect, 
  countries 
}: InvestmentCountrySelectorProps) => {
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [isMobile, setIsMobile] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [expandedContinents, setExpandedContinents] = useState<Set<string>>(
    new Set(continentOrder)
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
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
  
  // Filter countries based on deferred search (smooth typing)
  const filteredCountries = sortedCountries.filter(c => 
    c.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(deferredSearch.toLowerCase())
  );

  // Group countries by continent
  const countriesByContinent = continentOrder.reduce((acc, continent) => {
    acc[continent] = filteredCountries.filter(c => continentMap[c.code] === continent);
    return acc;
  }, {} as Record<string, Country[]>);

  // Check if we're searching (show flat list) or browsing (show grouped)
  const isSearching = deferredSearch.length > 0;

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [deferredSearch]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-country-btn]');
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

  const toggleContinent = (continent: string) => {
    setExpandedContinents(prev => {
      const next = new Set(prev);
      if (next.has(continent)) {
        next.delete(continent);
      } else {
        next.add(continent);
      }
      return next;
    });
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

  // Render country button
  const CountryButton = ({ country, index }: { country: Country; index: number }) => (
    <button
      key={country.code}
      type="button"
      data-country-btn
      onClick={() => handleSelect(country.code)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-slate-200 last:border-b-0 ${
        selectedCountry === country.code 
          ? 'bg-teal-100 border-l-4 border-l-teal-500' 
          : index === highlightedIndex
            ? 'bg-slate-200 border-l-4 border-l-teal-400 ring-2 ring-inset ring-teal-500'
            : 'bg-white border-l-4 border-l-transparent hover:bg-slate-100 active:bg-slate-200'
      }`}
    >
      <span className="text-2xl flex-shrink-0" style={{ opacity: 1 }}>{country.flag}</span>
      <span 
        className="font-bold text-[15px] leading-6 flex-1 text-left"
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
  );

  // Continent header component - SOLID background, no transparency
  const ContinentHeader = ({ continent, count }: { continent: string; count: number }) => (
    <button
      type="button"
      onClick={() => toggleContinent(continent)}
      onMouseDown={(e) => {
        // Prevent stealing focus from search input
        if (isInputFocused) {
          e.preventDefault();
        }
      }}
      className="w-full flex items-center gap-2 px-4 py-3 border-b-2 border-slate-400 hover:bg-slate-300 transition-colors sticky top-0 z-20 shadow-md"
      style={{
        backgroundColor: '#e2e8f0',
        opacity: 1,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
    >
      {expandedContinents.has(continent) ? (
        <ChevronDown className="w-4 h-4 text-teal-600" style={{ opacity: 1 }} />
      ) : (
        <ChevronRight className="w-4 h-4 text-slate-600" style={{ opacity: 1 }} />
      )}
      <span 
        className="font-bold text-sm"
        style={{ color: '#1a1a1a', opacity: 1 }}
      >
        {continent}
      </span>
      <span 
        className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-semibold"
        style={{ opacity: 1 }}
      >
        {count}
      </span>
    </button>
  );

  // Mobile dropdown content
  const MobileDropdown = () => {
    let globalIndex = 0;
    
    return (
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

          {/* Search Input - FIXED: keyboard stays open for continuous typing */}
          <div className="p-3 bg-slate-100 border-b-2 border-slate-300">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: '#374151', opacity: 1 }}
              />
              <input
                ref={searchInputRef}
                type="text"
                inputMode="text"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={t('searchCountry') || 'Type country name...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Keep input focused during typing
                  setIsInputFocused(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsInputFocused(true);
                }}
                onBlur={(e) => {
                  // CRITICAL: Prevent blur completely when modal is open
                  // Only allow blur when selecting a country (clicking a button)
                  const relatedTarget = e.relatedTarget as HTMLElement;
                  const isCountryButton = relatedTarget?.hasAttribute('data-country-btn');
                  
                  if (showDropdown && !isCountryButton) {
                    // Prevent the blur and immediately refocus
                    e.preventDefault();
                    e.stopPropagation();
                    // Use requestAnimationFrame to ensure refocus happens after any browser blur handling
                    requestAnimationFrame(() => {
                      if (searchInputRef.current && showDropdown) {
                        searchInputRef.current.focus({ preventScroll: true });
                      }
                    });
                    return;
                  }
                  
                  setIsInputFocused(false);
                }}
                onTouchEnd={(e) => {
                  // Ensure keyboard stays open on touch
                  if (showDropdown) {
                    e.currentTarget.focus({ preventScroll: true });
                  }
                }}
                className="w-full pl-11 pr-12 h-14 text-[17px] leading-6 font-semibold bg-white border-2 border-slate-400 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30 focus:outline-none transition-colors"
                style={{
                  color: '#111111',
                  WebkitTextFillColor: '#111111',
                  caretColor: '#111111',
                  opacity: 1,
                  fontSize: '16px', // Prevents iOS zoom on focus
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    // Refocus the input after clearing
                    requestAnimationFrame(() => {
                      searchInputRef.current?.focus({ preventScroll: true });
                    });
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-300 hover:bg-slate-400 active:bg-slate-500 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-800" />
                </button>
              )}
            </div>
          </div>

          {/* Country List - scrollable, keyboard stays open during scroll */}
          <div 
            ref={listRef}
            className="overflow-y-auto overscroll-contain bg-white rounded-b-2xl"
            style={{ 
              maxHeight: '400px', 
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            }}
            onMouseDown={(e) => {
              // Prevent scroll area from stealing focus from input
              const target = e.target as HTMLElement;
              const isCountryButton = target.closest('[data-country-btn]');
              if (!isCountryButton) {
                e.preventDefault();
                e.stopPropagation();
                // Keep input focused
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus({ preventScroll: true });
                });
              }
            }}
            onTouchStart={(e) => {
              // Prevent input blur during touch/scroll
              const target = e.target as HTMLElement;
              const isCountryButton = target.closest('[data-country-btn]');
              if (!isCountryButton) {
                // Don't prevent default - allow scrolling
                // But immediately ensure input stays focused
                requestAnimationFrame(() => {
                  if (showDropdown && searchInputRef.current) {
                    searchInputRef.current.focus({ preventScroll: true });
                  }
                });
              }
            }}
            onTouchMove={() => {
              // During scroll, continuously ensure input stays focused
              if (showDropdown && searchInputRef.current) {
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus({ preventScroll: true });
                });
              }
            }}
            onTouchEnd={() => {
              // After scroll ends, refocus input
              if (showDropdown && searchInputRef.current) {
                requestAnimationFrame(() => {
                  searchInputRef.current?.focus({ preventScroll: true });
                });
              }
            }}
          >
            {filteredCountries.length === 0 ? (
              <div 
                className="p-6 text-center text-[16px] font-semibold"
                style={{ color: '#374151', opacity: 1 }}
              >
                {t('noCountriesFound') || 'No countries found'}
              </div>
            ) : isSearching ? (
              // Flat list when searching
              <div>
                {filteredCountries.map((country, index) => (
                  <CountryButton key={country.code} country={country} index={index} />
                ))}
              </div>
            ) : (
              // Grouped by continent when browsing
              <div>
                {continentOrder.map(continent => {
                  const continentCountries = countriesByContinent[continent];
                  if (continentCountries.length === 0) return null;
                  
                  return (
                    <div key={continent}>
                      <ContinentHeader continent={continent} count={continentCountries.length} />
                      {expandedContinents.has(continent) && (
                        <div>
                          {continentCountries.map(country => {
                            const idx = globalIndex++;
                            return <CountryButton key={country.code} country={country} index={idx} />;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Desktop dropdown content - unified design with keyboard navigation
  const DesktopDropdown = () => {
    let globalIndex = 0;
    
    return (
      <div 
        className="absolute left-0 right-0 mt-2 bg-slate-200 border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden z-50"
      >
        {/* Search Input - high contrast, no autocomplete */}
        <div className="p-3 border-b border-slate-300 bg-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
            <Input
              ref={searchInputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              placeholder={t('searchCountry') || 'Type country name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="pl-11 pr-10 h-11 bg-white border-2 border-slate-300 text-slate-900 placeholder:text-slate-500 font-medium rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* Country List */}
        <div 
          ref={listRef} 
          className="overflow-y-auto bg-white" 
          style={{ maxHeight: '300px' }}
          onMouseDown={(e) => {
            if (isInputFocused && !(e.target as HTMLElement).closest('[data-country-btn]')) {
              e.preventDefault();
            }
          }}
        >
          {filteredCountries.length === 0 ? (
            <div className="p-4 text-center text-slate-500 font-medium">
              {t('noCountriesFound') || 'No countries found'}
            </div>
          ) : isSearching ? (
            // Flat list when searching
            filteredCountries.map((country, index) => (
              <button
                key={country.code}
                type="button"
                data-country-btn
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
          ) : (
            // Grouped by continent when browsing
            continentOrder.map(continent => {
              const continentCountries = countriesByContinent[continent];
              if (continentCountries.length === 0) return null;
              
              return (
                <div key={continent}>
                  <button
                    type="button"
                    onClick={() => toggleContinent(continent)}
                    onMouseDown={(e) => {
                      if (isInputFocused) e.preventDefault();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 border-b-2 border-slate-400 hover:bg-slate-300 transition-colors sticky top-0 z-20 shadow-md"
                    style={{
                      backgroundColor: '#e2e8f0',
                      opacity: 1,
                      backdropFilter: 'none',
                      WebkitBackdropFilter: 'none',
                    }}
                  >
                    {expandedContinents.has(continent) ? (
                      <ChevronDown className="w-4 h-4 text-teal-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="font-bold text-sm text-slate-900">{continent}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-600 text-white font-semibold">
                      {continentCountries.length}
                    </span>
                  </button>
                  {expandedContinents.has(continent) && continentCountries.map(country => {
                    const idx = globalIndex++;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        data-country-btn
                        onClick={() => handleSelect(country.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors border-b border-slate-100 last:border-b-0 ${
                          selectedCountry === country.code 
                            ? 'bg-teal-100 border-l-4 border-l-teal-500' 
                            : idx === highlightedIndex
                              ? 'bg-slate-200 border-l-4 border-l-teal-400'
                              : 'bg-white border-l-4 border-l-transparent hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{country.flag}</span>
                        <span className={`font-medium text-sm ${
                          selectedCountry === country.code ? 'text-teal-700' : 'text-slate-900'
                        }`}>
                          {country.name}
                        </span>
                        {selectedCountry === country.code && (
                          <Check className="w-4 h-4 text-teal-600 ml-auto flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

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