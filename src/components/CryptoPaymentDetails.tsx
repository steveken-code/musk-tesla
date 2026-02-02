import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Loader2, Wallet, MessageCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatUSDT } from '@/lib/formatCurrency';

interface CryptoPaymentDetailsProps {
  amount: number;
}

interface CryptoSettings {
  walletAddress: string;
  network: string;
}

const DEFAULT_CRYPTO_SETTINGS: CryptoSettings = {
  walletAddress: 'TFbr4FWR98Z8UWvVSouVMqrZ2mrLkrjsKA',
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
      toast.success(t('walletCopied') || 'Wallet address copied!');
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
    <div className="mt-4 p-5 bg-gradient-to-br from-slate-800/90 to-slate-900/95 rounded-xl border border-slate-600/50 space-y-5 animate-fade-in shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-teal-600/20 flex items-center justify-center ring-1 ring-teal-500/30">
          <Wallet className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-teal-400">USDT Payment</h3>
          <p className="text-xs text-slate-400">{t('cryptoPayment') || 'Cryptocurrency Payment'}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Network */}
        <div className="p-3 bg-slate-700/40 rounded-lg border border-slate-600/50">
          <p className="text-xs text-slate-400 mb-1 font-medium">{t('network') || 'Network'}</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <p className="font-bold text-teal-400">{cryptoSettings.network}</p>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="p-4 bg-slate-700/40 rounded-lg border border-slate-600/50">
          <p className="text-xs text-slate-400 mb-2 font-medium">{t('walletAddress') || 'USDT Wallet Address'}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-slate-800/80 rounded-lg border border-slate-600">
              <p className="font-mono text-sm sm:text-base text-white font-bold break-all tracking-wide leading-relaxed select-all">
                {cryptoSettings.walletAddress}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="p-3 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 transition-all flex-shrink-0 ring-1 ring-teal-500/30 hover:ring-teal-500/50 hover:scale-105"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-teal-400" />
              )}
            </button>
          </div>
        </div>

        {/* Amount to send */}
        <div className="p-4 bg-gradient-to-r from-teal-500/20 to-teal-600/10 rounded-lg border border-teal-500/40">
          <p className="text-xs text-slate-300 mb-1 font-medium">{t('amountToSend') || 'Amount to Send'}</p>
          <p className="text-2xl font-bold text-teal-400">{formatUSDT(amount)}</p>
        </div>
      </div>

      {/* How to Make Payment - Steps */}
      <div className="p-4 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-amber-600/5 rounded-xl border border-amber-500/30">
        <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-500" />
          {t('howToPayCrypto') || 'How to Make USDT Payment:'}
        </p>
        <ol className="text-sm text-muted-foreground space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-500 text-xs font-bold flex items-center justify-center ring-1 ring-amber-500/30">1</span>
            <span className="pt-1">{t('cryptoStep1') || 'Copy the USDT wallet address shown above'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-500 text-xs font-bold flex items-center justify-center ring-1 ring-amber-500/30">2</span>
            <span className="pt-1">{t('cryptoStep2') || 'Open your crypto wallet (Trust Wallet, Binance, Coinbase, etc.) and select USDT'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-500 text-xs font-bold flex items-center justify-center ring-1 ring-amber-500/30">3</span>
            <span className="pt-1">{t('cryptoStep3') || 'Send the exact amount using TRON (TRC20) network - verify this before confirming!'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-500 text-xs font-bold flex items-center justify-center ring-1 ring-amber-500/30">4</span>
            <span className="pt-1">{t('cryptoStep4') || 'Take a screenshot of the completed transaction and send it via WhatsApp for confirmation'}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/20 text-green-500 text-xs font-bold flex items-center justify-center ring-1 ring-green-500/30">5</span>
            <span className="pt-1 font-medium text-green-400">{t('cryptoStep5') || 'Click "Submit Investment Request" to complete your investment'}</span>
          </li>
        </ol>
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-gradient-to-r from-red-500/15 to-red-600/10 rounded-xl border border-red-500/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-bold mb-1">⚠️ {t('important') || 'Important'}</p>
            <p className="text-sm text-red-400/90 leading-relaxed">
              {t('cryptoWarning') || 'Please ensure only USDT is deposited via this address using the correct network. Any other cryptocurrency sent will NOT be credited to your account.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentDetails;
