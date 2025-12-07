import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, User, CreditCard } from 'lucide-react';

interface PaymentDetailsProps {
  amount: number;
  rubAmount: number;
}

const PaymentDetails = ({ amount, rubAmount }: PaymentDetailsProps) => {
  const { t } = useLanguage();

  return (
    <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border space-y-3">
      <h3 className="font-semibold text-tesla-red flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        {t('paymentDetails')}
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">{t('accountNumber')}:</span>
            <p className="font-mono font-semibold text-foreground">2200500174446743</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div>
            <span className="text-muted-foreground">{t('bankName')}:</span>
            <p className="font-semibold text-foreground">СОВКОМБАНК (ДОМАШНИЙ БАНК)</p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
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
      
      <p className="text-xs text-muted-foreground text-center pt-2">
        {t('sendReceiptVia')}
      </p>
    </div>
  );
};

export default PaymentDetails;
