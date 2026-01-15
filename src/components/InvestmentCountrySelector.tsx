import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, Search, X, Globe } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort countries alphabetically
  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
  
  // Filter countries based on search
  const filteredCountries = sortedCountries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (countryCode: string) => {
    onCountrySelect(countryCode);
    setShowDropdown(false);
    setSearchQuery('');
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

      {/* Dark overlay for mobile */}
      {showDropdown && (
        <div 
          className="fixed inset-0 bg-black/70 z-[9998] sm:hidden"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed sm:absolute inset-x-4 sm:inset-x-0 sm:left-0 sm:right-0 top-1/4 sm:top-auto z-[9999] sm:mt-2 bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl shadow-black/80 overflow-hidden animate-fade-in flex flex-col"
          style={{ maxHeight: 'min(450px, 70vh)', isolation: 'isolate' }}
        >
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-900 sm:hidden">
            <span className="text-white font-semibold">{t('selectCountry') || 'Select Country'}</span>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          {/* Search Input - Sticky */}
          <div className="p-3 border-b border-slate-600 bg-slate-900 sticky top-0 z-10 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t('searchCountry') || 'Search Country'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-slate-700 border-slate-500 text-white placeholder:text-slate-400 h-12 sm:h-10 text-base focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-600 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-slate-300" />
                </button>
              )}
            </div>
          </div>

          {/* Country List - Scrollable */}
          <div className="overflow-y-auto flex-1 overscroll-contain scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800" style={{ maxHeight: 'calc(min(450px, 70vh) - 120px)', WebkitOverflowScrolling: 'touch' }}>
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                {t('noCountriesFound') || 'No countries found'}
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full flex items-center gap-3 p-4 sm:p-3 transition-colors text-left min-h-[56px] sm:min-h-0 ${
                      selectedCountry === country.code 
                        ? 'bg-teal-500/20 border-l-4 border-l-teal-500' 
                        : 'border-l-4 border-l-transparent hover:bg-slate-700 active:bg-slate-600'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{country.flag}</span>
                    <span className={`font-semibold text-base ${selectedCountry === country.code ? 'text-teal-400' : 'text-white'}`}>
                      {country.name}
                    </span>
                    {selectedCountry === country.code && (
                      <span className="ml-auto text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                        {t('selected') || 'Selected'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedCountry && (
        <p className="text-xs text-muted-foreground">
          {t('countryRequired') || 'Please select your country to see payment options'}
        </p>
      )}
    </div>
  );
};

export default InvestmentCountrySelector;