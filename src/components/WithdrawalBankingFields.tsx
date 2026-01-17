import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { countryBankingSystems, Bank } from '@/data/countryBankingSystems';
import { ChevronDown, Check, Building2, CreditCard, Phone, Wallet, AlertCircle } from 'lucide-react';

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
  
  const bankingSystem = countryBankingSystems[country];
  
  const handleFieldChange = (field: string, value: string) => {
    onPaymentDetailsChange({ ...paymentDetails, [field]: value });
  };
  
  const formatIBAN = (value: string): string => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
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
    const cleaned = value.replace(/\D/g, '').slice(0, 19);
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

  // For Russia: Keep existing card/phone format
  if (country === 'RU') {
    if (method === 'card') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {t('cardNumber')}
            </Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={paymentDetails.cardNumber || ''}
              onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))}
              className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20"
            />
            <p className="text-xs text-muted-foreground">16 digits</p>
          </div>
        </div>
      );
    }
    
    if (method === 'phone') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('phoneNumber')} (SBP)
            </Label>
            <Input
              type="text"
              inputMode="tel"
              placeholder="+7 XXX XXX XX XX"
              value={paymentDetails.phoneNumber || ''}
              onChange={(e) => handleFieldChange('phoneNumber', formatPhoneNumber(e.target.value, '+7'))}
              className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20"
            />
            <p className="text-xs text-muted-foreground">Format: +7 XXX XXX XX XX</p>
          </div>
        </div>
      );
    }
  }
  
  // For crypto - universal
  if (method === 'crypto') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            USDT (TRC20) {t('walletAddress')}
          </Label>
          <Input
            type="text"
            placeholder="T..."
            value={paymentDetails.cryptoAddress || ''}
            onChange={(e) => handleFieldChange('cryptoAddress', e.target.value)}
            className="h-14 text-base font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20"
          />
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Only USDT on TRON (TRC20) network
          </p>
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
      <div className="space-y-4">
        {/* Bank Selection */}
        {bankingSystem?.banks && bankingSystem.banks.length > 0 && (
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {t('selectBank')}
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
                className="w-full flex items-center justify-between p-4 bg-[#1E1E1E] border-2 border-[#444] rounded-xl hover:border-green-500/50 transition-colors text-left"
              >
                {selectedBank ? (
                  <div>
                    <span className="font-semibold text-white block">{selectedBank.name}</span>
                    {selectedBank.swift && (
                      <span className="text-xs text-muted-foreground">SWIFT: {selectedBank.swift}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-[#888]">{t('chooseBank')}</span>
                )}
                <ChevronDown className={`w-5 h-5 text-[#888] transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showBankDropdown && (
                <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border-2 border-[#444] rounded-xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                  {bankingSystem.banks.map((bank: Bank) => (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => {
                        handleFieldChange('bankCode', bank.code);
                        handleFieldChange('bankName', bank.name);
                        if (bank.swift) handleFieldChange('swiftCode', bank.swift);
                        setShowBankDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 transition-colors border-b border-[#333] last:border-b-0 ${
                        paymentDetails.bankCode === bank.code ? 'bg-green-500/20' : 'hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <div className="text-left">
                        <span className="font-semibold text-white block">{bank.name}</span>
                        {bank.swift && <span className="text-xs text-muted-foreground">SWIFT: {bank.swift}</span>}
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
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${paymentDetails.bankCode === 'OTHER' ? 'bg-green-500/20' : 'hover:bg-[#2a2a2a]'}`}
                  >
                    <span className="text-white">{t('otherBank')}</span>
                    {paymentDetails.bankCode === 'OTHER' && <Check className="w-5 h-5 text-green-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {paymentDetails.bankCode === 'OTHER' && (
          <>
            <div className="space-y-2">
              <Label className="text-white">{t('bankName')}</Label>
              <Input type="text" placeholder="Enter your bank name" value={paymentDetails.customBankName || ''} onChange={(e) => handleFieldChange('customBankName', e.target.value)} className="h-12 bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">SWIFT/BIC Code</Label>
              <Input type="text" placeholder="XXXXXXXX" value={paymentDetails.customSwiftCode || ''} onChange={(e) => handleFieldChange('customSwiftCode', e.target.value.toUpperCase().slice(0, 11))} className="h-12 font-mono bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
            </div>
          </>
        )}
        
        {isIBAN && (
          <div className="space-y-2">
            <Label className="text-white">IBAN</Label>
            <Input type="text" placeholder={bankingSystem?.ibanExample || `${country}XX XXXX XXXX XXXX`} value={paymentDetails.iban || ''} onChange={(e) => handleFieldChange('iban', formatIBAN(e.target.value))} className="h-14 text-base font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
            <p className="text-xs text-muted-foreground">{bankingSystem?.ibanLength ? `${bankingSystem.ibanLength} characters` : 'International Bank Account Number'}</p>
          </div>
        )}
        
        {isRouting && !isSortCode && !isBSB && (
          <>
            <div className="space-y-2">
              <Label className="text-white">{bankingSystem?.routingName || 'Routing Number'}</Label>
              <Input type="text" inputMode="numeric" placeholder="XXXXXXXXX" value={paymentDetails.routingNumber || ''} onChange={(e) => handleFieldChange('routingNumber', formatRoutingNumber(e.target.value))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Account Number</Label>
              <Input type="text" inputMode="numeric" placeholder="XXXXXXXXXXXX" value={paymentDetails.accountNumber || ''} onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Account Type</Label>
              <div className="flex gap-3">
                <button type="button" onClick={() => handleFieldChange('accountType', 'checking')} className={`flex-1 py-3 rounded-lg border-2 transition-colors ${paymentDetails.accountType === 'checking' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#1E1E1E] border-[#444] text-muted-foreground hover:border-green-500/50'}`}>Checking</button>
                <button type="button" onClick={() => handleFieldChange('accountType', 'savings')} className={`flex-1 py-3 rounded-lg border-2 transition-colors ${paymentDetails.accountType === 'savings' ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#1E1E1E] border-[#444] text-muted-foreground hover:border-green-500/50'}`}>Savings</button>
              </div>
            </div>
          </>
        )}
        
        {isSortCode && (
          <>
            <div className="space-y-2"><Label className="text-white">Sort Code</Label><Input type="text" inputMode="numeric" placeholder="XX-XX-XX" value={paymentDetails.sortCode || ''} onChange={(e) => handleFieldChange('sortCode', formatSortCode(e.target.value))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" /></div>
            <div className="space-y-2"><Label className="text-white">Account Number</Label><Input type="text" inputMode="numeric" placeholder="XXXXXXXX" value={paymentDetails.accountNumber || ''} onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 8))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" /></div>
          </>
        )}
        
        {isBSB && (
          <>
            <div className="space-y-2"><Label className="text-white">BSB Number</Label><Input type="text" inputMode="numeric" placeholder="XXX-XXX" value={paymentDetails.bsbNumber || ''} onChange={(e) => handleFieldChange('bsbNumber', formatBSB(e.target.value))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" /></div>
            <div className="space-y-2"><Label className="text-white">Account Number</Label><Input type="text" inputMode="numeric" placeholder="XXXXXXXXX" value={paymentDetails.accountNumber || ''} onChange={(e) => handleFieldChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 9))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" /></div>
          </>
        )}
        
        <div className="space-y-2">
          <Label className="text-white">{t('accountHolderName')}</Label>
          <Input type="text" placeholder="Full name as it appears on your account" value={paymentDetails.accountHolderName || ''} onChange={(e) => handleFieldChange('accountHolderName', e.target.value)} className="h-12 bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500" />
        </div>
        
        {bankingSystem && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-400 font-medium mb-1">{bankingSystem.paymentSystem === 'iban' ? 'IBAN' : bankingSystem.paymentSystem === 'routing' ? 'Bank Transfer' : 'Direct Transfer'}</p>
                <p className="text-muted-foreground text-xs">Funds will be transferred to your {bankingSystem.currency} account.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback for card
  if (method === 'card') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2"><CreditCard className="w-4 h-4" />{t('cardNumber')}</Label>
          <Input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" value={paymentDetails.cardNumber || ''} onChange={(e) => handleFieldChange('cardNumber', formatCardNumber(e.target.value))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20" />
        </div>
      </div>
    );
  }
  
  // Mobile payment
  if (method === 'mobile_money' || method === 'phone') {
    const phoneCode = bankingSystem?.phoneCode || '+1';
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white flex items-center gap-2"><Phone className="w-4 h-4" />{t('phoneNumber')}</Label>
          <Input type="text" inputMode="tel" placeholder={bankingSystem?.phoneFormat || `${phoneCode} XXX XXX XXXX`} value={paymentDetails.phoneNumber || ''} onChange={(e) => handleFieldChange('phoneNumber', formatPhoneNumber(e.target.value, phoneCode))} className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#666] focus:border-green-500 focus:ring-green-500/20" />
          <p className="text-xs text-muted-foreground">{bankingSystem?.mobilePaymentName || 'Mobile Money'}</p>
        </div>
      </div>
    );
  }
  
  return null;
};

export default WithdrawalBankingFields;
