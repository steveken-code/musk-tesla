import { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
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

  // Lock body scroll when dropdown is open on mobile
  useEffect(() => {
    if (showDropdown && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showDropdown && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showDropdown]);

  const handleSelect = (countryCode: string) => {
    onCountrySelect(countryCode);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setShowDropdown(false);
    setSearchQuery('');
  };

  // Mobile bottom sheet content
  const MobileDropdown = () => (
    <div className="fixed inset-0 z-[9999]">
      {/* Solid dark overlay */}
      <div 
        className="absolute inset-0 bg-slate-950"
        onClick={handleClose}
      />
      
      {/* Bottom sheet */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-500" />
            <span className="text-lg font-semibold text-white">
              {t('selectCountry') || 'Select Country'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 bg-slate-900 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t('searchCountry') || 'Search country...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-14 text-base bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            )}
          </div>
        </div>

        {/* Country List */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain touch-pan-y bg-slate-900"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {filteredCountries.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              {t('noCountriesFound') || 'No countries found'}
            </div>
          ) : (
            <div className="pb-8">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`w-full flex items-center gap-4 px-4 py-4 transition-colors active:bg-slate-700 ${
                    selectedCountry === country.code 
                      ? 'bg-teal-900/50 border-l-4 border-l-teal-500' 
                      : 'bg-slate-900 border-l-4 border-l-transparent hover:bg-slate-800'
                  }`}
                >
                  <span className="text-3xl flex-shrink-0">{country.flag}</span>
                  <span className={`font-medium text-base flex-1 text-left ${
                    selectedCountry === country.code ? 'text-teal-400' : 'text-white'
                  }`}>
                    {country.name}
                  </span>
                  {selectedCountry === country.code && (
                    <Check className="w-5 h-5 text-teal-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop dropdown content
  const DesktopDropdown = () => (
    <div 
      className="absolute left-0 right-0 mt-2 bg-slate-900 border-2 border-slate-600 rounded-xl shadow-2xl overflow-hidden z-50"
      style={{ maxHeight: '400px' }}
    >
      {/* Search Input */}
      <div className="p-3 border-b border-slate-700 bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchCountry') || 'Search country...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Country List */}
      <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
        {filteredCountries.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            {t('noCountriesFound') || 'No countries found'}
          </div>
        ) : (
          filteredCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleSelect(country.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                selectedCountry === country.code 
                  ? 'bg-teal-900/50 border-l-4 border-l-teal-500' 
                  : 'bg-slate-900 border-l-4 border-l-transparent hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{country.flag}</span>
              <span className={`font-medium ${
                selectedCountry === country.code ? 'text-teal-400' : 'text-white'
              }`}>
                {country.name}
              </span>
              {selectedCountry === country.code && (
                <Check className="w-4 h-4 text-teal-500 ml-auto flex-shrink-0" />
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
