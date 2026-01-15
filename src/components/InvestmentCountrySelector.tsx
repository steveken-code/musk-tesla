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
        className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all ${
          selectedCountry 
            ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-tesla-red/50 hover:border-tesla-red' 
            : 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-600 hover:border-tesla-red/50'
        }`}
      >
        {selectedCountryData ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCountryData.flag}</span>
            <span className="font-medium text-foreground">{selectedCountryData.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{t('chooseCountry') || 'Choose your country...'}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 z-[9999] mt-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-tesla-red/30 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in flex flex-col"
          style={{ maxHeight: 'min(400px, 60vh)' }}
        >
          {/* Search Input - Sticky */}
          <div className="p-3 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('searchCountry') || 'Search Country'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-slate-800 border-slate-600 text-foreground placeholder:text-muted-foreground h-10 focus:border-tesla-red/50"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Country List - Scrollable */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(min(400px, 60vh) - 60px)' }}>
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t('noCountriesFound') || 'No countries found'}
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors text-left ${
                      selectedCountry === country.code 
                        ? 'bg-tesla-red/10 border-l-4 border-l-tesla-red' 
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{country.flag}</span>
                    <span className={`font-medium ${selectedCountry === country.code ? 'text-tesla-red' : 'text-foreground'}`}>
                      {country.name}
                    </span>
                    {selectedCountry === country.code && (
                      <span className="ml-auto text-xs bg-tesla-red text-white px-2 py-0.5 rounded-full flex-shrink-0">
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