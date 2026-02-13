import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  LogOut, TrendingUp, DollarSign, Clock, 
  CheckCircle, XCircle, Loader2, ArrowLeft,
  Wallet, Globe, AlertCircle, Mail, RefreshCw,
  CreditCard, Phone, Bitcoin, ChevronDown, X, History, Search,
  Menu, Home, BarChart3, Settings, User, Activity, PieChart, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import SupportButtons from '@/components/SupportButtons';
import LiveChatWidget from '@/components/LiveChatWidget';
// TeslaChart removed from dashboard layout
import InvestmentChart from '@/components/InvestmentChart';
import PaymentDetails from '@/components/PaymentDetails';
import CryptoPaymentDetails from '@/components/CryptoPaymentDetails';
import InvestmentCountrySelector from '@/components/InvestmentCountrySelector';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import WithdrawalBankingFields from '@/components/WithdrawalBankingFields';
import LiveTradingFeed from '@/components/LiveTradingFeed';
import InvestmentProgressTracker from '@/components/InvestmentProgressTracker';
import PriceTicker from '@/components/PriceTicker';
import DashboardSidebar from '@/components/DashboardSidebar';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import DashboardSectionHeader from '@/components/dashboard/DashboardSectionHeader';
import InvestmentPortfolio from '@/components/dashboard/InvestmentPortfolio';
import PopularStocksTable from '@/components/dashboard/PopularStocksTable';
import ActionsPanel from '@/components/dashboard/ActionsPanel';
import ReferralBonus from '@/components/dashboard/ReferralBonus';
import InvestmentPlans, { useTierPlans, getTierForAmount } from '@/components/InvestmentPlans';

// StockMarketWidget removed from dashboard layout
import ProfileCompletionModal from '@/components/ProfileCompletionModal';
import teslaLogo from '@/assets/tesla-logo-red.png';
import { countryBankingSystems } from '@/data/countryBankingSystems';
import { formatCurrencyValue } from '@/lib/formatCurrency';

// Create notification sound using Web Audio API
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant notification chime
    const createChime = () => {
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      // Chord: C and E
      oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      
      // Fade in and out
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      oscillator2.stop(audioContext.currentTime + 0.5);
    };
    
    // Add second chime after delay
    setTimeout(() => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime); // G5
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    }, 150);
    
    createChime();
  } catch (error) {
    console.log('Audio notification not supported');
  }
};

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  country: string;
  payment_details: string;
  status: string;
  hold_message: string | null;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
  email_verified: boolean;
  avatar_url: string | null;
}

interface ReferredBonusData {
  amount: number;
  status: string;
}

const USD_TO_RUB = 96.5;

// localStorage keys for form persistence
const STORAGE_KEY_INVEST_AMOUNT = 'tesla_invest_amount';
const STORAGE_KEY_SHOW_PAYMENT = 'tesla_show_payment';

