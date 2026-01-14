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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    <div className="space-y-2" ref={dropdownRef}>
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
            ? 'bg-white border-green-500/50 hover:border-green-500' 
            : 'bg-white border-slate-300 hover:border-tesla-red/50'
        }`}
      >
        {selectedCountryData ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedCountryData.flag}</span>
            <span className="font-medium text-slate-900">{selectedCountryData.name}</span>
          </div>
        ) : (
          <span className="text-slate-500">{t('chooseCountry') || 'Choose your country...'}</span>
        )}
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-[350px] sm:max-h-[400px]">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t('searchCountry') || 'Search countries...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto max-h-[280px] sm:max-h-[320px]">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm">
                {t('noCountriesFound') || 'No countries found'}
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors text-left ${
                    selectedCountry === country.code ? 'bg-tesla-red/10 border-l-4 border-l-tesla-red' : ''
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className={`font-medium ${selectedCountry === country.code ? 'text-tesla-red' : 'text-slate-900'}`}>
                    {country.name}
                  </span>
                  {selectedCountry === country.code && (
                    <span className="ml-auto text-xs bg-tesla-red text-white px-2 py-0.5 rounded-full">
                      {t('selected') || 'Selected'}
                    </span>
                  )}
                </button>
              ))
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
