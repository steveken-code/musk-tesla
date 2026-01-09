import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import whatsappIcon from '@/assets/whatsapp-icon.png';

interface SupportSettings {
  whatsappEnabled: boolean;
  whatsappPhone: string;
  telegramEnabled: boolean;
  telegramUsername: string;
}

const DEFAULT_SETTINGS: SupportSettings = {
  whatsappEnabled: true,
  whatsappPhone: '+12186500840',
  telegramEnabled: false,
  telegramUsername: '',
};

const SupportButtons = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<SupportSettings>(DEFAULT_SETTINGS);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'support_settings')
          .maybeSingle();
        
        if (data?.setting_value) {
          const value = data.setting_value as unknown as SupportSettings;
          setSettings({
            whatsappEnabled: value.whatsappEnabled ?? DEFAULT_SETTINGS.whatsappEnabled,
            whatsappPhone: value.whatsappPhone || DEFAULT_SETTINGS.whatsappPhone,
            telegramEnabled: value.telegramEnabled ?? DEFAULT_SETTINGS.telegramEnabled,
            telegramUsername: value.telegramUsername || DEFAULT_SETTINGS.telegramUsername,
          });
        }
      } catch (error) {
        console.error('Error loading support settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Pages where user is in investment/dashboard area - no pre-filled message
  const investmentPages = ['/dashboard', '/admin', '/transaction-history'];
  const isInvestmentArea = investmentPages.some(page => location.pathname.startsWith(page));
  
  // Only include the message when user is on main website pages
  const message = isInvestmentArea 
    ? '' 
    : encodeURIComponent('Hello! I would like to learn more about Tesla stocks.');
  
  const whatsappUrl = message 
    ? `https://wa.me/${settings.whatsappPhone.replace('+', '')}?text=${message}`
    : `https://wa.me/${settings.whatsappPhone.replace('+', '')}`;
  
  // Telegram URL - supports both @username and phone number
  const telegramUrl = settings.telegramUsername.startsWith('@') 
    ? `https://t.me/${settings.telegramUsername.replace('@', '')}`
    : `https://t.me/${settings.telegramUsername.replace('+', '')}`;

  const hasAnyEnabled = settings.whatsappEnabled || settings.telegramEnabled;
  
  if (!hasAnyEnabled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {settings.telegramEnabled && settings.telegramUsername && (
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-12 h-12 bg-[#0088cc] rounded-full shadow-lg hover:scale-105 transition-transform"
          aria-label="Contact us on Telegram"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      )}
      
      {settings.whatsappEnabled && settings.whatsappPhone && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Contact us on WhatsApp"
        >
          <img src={whatsappIcon} alt="WhatsApp" className="w-12 h-12 rounded-full shadow-lg" />
        </a>
      )}
    </div>
  );
};

export default SupportButtons;
