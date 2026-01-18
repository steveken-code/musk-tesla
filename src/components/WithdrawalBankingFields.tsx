import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { countryBankingSystems, Bank } from '@/data/countryBankingSystems';
import { ChevronDown, Check, Building2, CreditCard, Phone, Wallet, AlertCircle, Search } from 'lucide-react';

interface WithdrawalBankingFieldsProps {
  country: string;
  method: string;
  paymentDetails: Record<string, string>;
  onPaymentDetailsChange: (details: Record<string, string>) => void;
}

const WithdrawalBankingFields = ({
  country,
  method,
  paymentDetails,
  onPaymentDetailsChange,
}: WithdrawalBankingFieldsProps) => {
  const { t } = useLanguage();
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  
  const bankingSystem = countryBankingSystems[country];
  
  const handleFieldChange = (field: string, value: string) => {
    onPaymentDetailsChange({ ...paymentDetails, [field]: value });
  };
  
  const formatIBAN = (value: string): string => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    // Limit to country-specific IBAN length
    const maxLength = bankingSystem?.ibanLength || 34;
    const trimmed = cleaned.slice(0, maxLength);
    return trimmed.replace(/(.{4})/g, '$1 ').trim();
  };
  
  const formatRoutingNumber = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 9);
  };
  
  const formatSortCode = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4)}`;
  };
  
  const formatBSB = (value: string): string => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  };
  
  const formatCardNumber = (value: string): string => {
    const maxLength = bankingSystem?.cardLength || 16;
    const cleaned = value.replace(/\D/g, '').slice(0, maxLength);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };
  
  const formatPhoneNumber = (value: string, phoneCode: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+') && !cleaned.startsWith(phoneCode)) {
      cleaned = phoneCode + cleaned.replace(/^\+/, '');
    }
    return cleaned;
  };
  
  const selectedBank = useMemo(() => {
    if (!bankingSystem?.banks || !paymentDetails.bankCode) return null;
    return bankingSystem.banks.find(b => b.code === paymentDetails.bankCode) || null;
  }, [bankingSystem, paymentDetails.bankCode]);

  const filteredBanks = useMemo(() => {
    if (!bankingSystem?.banks) return [];
    if (!bankSearch.trim()) return bankingSystem.banks;
    const search = bankSearch.toLowerCase();
    return bankingSystem.banks.filter(b => 
      b.name.toLowerCase().includes(search) || 
      (b.swift && b.swift.toLowerCase().includes(search))
    );
  }, [bankingSystem, bankSearch]);

  // For Russia: Keep existing card/phone format
  if (country === 'RU') {
    if (method === 'card') {
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="w-4 h-4 text-green-500" />
              {t('cardNumber')}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={paymentDetails.cardNumber || ''}
              onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))}
              className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20 rounded-xl"
            />
            <p className="text-xs text-slate-400">16 digits • Sberbank, Tinkoff, VTB, Alfa-Bank</p>
          </div>
        </div>
      );
    }
    
    if (method === 'phone') {
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2 text-sm font-semibold">
              <Phone className="w-4 h-4 text-green-500" />
              {t('phoneNumber')} (СБП)
            </Label>
            <Input
              type="text"
              inputMode="tel"
              placeholder="+7 XXX XXX XX XX"
              value={paymentDetails.phoneNumber || ''}
              onChange={(e) => handleFieldChange('phoneNumber', formatPhoneNumber(e.target.value, '+7'))}
              className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20 rounded-xl"
            />
            <p className="text-xs text-slate-400">Format: +7 XXX XXX XX XX</p>
          </div>
        </div>
      );
    }
  }
  
  // For crypto - universal
  if (method === 'crypto') {
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-white flex items-center gap-2 text-sm font-semibold">
            <Wallet className="w-4 h-4 text-amber-500" />
            USDT (TRC20) {t('walletAddress')}
          </Label>
          <Input
            type="text"
            placeholder="T..."
            value={paymentDetails.cryptoAddress || ''}
            onChange={(e) => handleFieldChange('cryptoAddress', e.target.value)}
            className="h-14 text-base font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20 rounded-xl"
          />
          <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Only USDT on TRON (TRC20) network</span>
          </div>
        </div>
      </div>
    );
  }
  
  // For bank transfer methods
  if (method === 'bank_transfer' || (method === 'card' && bankingSystem?.paymentSystem !== 'card_only')) {
    const isIBAN = bankingSystem?.paymentSystem === 'iban';
    const isRouting = bankingSystem?.paymentSystem === 'routing';
    const isSortCode = country === 'GB';
    const isBSB = country === 'AU';
    
    return (
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="text-white font-semibold text-base">Bank Transfer Details</span>
        </div>

        {/* Bank Selection */}
        {bankingSystem?.banks && bankingSystem.banks.length > 0 && (
          <div className="space-y-4">
            <Label className="text-white flex items-center gap-2 text-sm font-semibold">
              <Building2 className="w-4 h-4 text-blue-400" />
              Select Your Bank
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
                className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] border-2 border-[#444] rounded-xl hover:border-green-500/50 transition-colors text-left"
              >
                {selectedBank ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{selectedBank.name}</span>
                      {selectedBank.swift && (
                        <span className="text-xs text-green-400">SWIFT: {selectedBank.swift}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-[#888]">Tap to Select Bank</span>
                )}
                <ChevronDown className={`w-5 h-5 text-[#888] transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showBankDropdown && (
                <div className="absolute z-[200] w-full mt-2 bg-[#1a1a1a] border-2 border-[#444] rounded-xl shadow-2xl overflow-hidden">
                  {/* Bank Search */}
                  <div className="p-3 border-b border-[#333] bg-[#222]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                      <Input
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        className="pl-10 bg-[#2a2a2a] border-2 border-[#555] h-10 text-sm [color:#ffffff_!important] placeholder:text-[#777] focus:border-green-500 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {filteredBanks.map((bank: Bank) => (
                      <button
                        key={bank.code}
                        type="button"
                        onClick={() => {
                          handleFieldChange('bankCode', bank.code);
                          handleFieldChange('bankName', bank.name);
                          if (bank.swift) handleFieldChange('swiftCode', bank.swift);
                          setShowBankDropdown(false);
                          setBankSearch('');
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 transition-colors border-b border-[#333] last:border-b-0 ${
                          paymentDetails.bankCode === bank.code ? 'bg-green-500/20' : 'hover:bg-[#2a2a2a]'
                        }`}
                      >
                        <div className="text-left">
                          <span className="font-semibold text-white block">{bank.name}</span>
                          {bank.swift && <span className="text-xs text-slate-400">SWIFT: {bank.swift}</span>}
                        </div>
                        {paymentDetails.bankCode === bank.code && <Check className="w-5 h-5 text-green-500" />}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('bankCode', 'OTHER');
                        handleFieldChange('bankName', '');
                        setShowBankDropdown(false);
                        setBankSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${paymentDetails.bankCode === 'OTHER' ? 'bg-green-500/20' : 'hover:bg-[#2a2a2a]'}`}
                    >
                      <span className="text-white">Other Bank (Not Listed)</span>
                      {paymentDetails.bankCode === 'OTHER' && <Check className="w-5 h-5 text-green-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Show selected bank confirmation */}
            {selectedBank && !showBankDropdown && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-green-400 font-medium">Selected: </span>
                  <span className="text-white">{selectedBank.name}</span>
                  {selectedBank.swift && <span className="text-slate-400 ml-2">({selectedBank.swift})</span>}
                </div>
              </div>
            )}
          </div>
        )}
        
        {paymentDetails.bankCode === 'OTHER' && (
          <div className="space-y-4 pl-2 border-l-2 border-slate-700">
            <div className="space-y-3">
              <Label className="text-white text-sm font-medium">Bank Name</Label>
              <Input 
                type="text" 
                placeholder="Enter your bank name" 
                value={paymentDetails.customBankName || ''} 
                onChange={(e) => handleFieldChange('customBankName', e.target.value)} 
                className="h-12 bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white text-sm font-medium">SWIFT/BIC Code</Label>
              <Input 
                type="text" 
                placeholder="XXXXXXXX" 
                value={paymentDetails.customSwiftCode || ''} 
                onChange={(e) => handleFieldChange('customSwiftCode', e.target.value.toUpperCase().slice(0, 11))} 
                className="h-12 font-mono bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
          </div>
        )}
        
        {isIBAN && (
          <div className="space-y-3">
            <Label className="text-white text-sm font-semibold">IBAN</Label>
            <Input 
              type="text" 
              placeholder={bankingSystem?.ibanExample || `${country}XX XXXX XXXX XXXX`} 
              value={paymentDetails.iban || ''} 
              onChange={(e) => handleFieldChange('iban', formatIBAN(e.target.value))} 
              className="h-14 text-base font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
            />
            <p className="text-xs text-slate-400">{bankingSystem?.ibanLength ? `${bankingSystem.ibanLength} characters maximum` : 'International Bank Account Number'}</p>
          </div>
        )}
        
        {isRouting && !isSortCode && !isBSB && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">{bankingSystem?.routingName || 'Routing Number'}</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XXXXXXXXX" 
                value={paymentDetails.routingNumber || ''} 
                onChange={(e) => handleFieldChange('routingNumber', formatRoutingNumber(e.target.value))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">Account Number</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XXXXXXXXXXXX" 
                value={paymentDetails.accountNumber || ''} 
                onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">Account Type</Label>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => handleFieldChange('accountType', 'checking')} 
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${paymentDetails.accountType === 'checking' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#1E1E1E] border-[#444] text-slate-400 hover:border-green-500/50'}`}
                >
                  Checking
                </button>
                <button 
                  type="button" 
                  onClick={() => handleFieldChange('accountType', 'savings')} 
                  className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${paymentDetails.accountType === 'savings' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#1E1E1E] border-[#444] text-slate-400 hover:border-green-500/50'}`}
                >
                  Savings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isSortCode && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">Sort Code</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XX-XX-XX" 
                value={paymentDetails.sortCode || ''} 
                onChange={(e) => handleFieldChange('sortCode', formatSortCode(e.target.value))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">Account Number</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XXXXXXXX" 
                value={paymentDetails.accountNumber || ''} 
                onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 8))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
          </div>
        )}
        
        {isBSB && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">BSB Number</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XXX-XXX" 
                value={paymentDetails.bsbNumber || ''} 
                onChange={(e) => handleFieldChange('bsbNumber', formatBSB(e.target.value))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white text-sm font-semibold">Account Number</Label>
              <Input 
                type="text" 
                inputMode="numeric" 
                placeholder="XXXXXXXXX" 
                value={paymentDetails.accountNumber || ''} 
                onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 9))} 
                className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
              />
            </div>
          </div>
        )}
        
        {/* Account Holder Name - for bank transfers only */}
        <div className="space-y-4 mt-2">
          <Label className="text-white text-sm font-semibold">Account Holder Name</Label>
          <Input 
            type="text" 
            placeholder="Full name as it appears on your account" 
            value={paymentDetails.accountHolderName || ''} 
            onChange={(e) => handleFieldChange('accountHolderName', e.target.value)} 
            className="h-12 bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 rounded-xl" 
          />
        </div>
        
        {bankingSystem && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-semibold mb-1">
                  {bankingSystem.paymentSystem === 'iban' ? 'IBAN Transfer' : bankingSystem.paymentSystem === 'routing' ? 'Bank Transfer' : 'Direct Transfer'}
                </p>
                <p className="text-slate-400 text-xs">
                  Funds will be transferred to your {bankingSystem.currency} account. Processing time: 1-3 business days.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback for card (non-Russia countries without bank transfer)
  if (method === 'card') {
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-white flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="w-4 h-4 text-green-500" />
            {t('cardNumber')}
          </Label>
          <Input 
            type="text" 
            inputMode="numeric" 
            placeholder="0000 0000 0000 0000" 
            value={paymentDetails.cardNumber || ''} 
            onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))} 
            className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20 rounded-xl" 
          />
          <p className="text-xs text-slate-400">{bankingSystem?.cardLength || 16} digits</p>
        </div>
      </div>
    );
  }
  
  // Mobile payment
  if (method === 'mobile_money' || method === 'phone') {
    const phoneCode = bankingSystem?.phoneCode || '+1';
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          <Label className="text-white flex items-center gap-2 text-sm font-semibold">
            <Phone className="w-4 h-4 text-green-500" />
            {t('phoneNumber')}
          </Label>
          <Input 
            type="text" 
            inputMode="tel" 
            placeholder={bankingSystem?.phoneFormat || `${phoneCode} XXX XXX XXXX`} 
            value={paymentDetails.phoneNumber || ''} 
            onChange={(e) => handleFieldChange('phoneNumber', formatPhoneNumber(e.target.value, phoneCode))} 
            className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-2 border-[#444] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20 rounded-xl" 
          />
          <p className="text-xs text-slate-400">{bankingSystem?.mobilePaymentName || 'Mobile Money'}</p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default WithdrawalBankingFields;
