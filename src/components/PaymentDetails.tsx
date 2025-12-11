import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, User, CreditCard, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetailsProps {
  amount: number;
  rubAmount: number;
}

const PaymentDetails = ({ amount, rubAmount }: PaymentDetailsProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  const cardNumber = '2200500174446743';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      toast.success(t('copied') || 'Card number copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border space-y-3 animate-fade-in">
      <h3 className="font-semibold text-tesla-red flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        {t('paymentDetails')}
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1">
            <span className="text-muted-foreground">{t('cardNumber') || 'Card Number'}:</span>
            <div className="flex items-center gap-2">
              <p className="font-mono font-semibold text-foreground">{cardNumber}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Copy card number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="text-muted-foreground">{t('bankName')}:</span>
            <p className="font-semibold text-foreground">СОВКОМБАНК (ДОМАШНИЙ БАНК)</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="text-muted-foreground">{t('accountHolder')}:</span>
            <p className="font-semibold text-foreground">ЕЛЬЧАНИНОВ ИГОРЬ СЕРГЕЕВИЧ</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">{t('usdToRub')}:</span>
          <span className="text-xl font-bold text-electric-blue">₽{rubAmount.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Investment Guidelines */}
      <div className="pt-3 border-t border-border mt-3">
        <p className="text-sm font-semibold text-foreground mb-2">{t('investmentSteps') || 'Steps to Complete Investment:'}</p>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>{t('step1') || 'Make payment to the account details above'}</li>
          <li>{t('step2') || 'Send payment receipt via WhatsApp'}</li>
          <li>{t('step3') || 'Click "Submit Investment Request"'}</li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentDetails;