// Base withdrawal methods - varies by country
// Helper function to format method names properly
const formatMethodName = (code: string): string => {
  const methodNames: Record<string, string> = {
    'bank_transfer': 'Bank Transfer',
    'card': 'Bank Card',
    'phone': 'Mobile Payment',
    'crypto': 'Cryptocurrency',
    'mobile_money': 'Mobile Money'
  };
  return methodNames[code] || code.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getWithdrawalMethods = (country: string) => {
  const bankingSystem = countryBankingSystems[country];
  const methods = [];
  
  // For countries with IBAN or routing systems, add bank transfer as primary option
  if (bankingSystem && (bankingSystem.paymentSystem === 'iban' || bankingSystem.paymentSystem === 'routing')) {
    methods.push({ 
      code: 'bank_transfer', 
      name: 'Bank Transfer', 
      icon: CreditCard, 
      description: bankingSystem.paymentSystem === 'iban' ? 'IBAN Transfer' : 'Direct Bank Transfer',
      primary: true
    });
  }
  
  // Only add card option for Russia
  if (country === 'RU') {
    methods.push({ code: 'card', name: 'Bank Card', icon: CreditCard, description: 'Debit or Credit Card' });
  }
  
  // Only add SBP/Phone option for Russia
  if (country === 'RU') {
    methods.push({ code: 'phone', name: 'Mobile Payment', icon: Phone, description: 'Phone Number (SBP)' });
  }
  
  // Always add crypto - recommended option
  methods.push({ code: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, description: 'USDT', recommended: true });
  
  return methods;
};

const allCountries = [
  // Europe
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  // North America
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  // Central America
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  // Caribbean
  { code: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  // South America
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  // Asia - East Asia
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'MO', name: 'Macau', flag: '🇲🇴' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  // Asia - Southeast Asia
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  // Asia - South Asia
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  // Asia - Central Asia
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  // Asia - Western Asia (Middle East)
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  // Africa - North Africa
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  // Africa - West Africa
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  // Africa - Central Africa
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CG', name: 'Republic of the Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'ST', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  // Africa - East Africa
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  // Africa - Southern Africa
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
];

// Card type detection
// Country-specific banking formats
const countryBankingFormats: Record<string, { 
  cardLength: number; 
  phoneCode: string; 
  phoneLength: number; 
  phoneFormat: string;
  cardFormat: string;
}> = {
  RU: { cardLength: 16, phoneCode: '+7', phoneLength: 11, phoneFormat: '+7 XXX XXX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  US: { cardLength: 16, phoneCode: '+1', phoneLength: 11, phoneFormat: '+1 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  GB: { cardLength: 16, phoneCode: '+44', phoneLength: 12, phoneFormat: '+44 XXXX XXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  DE: { cardLength: 16, phoneCode: '+49', phoneLength: 13, phoneFormat: '+49 XXX XXXXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  FR: { cardLength: 16, phoneCode: '+33', phoneLength: 11, phoneFormat: '+33 X XX XX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CN: { cardLength: 19, phoneCode: '+86', phoneLength: 13, phoneFormat: '+86 XXX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX XXX' },
  JP: { cardLength: 16, phoneCode: '+81', phoneLength: 12, phoneFormat: '+81 XX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  KR: { cardLength: 16, phoneCode: '+82', phoneLength: 12, phoneFormat: '+82 XX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  BR: { cardLength: 16, phoneCode: '+55', phoneLength: 13, phoneFormat: '+55 XX XXXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  AE: { cardLength: 16, phoneCode: '+971', phoneLength: 12, phoneFormat: '+971 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  IN: { cardLength: 16, phoneCode: '+91', phoneLength: 12, phoneFormat: '+91 XXXXX XXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  AU: { cardLength: 16, phoneCode: '+61', phoneLength: 11, phoneFormat: '+61 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CA: { cardLength: 16, phoneCode: '+1', phoneLength: 11, phoneFormat: '+1 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  IT: { cardLength: 16, phoneCode: '+39', phoneLength: 12, phoneFormat: '+39 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  ES: { cardLength: 16, phoneCode: '+34', phoneLength: 11, phoneFormat: '+34 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  NL: { cardLength: 16, phoneCode: '+31', phoneLength: 11, phoneFormat: '+31 X XXXXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CH: { cardLength: 16, phoneCode: '+41', phoneLength: 11, phoneFormat: '+41 XX XXX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  SE: { cardLength: 16, phoneCode: '+46', phoneLength: 11, phoneFormat: '+46 XX XXX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  NO: { cardLength: 16, phoneCode: '+47', phoneLength: 10, phoneFormat: '+47 XXX XX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  DK: { cardLength: 16, phoneCode: '+45', phoneLength: 10, phoneFormat: '+45 XX XX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  FI: { cardLength: 16, phoneCode: '+358', phoneLength: 12, phoneFormat: '+358 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  PL: { cardLength: 16, phoneCode: '+48', phoneLength: 11, phoneFormat: '+48 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  AT: { cardLength: 16, phoneCode: '+43', phoneLength: 12, phoneFormat: '+43 XXX XXXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  BE: { cardLength: 16, phoneCode: '+32', phoneLength: 11, phoneFormat: '+32 XXX XX XX XX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  PT: { cardLength: 16, phoneCode: '+351', phoneLength: 12, phoneFormat: '+351 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  GR: { cardLength: 16, phoneCode: '+30', phoneLength: 12, phoneFormat: '+30 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CZ: { cardLength: 16, phoneCode: '+420', phoneLength: 12, phoneFormat: '+420 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  HU: { cardLength: 16, phoneCode: '+36', phoneLength: 11, phoneFormat: '+36 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  RO: { cardLength: 16, phoneCode: '+40', phoneLength: 11, phoneFormat: '+40 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  UA: { cardLength: 16, phoneCode: '+380', phoneLength: 12, phoneFormat: '+380 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  TR: { cardLength: 16, phoneCode: '+90', phoneLength: 12, phoneFormat: '+90 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  SA: { cardLength: 16, phoneCode: '+966', phoneLength: 12, phoneFormat: '+966 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  IL: { cardLength: 16, phoneCode: '+972', phoneLength: 12, phoneFormat: '+972 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  ZA: { cardLength: 16, phoneCode: '+27', phoneLength: 11, phoneFormat: '+27 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  NG: { cardLength: 16, phoneCode: '+234', phoneLength: 13, phoneFormat: '+234 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  EG: { cardLength: 16, phoneCode: '+20', phoneLength: 12, phoneFormat: '+20 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  KE: { cardLength: 16, phoneCode: '+254', phoneLength: 12, phoneFormat: '+254 XXX XXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  MX: { cardLength: 16, phoneCode: '+52', phoneLength: 12, phoneFormat: '+52 XX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  AR: { cardLength: 16, phoneCode: '+54', phoneLength: 13, phoneFormat: '+54 XX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CL: { cardLength: 16, phoneCode: '+56', phoneLength: 11, phoneFormat: '+56 X XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  CO: { cardLength: 16, phoneCode: '+57', phoneLength: 12, phoneFormat: '+57 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  PE: { cardLength: 16, phoneCode: '+51', phoneLength: 11, phoneFormat: '+51 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  VE: { cardLength: 16, phoneCode: '+58', phoneLength: 12, phoneFormat: '+58 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  TH: { cardLength: 16, phoneCode: '+66', phoneLength: 11, phoneFormat: '+66 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  VN: { cardLength: 16, phoneCode: '+84', phoneLength: 12, phoneFormat: '+84 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  ID: { cardLength: 16, phoneCode: '+62', phoneLength: 13, phoneFormat: '+62 XXX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  MY: { cardLength: 16, phoneCode: '+60', phoneLength: 12, phoneFormat: '+60 XX XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  SG: { cardLength: 16, phoneCode: '+65', phoneLength: 10, phoneFormat: '+65 XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  PH: { cardLength: 16, phoneCode: '+63', phoneLength: 12, phoneFormat: '+63 XXX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  PK: { cardLength: 16, phoneCode: '+92', phoneLength: 12, phoneFormat: '+92 XXX XXXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  BD: { cardLength: 16, phoneCode: '+880', phoneLength: 13, phoneFormat: '+880 XXXX XXXXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  NZ: { cardLength: 16, phoneCode: '+64', phoneLength: 11, phoneFormat: '+64 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  IE: { cardLength: 16, phoneCode: '+353', phoneLength: 12, phoneFormat: '+353 XX XXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  LU: { cardLength: 16, phoneCode: '+352', phoneLength: 11, phoneFormat: '+352 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  HK: { cardLength: 16, phoneCode: '+852', phoneLength: 11, phoneFormat: '+852 XXXX XXXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
  TW: { cardLength: 16, phoneCode: '+886', phoneLength: 12, phoneFormat: '+886 XXX XXX XXX', cardFormat: 'XXXX XXXX XXXX XXXX' },
};

const detectCardType = (cardNumber: string): { type: string; icon: string } | null => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 1) return null;
  if (cleaned.startsWith('4')) return { type: 'Visa', icon: '💳' };
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return { type: 'MasterCard', icon: '💳' };
  if (/^220[0-4]/.test(cleaned)) return { type: 'Mir', icon: '🏦' };
  if (/^3[47]/.test(cleaned)) return { type: 'American Express', icon: '💳' };
  if (/^6(?:011|5)/.test(cleaned)) return { type: 'Discover', icon: '💳' };
  if (/^(?:2131|1800|35)/.test(cleaned)) return { type: 'JCB', icon: '💳' };
  if (/^62/.test(cleaned)) return { type: 'UnionPay', icon: '💳' };
  return null;
};

// Format card number with spaces (country-aware)
const formatCardNumber = (value: string, countryCode: string): string => {
  const format = countryBankingFormats[countryCode] || { cardLength: 16 };
  const cleaned = value.replace(/\D/g, '').slice(0, format.cardLength);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Format phone number based on country
const formatPhoneNumber = (value: string, countryCode: string): string => {
  const format = countryBankingFormats[countryCode];
  if (!format) return value;
  
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  
  const phoneCode = format.phoneCode;
  const codeDigits = phoneCode.replace(/\D/g, '');
  
  // Remove country code from start if present
  let digits = cleaned;
  if (cleaned.startsWith(codeDigits)) {
    digits = cleaned.slice(codeDigits.length);
  }
  
  // Limit to correct length minus country code
  const maxLocalDigits = format.phoneLength - codeDigits.length;
  digits = digits.slice(0, maxLocalDigits);
  
  // Format based on country
  let formatted = phoneCode;
  
  switch (countryCode) {
    case 'RU': // +7 XXX XXX XX XX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
      if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
      if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
      break;
    case 'US': case 'CA': // +1 XXX XXX XXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
      if (digits.length > 6) formatted += ' ' + digits.slice(6, 10);
      break;
    case 'GB': // +44 XXXX XXXXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 4);
      if (digits.length > 4) formatted += ' ' + digits.slice(4, 10);
      break;
    case 'DE': case 'AT': // +49 XXX XXXXXXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 11);
      break;
    case 'FR': // +33 X XX XX XX XX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 1);
      if (digits.length > 1) formatted += ' ' + digits.slice(1, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      break;
    case 'CN': // +86 XXX XXXX XXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 11);
      break;
    case 'IN': // +91 XXXXX XXXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 10);
      break;
    case 'BR': // +55 XX XXXXX XXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 11);
      break;
    case 'JP': case 'KR': // +81/82 XX XXXX XXXX
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 6);
      if (digits.length > 6) formatted += ' ' + digits.slice(6, 10);
      break;
    default: // Default grouping
      const remaining = digits;
      if (remaining.length > 0) formatted += ' ' + remaining.slice(0, 3);
      if (remaining.length > 3) formatted += ' ' + remaining.slice(3, 6);
      if (remaining.length > 6) formatted += ' ' + remaining.slice(6, 10);
      break;
  }
  
  return formatted;
};

// Get validation info for current country
const getValidationInfo = (countryCode: string, method: string) => {
  const format = countryBankingFormats[countryCode];
  if (!format) {
    return { expectedLength: method === 'card' ? 16 : 11, format: method === 'card' ? 'XXXX XXXX XXXX XXXX' : '+X XXX XXX XXXX' };
  }
  if (method === 'card') {
    return { expectedLength: format.cardLength, format: format.cardFormat };
  }
  return { expectedLength: format.phoneLength, format: format.phoneFormat };
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investAmount, setInvestAmount] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_INVEST_AMOUNT) || '';
    }
    return '';
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedAmount = localStorage.getItem(STORAGE_KEY_INVEST_AMOUNT);
      const savedShowPayment = localStorage.getItem(STORAGE_KEY_SHOW_PAYMENT);
      if (savedAmount && parseFloat(savedAmount) >= 500 && savedShowPayment === 'true') {
        return true;
      }
    }
    return false;
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const previousProfitsRef = useRef<Record<string, number>>({});

  // Investment country state
  const [investCountry, setInvestCountry] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tesla_invest_country') || '';
    }
    return '';
  });

  // Handler to clear amount when country changes (to reload payment for new country)
  const handleInvestCountryChange = (countryCode: string) => {
    // If changing to a different country, clear the amount so user must re-enter
    if (countryCode !== investCountry) {
      setInvestAmount('');
      setShowPaymentDetails(false);
      localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
      localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
    }
    setInvestCountry(countryCode);
  };

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawCountry, setWithdrawCountry] = useState('');
  const [withdrawPaymentDetails, setWithdrawPaymentDetails] = useState('');
  const [bankingPaymentDetails, setBankingPaymentDetails] = useState<Record<string, string>>({});
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Referral bonus state - for referred user's $100 bonus
  const [referredBonus, setReferredBonus] = useState<ReferredBonusData | null>(null);
  // Referrer bonus state - for user who referred others ($500 per referral)
  const [referrerBonusTotal, setReferrerBonusTotal] = useState(0);
  const [countrySearch, setCountrySearch] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [highlightInvestForm, setHighlightInvestForm] = useState(false);

  const rubAmount = investAmount ? Math.round(parseFloat(investAmount) * USD_TO_RUB) : 0;
  const detectedCard = withdrawPaymentDetails ? detectCardType(withdrawPaymentDetails) : null;

  // Persist investment country to localStorage
  useEffect(() => {
    if (investCountry) {
      localStorage.setItem('tesla_invest_country', investCountry);
    } else {
      localStorage.removeItem('tesla_invest_country');
    }
  }, [investCountry]);

   // Persist investment amount to localStorage (keep country separate so it persists)
   useEffect(() => {
    // If user has cleared the amount, only clear amount-related localStorage (not country)
    if (!investAmount || investAmount.trim() === '') {
      localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
      localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
      setShowPaymentDetails(false);
      return; // Don't clear country - user may return after payment
    }
   
   // Only persist if both country and amount are set
    if (investAmount && investCountry) {
      localStorage.setItem(STORAGE_KEY_INVEST_AMOUNT, investAmount);
      if (parseFloat(investAmount) >= 500) {
        localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'true');
        setShowPaymentDetails(true);
      } else {
        localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'false');
        setShowPaymentDetails(false);
      }
    }
  }, [investAmount, investCountry]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Auto-focus country search input when dropdown opens
  useEffect(() => {
    if (showCountryDropdown && countrySearchInputRef.current) {
      requestAnimationFrame(() => {
        countrySearchInputRef.current?.focus({ preventScroll: true });
      });
    }
  }, [showCountryDropdown]);

  // Close country dropdown when clicking outside
  useEffect(() => {
    if (!showCountryDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  useEffect(() => {
    if (user) {
      fetchData();
      
      const channel = supabase
        .channel('investments-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'investments',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as Investment;
            const previousProfit = previousProfitsRef.current[updated.id] || 0;
            
            if (updated.profit_amount > previousProfit) {
              const profitDiff = updated.profit_amount - previousProfit;
              // Play notification sound
              createNotificationSound();
              toast.success(t('profitNotification'), {
                description: `${t('profitMessage')} +$${profitDiff.toLocaleString()}!`,
              });
            }
            
            setInvestments(prev => 
              prev.map(inv => inv.id === updated.id ? updated : inv)
            );
            
            previousProfitsRef.current[updated.id] = updated.profit_amount;
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, t]);

  // Show payment details with loading delay
  useEffect(() => {
    if (investAmount && parseFloat(investAmount) >= 500) {
      setLoadingPayment(true);
      setShowPaymentDetails(false);
      const timer = setTimeout(() => {
        setLoadingPayment(false);
        setShowPaymentDetails(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowPaymentDetails(false);
      setLoadingPayment(false);
    }
  }, [investAmount]);

  const fetchData = async () => {
    try {
      const [investmentsRes, profileRes, withdrawalsRes, referredBonusRes, referrerBonusRes] = await Promise.all([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('full_name, email, email_verified, avatar_url')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        // Check if current user was referred (to get their $100 bonus)
        supabase
          .from('referrals')
          .select('referred_bonus, status')
          .eq('referred_user_id', user!.id)
          .maybeSingle(),
        // Get referrer bonuses (for users who referred others)
        supabase
          .from('referrals')
          .select('bonus_amount, status')
          .eq('referrer_user_id', user!.id)
      ]);

      if (investmentsRes.data) {
        setInvestments(investmentsRes.data);
        investmentsRes.data.forEach(inv => {
          previousProfitsRef.current[inv.id] = inv.profit_amount;
        });
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
        // Profile completion is now optional - users can update anytime via header/sidebar
      }
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data as Withdrawal[]);
      
      // Set referred bonus (the $100 the user received for signing up with a code)
      if (referredBonusRes.data) {
        setReferredBonus({
          amount: referredBonusRes.data.referred_bonus || 100,
          status: referredBonusRes.data.status || 'pending'
        });
      }
      
      // Calculate total referrer bonus ($500 per active/paid referral)
      if (referrerBonusRes.data) {
        const paidReferralBonus = referrerBonusRes.data
          .filter(r => r.status === 'active' || r.status === 'paid')
          .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);
        setReferrerBonusTotal(paidReferralBonus);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(investAmount);
    
    if (isNaN(amount) || amount < 500) {
      toast.error('Minimum investment is $500');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('investments')
        .insert({ user_id: user!.id, amount, status: 'pending' });

      if (error) throw error;
      
      // Send admin notification for new investment
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: 'investment',
            userEmail: profile?.email || user?.email || '',
            userName: profile?.full_name || user?.user_metadata?.full_name || 'User',
            amount: amount,
          },
        });
      } catch (notifyError) {
        console.error('Error sending admin notification:', notifyError);
      }
      
      toast.success('Investment submitted successfully! Your investment is now pending activation.');
      setInvestAmount('');
      setInvestCountry('');
      setShowPaymentDetails(false);
      // Clear persisted data after successful submission
      localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
      localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
      localStorage.removeItem('tesla_invest_country');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawStart = () => {
    // Check if there's already a pending or on_hold withdrawal
    const hasPendingWithdrawal = withdrawals.some(
      w => w.status === 'pending' || w.status === 'on_hold'
    );
    
    if (hasPendingWithdrawal) {
      toast.error(t('pendingWithdrawalExists') || 'You already have a pending withdrawal request. Please wait for it to be processed.');
      return;
    }
    
    setShowWithdrawalModal(true);
    setWithdrawStep(1);
    setWithdrawAmount('');
    setWithdrawMethod('');
    setWithdrawCountry('');
    setWithdrawPaymentDetails('');
  };

  const handleWithdrawNext = () => {
    if (withdrawStep === 1) {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      if (amount > availableForWithdrawal) {
        toast.error('Amount exceeds available balance for withdrawal');
        return;
      }
      if (availableForWithdrawal <= 0) {
        toast.error('No funds available for withdrawal');
        return;
      }
      setProcessingWithdrawal(true);
      setTimeout(() => {
        setProcessingWithdrawal(false);
        setWithdrawStep(2);
      }, 1000);
    } else if (withdrawStep === 2) {
      if (!withdrawCountry) {
        toast.error('Please select your country');
        return;
      }
      setWithdrawStep(3);
    } else if (withdrawStep === 3) {
      if (!withdrawMethod) {
        toast.error('Please select a withdrawal method');
        return;
      }
      setWithdrawStep(4);
    } else if (withdrawStep === 4) {
      // Validate payment details before moving to confirmation
      if (withdrawMethod === 'crypto') {
        if (!bankingPaymentDetails.cryptoAddress) {
          toast.error('Please enter your USDT wallet address');
          return;
        }
        if (!bankingPaymentDetails.cryptoNetwork) {
          toast.error('Please select a network for your withdrawal');
          return;
        }
      }
      if (withdrawMethod === 'phone' && withdrawCountry === 'RU' && !bankingPaymentDetails.phoneNumber) {
        toast.error('Please enter your phone number');
        return;
      }
      if (withdrawMethod === 'card' && !bankingPaymentDetails.cardNumber) {
        toast.error('Please enter your card number');
        return;
      }
      if (withdrawMethod === 'bank_transfer') {
        const hasAccountInfo = bankingPaymentDetails.iban || bankingPaymentDetails.routingNumber || bankingPaymentDetails.sortCode || bankingPaymentDetails.bsbNumber || bankingPaymentDetails.accountNumber;
        if (!hasAccountInfo || !bankingPaymentDetails.accountHolderName) {
          toast.error('Please fill in all required bank details');
          return;
        }
      }
      setWithdrawStep(5);
    }
  };

  const handleWithdrawSubmit = async () => {
    setSubmittingWithdrawal(true);
    try {
      // Prepare payment details based on method - always use bankingPaymentDetails
      let paymentDetailsStr = '';
      
      if (withdrawMethod === 'crypto') {
        paymentDetailsStr = JSON.stringify({ 
          cryptoAddress: bankingPaymentDetails.cryptoAddress,
          cryptoNetwork: bankingPaymentDetails.cryptoNetwork 
        });
      } else if (withdrawMethod === 'phone' && withdrawCountry === 'RU') {
        paymentDetailsStr = JSON.stringify({ phoneNumber: bankingPaymentDetails.phoneNumber });
      } else if (withdrawMethod === 'card') {
        paymentDetailsStr = JSON.stringify({ cardNumber: bankingPaymentDetails.cardNumber });
      } else if (withdrawMethod === 'bank_transfer') {
        paymentDetailsStr = JSON.stringify(bankingPaymentDetails);
      } else {
        // Fallback for any other case
        paymentDetailsStr = JSON.stringify(bankingPaymentDetails);
      }
        
      // Use edge function for server-side validation
      const { data: response, error: fnError } = await supabase.functions.invoke('create-withdrawal', {
        body: {
          amount: parseFloat(withdrawAmount),
          country: withdrawCountry,
          payment_details: paymentDetailsStr,
          payment_method: withdrawMethod
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to create withdrawal');
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to create withdrawal');
      }

      const withdrawalData = response.data;
      
      // Send withdrawal request email to user
      if (profile?.email && withdrawalData) {
        try {
          await supabase.functions.invoke('send-withdrawal-request', {
            body: {
              email: profile.email,
              name: profile.full_name || 'Valued Investor',
              amount: parseFloat(withdrawAmount),
              country: selectedCountryData?.name || withdrawCountry,
              paymentMethod: withdrawMethod,
              paymentDetails: paymentDetailsStr,
              withdrawalId: withdrawalData.id,
            },
          });
        } catch (emailError) {
          console.error('Error sending withdrawal email:', emailError);
        }
      }
      
      // Send admin notification for new withdrawal
      try {
        await supabase.functions.invoke('send-admin-notification', {
          body: {
            type: 'withdrawal',
            userEmail: profile?.email || user?.email || '',
            userName: profile?.full_name || user?.user_metadata?.full_name || 'User',
            amount: parseFloat(withdrawAmount),
            details: `Country: ${selectedCountryData?.name || withdrawCountry}, Method: ${withdrawMethod}, Details: ${paymentDetailsStr}`,
          },
        });
      } catch (notifyError) {
        console.error('Error sending admin notification:', notifyError);
      }
      
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdrawalModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleResendVerification = async () => {
    if (!profile?.email) return;
    
    setResendingVerification(true);
    try {
      const { error } = await supabase.functions.invoke('resend-verification-email', {
        body: { email: profile.email }
      });
      
      if (error) throw error;
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handlePaymentDetailsChange = (value: string) => {
    if (withdrawMethod === 'card') {
      setWithdrawPaymentDetails(formatCardNumber(value, withdrawCountry));
    } else if (withdrawMethod === 'phone') {
      setWithdrawPaymentDetails(formatPhoneNumber(value, withdrawCountry));
    } else {
      setWithdrawPaymentDetails(value);
    }
  };

  const filteredCountries = useMemo(() => {
    const query = countrySearch.toLowerCase().trim();
    if (!query) return allCountries;
    return allCountries.filter(c => 
      c.name.toLowerCase().startsWith(query) || 
      c.code.toLowerCase().startsWith(query)
    );
  }, [countrySearch]);

  const selectedCountryData = allCountries.find(c => c.code === withdrawCountry);

  const totalInvested = investments
    .filter(i => i.status === 'active' || i.status === 'completed')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingAmount = investments
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalProfit = investments.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);
  
  // Check if any investment is completed (allows full withdrawal)
  const hasCompletedInvestment = investments.some(i => i.status === 'completed');
  
  // Profit from completed investments only (can be withdrawn fully with investment)
  const completedInvestmentTotal = investments
    .filter(i => i.status === 'completed')
    .reduce((sum, i) => sum + Number(i.amount) + Number(i.profit_amount || 0), 0);
  
  // Profit from active/ongoing investments (only profit can be withdrawn)
  const activeProfit = investments
    .filter(i => i.status === 'active')
    .reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);
  
  // Calculate total completed withdrawals (already withdrawn)
  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed' || w.status === 'approved')
    .reduce((sum, w) => sum + Number(w.amount), 0);
  
  // Calculate pending withdrawals (locked funds)
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending' || w.status === 'on_hold')
    .reduce((sum, w) => sum + Number(w.amount), 0);
  
  // Check if user has any active/completed investment (required to unlock referral bonuses)
  const hasInvested = investments.some(i => i.status === 'active' || i.status === 'completed');
  
  // Calculate withdrawable referral bonuses
  // Referrer bonus: $500 per paid referral (only withdrawable if user has invested)
  const referrerBonusWithdrawable = hasInvested ? referrerBonusTotal : 0;
  // Referred bonus: $100 signup bonus (only withdrawable if user has invested AND status is 'active' or 'paid')
  const referredBonusWithdrawable = hasInvested && referredBonus && (referredBonus.status === 'active' || referredBonus.status === 'paid') 
    ? referredBonus.amount 
    : 0;
  
  // Available for withdrawal:
  // - If completed: full portfolio (investment + profit) from completed investments
  // - If ongoing: only profit from active investments
  // - Plus referral bonuses (both referrer and referred)
  // - Subtract already withdrawn amounts and pending withdrawals
  const availableForWithdrawal = Math.max(0, 
    completedInvestmentTotal + activeProfit + referrerBonusWithdrawable + referredBonusWithdrawable 
    - totalWithdrawn - pendingWithdrawals
  );
  
  // Portfolio balance = Total Investment + Total Profit + Referral Bonuses - Already Withdrawn (for display)
  // Include referral bonuses so "Current Value" matches "Available for Withdrawal"
  const portfolioBalance = Math.max(0, 
    totalInvested + totalProfit + referrerBonusWithdrawable + referredBonusWithdrawable - totalWithdrawn
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-electric-blue" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Time-based greeting - must be before any early returns
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  if (authLoading || loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center animate-fade-in">
        <div className="relative">
          <div className="w-10 h-10 border-3 border-muted rounded-full"></div>
          <div className="absolute top-0 left-0 w-10 h-10 border-3 border-transparent border-t-tesla-red rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-auto">
      {/* Clean gradient background - no dot pattern */}
      <div className="fixed inset-0 bg-gradient-hero opacity-40 pointer-events-none" />
      
      {/* Professional Sliding Sidebar */}
      <DashboardSidebar 
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onSignOut={handleSignOut}
        onWithdrawClick={portfolioBalance > 0 ? handleWithdrawStart : undefined}
        onEditProfileClick={() => setShowProfileModal(true)}
        userEmail={profile?.email || user?.email}
        userName={profile?.full_name || undefined}
        userAvatarUrl={profile?.avatar_url || undefined}
      />

      {/* Header with premium styling */}
      <header className="relative z-20 border-b border-border/60 bg-card/90 backdrop-blur-xl sticky top-0 shadow-lg shadow-black/5">
        {/* Subtle bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile menu button with improved animation */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-300 active:scale-95"
            >
              <div className="relative w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 w-full bg-foreground rounded origin-center transition-all duration-300 ease-out ${showMobileMenu ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground rounded transition-all duration-200 ${showMobileMenu ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-foreground rounded origin-center transition-all duration-300 ease-out ${showMobileMenu ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img src={teslaLogo} alt="Tesla Stock" className="h-12 sm:h-14 w-auto brightness-150 drop-shadow-lg" />
            </Link>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link to="/transactions" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <History className="w-4 h-4" />
              History
            </Link>
            <Link to="/live-activity" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <BarChart3 className="w-4 h-4" />
              Live Activity
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Avatar & Name with Edit Profile */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-tesla-red to-electric-blue flex items-center justify-center ring-2 ring-transparent group-hover:ring-tesla-red/50 transition-all">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-foreground hidden lg:block text-xs truncate max-w-[100px] font-medium">
                {displayName}
              </span>
              <Settings className="w-3.5 h-3.5 text-muted-foreground hidden lg:block group-hover:text-tesla-red transition-colors" />
            </button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 px-2 sm:px-3 border-border">
              <LogOut className="w-3.5 h-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs">{t('signOut')}</span>
            </Button>
          </div>
        </div>

        {/* Live Price Ticker */}
        <PriceTicker />
      </header>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-5 sm:py-7 max-w-7xl overflow-x-hidden">
        {/* Main Grid Layout - 2/3 + 1/3 on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Welcome Card - Clean Purple Gradient */}
            <WelcomeCard
              displayName={displayName}
              portfolioBalance={portfolioBalance}
              greeting={greeting}
              onInvestClick={() => {
                document.querySelector('#deposit')?.scrollIntoView({ behavior: 'smooth' });
                setHighlightInvestForm(true);
                setTimeout(() => setHighlightInvestForm(false), 2500);
              }}
              onWithdrawClick={portfolioBalance > 0 ? handleWithdrawStart : undefined}
              t={t}
            />

            {/* Prominent Banner for Referred Users Who Haven't Invested */}
            {referredBonus && !hasInvested && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-green-500/20 
                           border border-green-500/40 relative overflow-hidden"
              >
                {/* Animated glow pulse */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/20 to-green-400/0 animate-pulse" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="p-2 rounded-full bg-green-500/30 animate-bounce shrink-0">
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-green-400">
                        You have a ${referredBonus.amount} Welcome Bonus!
                      </p>
                      <p className="text-xs sm:text-sm text-green-300/80">
                        Invest now to unlock and withdraw your bonus
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      document.querySelector('#deposit')?.scrollIntoView({ behavior: 'smooth' });
                      setHighlightInvestForm(true);
                      setTimeout(() => setHighlightInvestForm(false), 2500);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold 
                               px-4 sm:px-6 py-2 rounded-lg shadow-lg shadow-green-500/30 
                               w-full sm:w-auto whitespace-nowrap"
                  >
                    Unlock Bonus →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Investment Portfolio Cards */}
            <InvestmentPortfolio />

            {/* Active Withdrawal Status */}
            {withdrawals.length > 0 && withdrawals[0].status !== 'completed' && withdrawals[0].status !== 'approved' && (
              <div className={`p-3 sm:p-4 rounded-xl border animate-fade-in ${
                withdrawals[0].status === 'on_hold' 
                  ? 'bg-orange-500/10 border-orange-500/30' 
                  : withdrawals[0].status === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {getStatusIcon(withdrawals[0].status)}
                    <div>
                      <span className="font-semibold capitalize block text-sm sm:text-base">
                        {withdrawals[0].status === 'on_hold' 
                          ? t('withdrawalOnHold') 
                          : withdrawals[0].status === 'pending'
                          ? t('withdrawalPending')
                          : t('withdrawalCompleted')}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        ${Number(withdrawals[0].amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {withdrawals[0].hold_message && withdrawals[0].status === 'on_hold' && (
                    <p className="text-xs sm:text-sm text-orange-400 w-full sm:w-auto">{withdrawals[0].hold_message}</p>
                  )}
                  {withdrawals[0].status === 'on_hold' && (
                    <a 
                      href="https://wa.me/12186500840" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {t('contactSupport')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Popular Stocks Table */}
            <PopularStocksTable />

            {/* Stats Grid */}
            <StatsGrid
              totalInvested={totalInvested}
              totalProfit={totalProfit}
              pendingAmount={pendingAmount}
              activeCount={investments.filter(i => i.status === 'active').length}
              formatValue={formatCurrencyValue}
              t={t}
            />
          </div>

          {/* Right Column - Actions Panel (1/3) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32 space-y-4">
              <ActionsPanel
                onInvestClick={() => {
                  document.querySelector('#deposit')?.scrollIntoView({ behavior: 'smooth' });
                  setHighlightInvestForm(true);
                  setTimeout(() => setHighlightInvestForm(false), 2500);
                }}
                onWithdrawClick={portfolioBalance > 0 ? handleWithdrawStart : undefined}
                portfolioBalance={portfolioBalance}
              />
              
              {/* Referral Bonus Section */}
              <ReferralBonus />
            </div>
          </div>
        </div>

        {/* Full-Width Sections Below */}
        <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-10">
          {/* Real-Time Activity Section */}
          <div>
            <DashboardSectionHeader 
              title="Real-Time Activity" 
              subtitle="Live trading updates and investment progress"
              icon={Activity}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="h-[320px] sm:h-[360px]">
                <LiveTradingFeed hasActiveInvestment={investments.some(i => i.status === 'active')} />
              </div>
              <div className="h-[320px] sm:h-[360px]">
                <InvestmentProgressTracker investments={investments} />
              </div>
            </div>
          </div>

          {/* Market Analysis Section - Full Width Investment Chart */}
          <div>
            <DashboardSectionHeader 
              title="Performance Overview" 
              subtitle="Your investment portfolio analytics"
              icon={PieChart}
            />
            <div id="plans" className="w-full">
              <InvestmentChart investments={investments} />
            </div>
          </div>

          {/* Investment Section */}
          <div>
            <DashboardSectionHeader 
              title="Make Your Move" 
              subtitle="Invest or manage your portfolio"
              icon={TrendingUp}
            />
            <div id="deposit" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* New Investment Form */}
          <div className={`bg-card/80 backdrop-blur-sm border rounded-xl p-4 sm:p-5 md:p-6 shadow-lg transition-all duration-500 ${highlightInvestForm ? 'ring-2 ring-electric-blue/40 border-electric-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'border-border'}`}>
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-electric-blue/10">
                <DollarSign className="w-4 h-4 text-electric-blue" />
              </div>
              {t('makeNewInvestment')}
            </h3>
            
            {/* Show blocked message if active investment exists */}
            {investments.some(i => i.status === 'active' || i.status === 'pending') ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Investment in Progress</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  You already have an active investment. Per platform rules, you can invest more after your current investment is completed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInvest} className="space-y-4 sm:space-y-5">
                {/* Tier Plan Cards */}
                <InvestmentPlans
                  variant="dashboard"
                  selectedAmount={investAmount ? parseFloat(investAmount) : undefined}
                  onSelectTier={(amount) => setInvestAmount(String(amount))}
                />

                {/* Step 1: Country Selection */}
                <div className="relative">
                  <InvestmentCountrySelector
                    selectedCountry={investCountry}
                    onCountrySelect={handleInvestCountryChange}
                    countries={allCountries}
                  />
                </div>

                {/* Step 2: Amount Input - Only show after country is selected */}
                {investCountry && (
                  <div className="space-y-1.5 sm:space-y-2 animate-fade-in">
                     <Label htmlFor="amount" className="text-xs sm:text-sm">{t('investmentAmount')}</Label>
                  <Input
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder={t('enterAmount')}
                      value={investAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setInvestAmount(value);
                      }}
                       className="bg-white border-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-electric-blue focus:ring-electric-blue/20 focus:ring-2 h-11 sm:h-12 [color:#1a1a1a_!important] [font-size:16px_!important] sm:[font-size:18px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important] rounded-lg"
                      required
                    />
                    {/* Real-time amount preview - show USDT only for non-Russian users */}
                    {investAmount && parseFloat(investAmount) > 0 && investCountry !== 'RU' && (
                      <div className="mt-2 p-2.5 bg-slate-100 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 mb-0.5">Investment Amount</p>
                        <p className="text-lg font-bold text-slate-800">
                          {(() => {
                            const amt = parseFloat(investAmount);
                            const hasDecimals = amt % 1 !== 0;
                            return new Intl.NumberFormat('en-US', {
                              minimumFractionDigits: hasDecimals ? 2 : 0,
                              maximumFractionDigits: 2,
                            }).format(amt) + ' USDT';
                          })()}
                        </p>
                      </div>
                    )}
                    {/* Only show RUB conversion for Russia */}
                    {investAmount && parseFloat(investAmount) >= 500 && investCountry === 'RU' && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {t('exchangeRate')} {USD_TO_RUB} ₽
                      </div>
                    )}
                  </div>
                )}
                
                {loadingPayment && investCountry && (
                  <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-tesla-red mr-2" />
                    <span className="text-muted-foreground text-xs sm:text-sm">{t('loadingPayment')}</span>
                  </div>
                )}
                
                {/* Show payment details based on country */}
                {showPaymentDetails && !loadingPayment && investCountry && (
                  investCountry === 'RU' ? (
                    <PaymentDetails 
                      amount={parseFloat(investAmount)} 
                      rubAmount={rubAmount} 
                    />
                  ) : (
                    <CryptoPaymentDetails 
                      amount={parseFloat(investAmount)} 
                    />
                  )
                )}
                
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                  disabled={submitting || !investCountry || !investAmount || parseFloat(investAmount) < 500 || loadingPayment}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">{t('processingText')}</span>
                    </>
                  ) : (
                    t('submitInvestment')
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Investment History - Added margin-top for spacing */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mt-6 sm:mt-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">{t('investmentHistory')}</h2>
            {investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 sm:py-6 md:py-8 text-xs sm:text-sm">
                {t('noInvestments')}
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[350px] md:max-h-[400px] overflow-y-auto">
                {investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-background/50 rounded-lg border border-border hover:border-[#ff4d4d]/40 hover:shadow-[0_0_8px_rgba(255,77,77,0.1)] transition-all duration-300 ease-in-out"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm md:text-base">${Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      {inv.profit_amount > 0 && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-green-500">
                          +${Number(inv.profit_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {t('profit')}
                        </p>
                      )}
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {getStatusIcon(inv.status)}
                      <span className="capitalize text-[10px] sm:text-xs md:text-sm">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </main>

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-lg">Withdraw Funds</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Step {withdrawStep} of 5</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawalModal(false)}
                className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${(withdrawStep / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4">
              {/* Step 1: Amount */}
              {withdrawStep === 1 && (
                <div className="space-y-3 sm:space-y-4 animate-fade-in">
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-xl sm:text-2xl font-bold text-green-500 mb-0.5 sm:mb-1">
                      ${availableForWithdrawal.toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t('availableForWithdrawal')}</p>
                    
                    {/* Show breakdown based on investment status */}
                    {hasCompletedInvestment && completedInvestmentTotal > 0 && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-green-400">
                          ✓ {t('completedInvestments') || 'Completed Investments'}: ${completedInvestmentTotal.toLocaleString()}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                          ({t('investmentPlusProfit') || 'Investment + Profit available'})
                        </p>
                      </div>
                    )}
                    
                    {activeProfit > 0 && (
                      <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-amber-400">
                          ⏳ {t('activeProfit') || 'Active Trading Profit'}: ${activeProfit.toLocaleString()}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                          ({t('profitOnlyWithdrawal') || 'Only profit withdrawable while trading'})
                        </p>
                      </div>
                    )}
                    
                    {/* Referral Bonuses Breakdown */}
                    {(referrerBonusWithdrawable > 0 || referredBonusWithdrawable > 0) && (
                      <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <p className="text-[10px] sm:text-xs text-purple-400">
                          🎁 Referral Bonuses: ${(referrerBonusWithdrawable + referredBonusWithdrawable).toLocaleString()}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                          {referredBonusWithdrawable > 0 && `Welcome Bonus: $${referredBonusWithdrawable.toLocaleString()}`}
                          {referrerBonusWithdrawable > 0 && referredBonusWithdrawable > 0 && ' + '}
                          {referrerBonusWithdrawable > 0 && `Referral Earnings: $${referrerBonusWithdrawable.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                    
                    {!hasCompletedInvestment && activeProfit === 0 && totalInvested > 0 && (
                      <div className="mt-2 p-2 bg-muted/50 border border-border rounded-lg">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {t('noWithdrawalAvailable') || 'Investment still in progress. Withdraw available once trading completes.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="text-white text-xs sm:text-sm">{t('withdrawalAmount')}</Label>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="pl-8 sm:pl-10 h-11 sm:h-14 text-lg sm:text-xl font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#888] focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(availableForWithdrawal.toString())}
                      disabled={availableForWithdrawal <= 0}
                      className="text-xs sm:text-sm text-green-500 hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {t('withdrawAll')} (${availableForWithdrawal.toLocaleString()})
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Country */}
              {withdrawStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <Label>{t('selectCountry')}</Label>
                  <div className="relative country-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between p-4 bg-background border-2 border-border rounded-xl hover:border-green-500 transition-all duration-200"
                    >
                      {selectedCountryData ? (
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{selectedCountryData.flag}</span>
                          <span className="font-medium text-foreground">{selectedCountryData.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('chooseCountry')}</span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-[100] w-full mt-2 bg-popover border-2 border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b-2 border-border bg-popover">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              ref={countrySearchInputRef}
                              placeholder={t('searchCountries') || 'Type country name...'}
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="pl-10 bg-background border-2 border-border h-12 text-base text-foreground font-semibold placeholder:text-muted-foreground focus:border-green-500 focus:ring-green-500/20 focus:ring-2 rounded-lg"
                            />
                            {countrySearch && (
                              <button
                                type="button"
                                onClick={() => setCountrySearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                              >
                                <X className="w-3 h-3 text-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto bg-popover">
                          {filteredCountries.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground font-medium">
                              {t('noCountriesFound') || 'No countries found'}
                            </div>
                          ) : (
                            filteredCountries.map(country => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setWithdrawCountry(country.code);
                                  setShowCountryDropdown(false);
                                  setCountrySearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 border-b border-border last:border-b-0 ${
                                  withdrawCountry === country.code
                                    ? 'bg-green-500/10 border-l-4 border-l-green-500'
                                    : 'bg-popover hover:bg-muted border-l-4 border-l-transparent'
                                }`}
                              >
                                <span className="text-xl">{country.flag}</span>
                                <span className={`font-semibold text-left flex-1 ${withdrawCountry === country.code ? 'text-green-500' : 'text-foreground'}`}>
                                  {country.name}
                                </span>
                                {withdrawCountry === country.code && (
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Method */}
              {withdrawStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <Label>{t('selectMethod')}</Label>
                  <div className="space-y-3">
                    {getWithdrawalMethods(withdrawCountry).map(method => (
                      <button
                        key={method.code}
                        type="button"
                        onClick={() => {
                          setWithdrawMethod(method.code);
                          setWithdrawPaymentDetails('');
                          setBankingPaymentDetails({});
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          withdrawMethod === method.code
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-background/50 border-border hover:border-green-500/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          withdrawMethod === method.code ? 'bg-green-500/30' : 'bg-muted'
                        }`}>
                          <method.icon className={`w-6 h-6 ${withdrawMethod === method.code ? 'text-green-500' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {method.name}
                            </p>
                            {(method as any).recommended && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                   {/* Sberbank Notice - Only for Russia */}
                   {(withdrawMethod === 'card' || withdrawMethod === 'phone') && withdrawCountry === 'RU' && (
                     <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 animate-fade-in">
                       <div className="flex items-start gap-3">
                         <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                         <p className="text-sm text-amber-400">
                           {t('sberbankNotice')}
                         </p>
                       </div>
                     </div>
                   )}
                </div>
              )}

              {/* Step 4: Payment Details */}
              {withdrawStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('amount')}</span>
                      <span className="font-bold">${parseFloat(withdrawAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('country')}</span>
                      <span>{selectedCountryData?.flag} {selectedCountryData?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('method')}</span>
                      <span>{formatMethodName(withdrawMethod)}</span>
                    </div>
                  </div>

                  {/* Country-specific banking fields */}
                  <WithdrawalBankingFields
                    country={withdrawCountry}
                    method={withdrawMethod}
                    paymentDetails={bankingPaymentDetails}
                    onPaymentDetailsChange={setBankingPaymentDetails}
                  />
                </div>
              )}

              {/* Step 5: Confirmation Review */}
              {withdrawStep === 5 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Confirm Withdrawal</h3>
                    <p className="text-sm text-muted-foreground">Review Details Before Submitting</p>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-4 space-y-3 border border-slate-700">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-muted-foreground text-sm">{t('amount')}</span>
                      <span className="font-bold text-xl text-green-500">${parseFloat(withdrawAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-muted-foreground text-sm">{t('country')}</span>
                      <span className="font-medium text-white">{selectedCountryData?.flag} {selectedCountryData?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-muted-foreground text-sm">{t('method')}</span>
                      <span className="font-medium text-white">{formatMethodName(withdrawMethod)}</span>
                    </div>
                    
                    {/* Bank Transfer Details */}
                    {withdrawMethod === 'bank_transfer' && (
                      <>
                        {bankingPaymentDetails.bankName && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">Bank</span>
                            <span className="font-medium text-white">{bankingPaymentDetails.bankName}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.customBankName && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">Bank Name</span>
                            <span className="font-medium text-white">{bankingPaymentDetails.customBankName}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.iban && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">IBAN</span>
                            <span className="font-medium text-white font-mono text-xs">{bankingPaymentDetails.iban}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.routingNumber && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">Routing #</span>
                            <span className="font-medium text-white font-mono">{bankingPaymentDetails.routingNumber}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.accountNumber && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">Account #</span>
                            <span className="font-medium text-white font-mono">{bankingPaymentDetails.accountNumber}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.sortCode && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">Sort Code</span>
                            <span className="font-medium text-white font-mono">{bankingPaymentDetails.sortCode}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.bsbNumber && (
                          <div className="flex justify-between items-center py-2 border-b border-slate-700">
                            <span className="text-muted-foreground text-sm">BSB</span>
                            <span className="font-medium text-white font-mono">{bankingPaymentDetails.bsbNumber}</span>
                          </div>
                        )}
                        {bankingPaymentDetails.accountHolderName && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground text-sm">Account Holder</span>
                            <span className="font-medium text-white">{bankingPaymentDetails.accountHolderName}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Card Details */}
                    {withdrawMethod === 'card' && bankingPaymentDetails.cardNumber && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground text-sm">Card Number</span>
                        <span className="font-medium text-white font-mono">{bankingPaymentDetails.cardNumber}</span>
                      </div>
                    )}

                    {/* Phone Details */}
                    {withdrawMethod === 'phone' && bankingPaymentDetails.phoneNumber && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground text-sm">Phone Number</span>
                        <span className="font-medium text-white font-mono">{bankingPaymentDetails.phoneNumber}</span>
                      </div>
                    )}

                    {/* Crypto Details */}
                    {withdrawMethod === 'crypto' && bankingPaymentDetails.cryptoAddress && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-muted-foreground text-sm">USDT Address</span>
                          <span className="font-medium text-white font-mono text-xs break-all">{bankingPaymentDetails.cryptoAddress}</span>
                        </div>
                        {bankingPaymentDetails.cryptoNetwork && (
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground text-sm">Network</span>
                            <span className="font-medium text-white">{bankingPaymentDetails.cryptoNetwork}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-400">
                        Please verify all details are correct. Once submitted, you cannot modify this request.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdrawSubmit}
                    disabled={submittingWithdrawal}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-slate-600 disabled:to-slate-500 disabled:cursor-not-allowed font-semibold text-base transition-all duration-200 rounded-xl shadow-lg hover:shadow-green-500/25"
                  >
                    {submittingWithdrawal ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirm & Submit Withdrawal
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {withdrawStep < 5 && (
              <div className="p-4 border-t border-border flex gap-3">
                {withdrawStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawStep(withdrawStep - 1)}
                    className="flex-1"
                  >
                    {t('back')}
                  </Button>
                )}
                <Button
                  onClick={handleWithdrawNext}
                  disabled={
                    (withdrawStep === 1 && (!withdrawAmount || parseFloat(withdrawAmount) <= 0)) ||
                    (withdrawStep === 2 && !withdrawCountry) ||
                    (withdrawStep === 3 && !withdrawMethod) ||
                    (withdrawStep === 4 && (
                      withdrawMethod === 'crypto' ? !bankingPaymentDetails.cryptoAddress :
                      withdrawMethod === 'phone' && withdrawCountry === 'RU' ? !bankingPaymentDetails.phoneNumber :
                      withdrawMethod === 'card' ? !bankingPaymentDetails.cardNumber :
                      withdrawMethod === 'bank_transfer' ? !(
                        (bankingPaymentDetails.iban || bankingPaymentDetails.routingNumber || bankingPaymentDetails.sortCode || bankingPaymentDetails.bsbNumber || bankingPaymentDetails.accountNumber) &&
                        bankingPaymentDetails.accountHolderName
                      ) :
                      false
                    )) ||
                    processingWithdrawal
                  }
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  {processingWithdrawal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('processing')}
                    </>
                  ) : withdrawStep === 4 ? (
                    t('reviewWithdrawal') || 'Review Withdrawal'
                  ) : (
                    t('next')
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <SupportButtons />
      <LiveChatWidget />

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={user?.id || ''}
        currentName={profile?.full_name || ''}
        currentEmail={profile?.email || user?.email || ''}
        currentAvatarUrl={profile?.avatar_url || ''}
        onProfileUpdated={fetchData}
      />
    </div>
  );
};

export default Dashboard;
