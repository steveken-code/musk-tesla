import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface CryptoPaymentDetailsProps {
  amount: number;
}

interface CryptoSettings {
  walletAddress: string;
  network: string;
}

const DEFAULT_CRYPTO_SETTINGS: CryptoSettings = {
  walletAddress: 'TFbr4FWR98Z8UWvVSouVMqrZ2mrLKrjsKA',
  network: 'TRON (TRC20)',
};

const CryptoPaymentDetails = ({ amount }: CryptoPaymentDetailsProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [cryptoSettings, setCryptoSettings] = useState<CryptoSettings>(DEFAULT_CRYPTO_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCryptoSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'crypto_settings')
          .maybeSingle();

        if (error) {
          console.error('Error loading crypto settings:', error);
          return;
        }

        if (data?.setting_value) {
          const settings = data.setting_value as unknown as CryptoSettings;
          setCryptoSettings({
            walletAddress: settings.walletAddress || DEFAULT_CRYPTO_SETTINGS.walletAddress,
            network: settings.network || DEFAULT_CRYPTO_SETTINGS.network,
          });
        }
      } catch (err) {
        console.error('Error loading crypto settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCryptoSettings();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cryptoSettings.walletAddress);
      setCopied(true);
      toast.success(t('copied') || 'Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-tesla-red mr-2" />
        <span className="text-muted-foreground text-sm">Loading payment details...</span>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30 space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-400">USDT Deposit</h3>
          <p className="text-xs text-muted-foreground">Cryptocurrency Payment</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Network */}
        <div className="p-3 bg-background/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('network') || 'Network'}</p>
          <p className="font-semibold text-amber-400 text-sm">{cryptoSettings.network}</p>
        </div>

        {/* Wallet Address */}
        <div className="p-3 bg-background/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground mb-1">{t('walletAddress') || 'USDT Wallet Address'}</p>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs sm:text-sm text-foreground break-all flex-1">
              {cryptoSettings.walletAddress}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-colors flex-shrink-0"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Amount to send */}
        <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-500/30">
          <p className="text-xs text-muted-foreground mb-1">{t('amountToSend') || 'Amount to Send'}</p>
          <p className="text-xl font-bold text-amber-400">${amount.toLocaleString()} USDT</p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
        <p className="text-xs text-red-400 font-medium mb-2">⚠️ {t('important') || 'Important'}</p>
        <p className="text-sm text-red-400 font-semibold leading-relaxed">
          {t('cryptoWarning') || 'Please make sure that only USDT deposit is made via this address. Otherwise, your investment will not be activated.'}
        </p>
      </div>
      
      {/* Investment Guidelines */}
      <div className="pt-3 border-t border-border">
        <p className="text-sm font-semibold text-foreground mb-2">{t('investmentSteps') || 'Steps to Complete Investment:'}</p>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>{t('cryptoStep1') || 'Send the exact USDT amount to the wallet address above'}</li>
          <li>{t('cryptoStep2') || 'Take a screenshot of the transaction'}</li>
          <li>{t('cryptoStep3') || 'Send transaction proof via WhatsApp'}</li>
          <li>{t('cryptoStep4') || 'Click "Submit Investment Request"'}</li>
        </ol>
      </div>
    </div>
  );
};

export default CryptoPaymentDetails;
