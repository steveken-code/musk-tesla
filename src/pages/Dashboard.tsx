import { useEffect, useState, useRef } from 'react';
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
  CreditCard, Phone, Bitcoin, ChevronDown, X, History
} from 'lucide-react';
import SupportButtons from '@/components/SupportButtons';
import TeslaChart from '@/components/TeslaChart';
import InvestmentChart from '@/components/InvestmentChart';
import PaymentDetails from '@/components/PaymentDetails';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import teslaLogo from '@/assets/tesla-logo-red.png';

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
}

const USD_TO_RUB = 96.5;

// localStorage keys for form persistence
const STORAGE_KEY_INVEST_AMOUNT = 'tesla_invest_amount';
const STORAGE_KEY_SHOW_PAYMENT = 'tesla_show_payment';

// Base withdrawal methods - phone (SBP) only available for Russia
const getWithdrawalMethods = (country: string) => {
  const methods = [
    { code: 'card', name: 'Card', icon: CreditCard, description: 'Bank Card' },
    { code: 'crypto', name: 'Crypto', icon: Bitcoin, description: 'USDT TRC20' },
  ];
  
  // Only add SBP/Phone option for Russia
  if (country === 'RU') {
    methods.splice(1, 0, { code: 'phone', name: 'Phone', icon: Phone, description: 'Phone Number' });
  }
  
  return methods;
};

const allCountries = [
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
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
      return localStorage.getItem(STORAGE_KEY_SHOW_PAYMENT) === 'true';
    }
    return false;
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const previousProfitsRef = useRef<Record<string, number>>({});

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');
  const [withdrawCountry, setWithdrawCountry] = useState('');
  const [withdrawPaymentDetails, setWithdrawPaymentDetails] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const rubAmount = investAmount ? Math.round(parseFloat(investAmount) * USD_TO_RUB) : 0;
  const detectedCard = withdrawPaymentDetails ? detectCardType(withdrawPaymentDetails) : null;

  // Persist investment amount to localStorage
  useEffect(() => {
    if (investAmount) {
      localStorage.setItem(STORAGE_KEY_INVEST_AMOUNT, investAmount);
      // Show payment details if amount is valid (>= 100)
      if (parseFloat(investAmount) >= 100) {
        localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'true');
        setShowPaymentDetails(true);
      } else {
        localStorage.setItem(STORAGE_KEY_SHOW_PAYMENT, 'false');
        setShowPaymentDetails(false);
      }
    } else {
      // User cleared the amount - remove from storage
      localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
      localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
      setShowPaymentDetails(false);
    }
  }, [investAmount]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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
    if (investAmount && parseFloat(investAmount) >= 100) {
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
      const [investmentsRes, profileRes, withdrawalsRes] = await Promise.all([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('full_name, email, email_verified')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
      ]);

      if (investmentsRes.data) {
        setInvestments(investmentsRes.data);
        investmentsRes.data.forEach(inv => {
          previousProfitsRef.current[inv.id] = inv.profit_amount;
        });
      }
      if (profileRes.data) setProfile(profileRes.data);
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data as Withdrawal[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(investAmount);
    
    if (isNaN(amount) || amount < 100) {
      toast.error(t('minInvestment'));
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
            userName: profile?.full_name || 'Unknown User',
            amount: amount,
          },
        });
      } catch (notifyError) {
        console.error('Error sending admin notification:', notifyError);
      }
      
      toast.success('Investment submitted successfully! Your investment is now pending activation.');
      setInvestAmount('');
      setShowPaymentDetails(false);
      // Clear persisted data after successful submission
      localStorage.removeItem(STORAGE_KEY_INVEST_AMOUNT);
      localStorage.removeItem(STORAGE_KEY_SHOW_PAYMENT);
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
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawPaymentDetails) {
      toast.error('Please enter your payment details');
      return;
    }

    // Validate card/phone based on country format
    const format = countryBankingFormats[withdrawCountry];
    if (format) {
      const cleanedDetails = withdrawPaymentDetails.replace(/\D/g, '');
      if (withdrawMethod === 'card') {
        if (cleanedDetails.length !== format.cardLength) {
          toast.error(`Please enter a valid ${format.cardLength}-digit card number`);
          return;
        }
        if (!detectedCard) {
          toast.error('Please enter a valid card number');
          return;
        }
      }
      if (withdrawMethod === 'phone') {
        if (cleanedDetails.length !== format.phoneLength) {
          toast.error(`Please enter a valid ${format.phoneLength}-digit phone number (${format.phoneFormat})`);
          return;
        }
      }
    }

    setSubmittingWithdrawal(true);
    try {
      // Use edge function for server-side validation
      const { data: response, error: fnError } = await supabase.functions.invoke('create-withdrawal', {
        body: {
          amount: parseFloat(withdrawAmount),
          country: withdrawCountry,
          payment_details: withdrawPaymentDetails,
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
              paymentDetails: withdrawPaymentDetails,
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
            userName: profile?.full_name || 'Unknown User',
            amount: parseFloat(withdrawAmount),
            details: `Country: ${selectedCountryData?.name || withdrawCountry}, Method: ${withdrawMethod}, Details: ${withdrawPaymentDetails}`,
          },
        });
      } catch (notifyError) {
        console.error('Error sending admin notification:', notifyError);
      }
      
      toast.success('Withdrawal request submitted successfully! Check your email for details.');
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

  const filteredCountries = allCountries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

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
  
  // Available for withdrawal:
  // - If completed: full portfolio (investment + profit) from completed investments
  // - If ongoing: only profit from active investments
  const availableForWithdrawal = completedInvestmentTotal + activeProfit;
  
  // Portfolio balance = Total Investment + Total Profit (for display)
  const portfolioBalance = totalInvested + totalProfit;

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

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-hero opacity-30 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </Link>
            <img src={teslaLogo} alt="Tesla Stock" className="h-10 sm:h-14 md:h-16 w-auto brightness-150 drop-shadow-lg" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-muted-foreground hidden sm:block text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">
              {displayName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="h-8 sm:h-9 px-2 sm:px-3">
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline text-xs sm:text-sm">{t('signOut')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-full overflow-x-hidden">
        {/* Welcome Message */}
        <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
            {t('welcomeBack')}, <span className="text-brand-purple drop-shadow-[0_0_20px_hsl(270_70%_60%/0.5)]">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1.5 sm:mt-2 md:mt-3 text-xs sm:text-sm">{t('dashboardSubtitle')}</p>
        </div>

        {/* Email verification is now automatic - banner removed */}

        {/* Stats with Withdrawal */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-tesla-red/30 transition-colors">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-tesla-red flex-shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm truncate">{t('totalInvested')}</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold">${totalInvested.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm truncate">{t('totalProfit')}</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-green-500">${totalProfit.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm truncate">{t('pending')}</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold">${pendingAmount.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:border-electric-blue/30 transition-colors">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-electric-blue flex-shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs md:text-sm truncate">{t('active')}</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold">
              {investments.filter(i => i.status === 'active').length}
            </p>
          </div>

          {/* Portfolio Balance Card */}
          <div 
            onClick={portfolioBalance > 0 ? handleWithdrawStart : undefined}
            className={`bg-gradient-to-br from-green-600/20 to-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 transition-all col-span-2 md:col-span-1 ${
              portfolioBalance > 0 ? 'cursor-pointer hover:border-green-500/60 hover:scale-[1.02]' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-400 text-[10px] sm:text-xs md:text-sm font-medium">{t('portfolioBalance') || 'Portfolio Balance'}</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-green-400">
              {portfolioBalance > 0 ? `$${portfolioBalance.toLocaleString()}` : t('noBalanceYet') || 'No Balance Yet'}
            </p>
            {portfolioBalance > 0 && (
              <p className="text-[10px] sm:text-xs text-green-500/70 mt-1">{t('clickToWithdraw') || 'Click to Withdraw'}</p>
            )}
          </div>
        </div>

        {/* Active Withdrawal Status */}
        {withdrawals.length > 0 && withdrawals[0].status !== 'completed' && withdrawals[0].status !== 'approved' && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border animate-fade-in ${
            withdrawals[0].status === 'on_hold' 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : withdrawals[0].status === 'pending'
              ? 'bg-yellow-500/10 border-yellow-500/30'
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
              {withdrawals[0].hold_message && (
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

        {/* Transaction History Link */}
        <div className="mb-4 sm:mb-6">
          <Link to="/transactions" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t('viewTransactionHistory') || 'View Full Transaction History'} →
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          <TeslaChart />
          <InvestmentChart investments={investments} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10">
          {/* New Investment Form */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-tesla-red" />
              {t('makeNewInvestment')}
            </h2>
            <form onSubmit={handleInvest} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
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
                  className="bg-white border-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-sky-500 focus:ring-sky-500/20 focus:ring-2 h-11 sm:h-12 [color:#1a1a1a_!important] [font-size:16px_!important] sm:[font-size:18px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important] rounded-lg"
                  required
                />
                {investAmount && parseFloat(investAmount) >= 100 && (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {t('exchangeRate')} {USD_TO_RUB} ₽
                  </div>
                )}
              </div>
              
              {loadingPayment && (
                <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-tesla-red mr-2" />
                  <span className="text-muted-foreground text-xs sm:text-sm">{t('loadingPayment')}</span>
                </div>
              )}
              
              {showPaymentDetails && !loadingPayment && (
                <PaymentDetails 
                  amount={parseFloat(investAmount)} 
                  rubAmount={rubAmount} 
                />
              )}
              
              <Button
                type="submit"
                className="w-full h-10 sm:h-11 text-sm sm:text-base bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                disabled={submitting || !investAmount || parseFloat(investAmount) < 100 || loadingPayment}
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
          </div>

          {/* Investment History */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6">
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
                      <p className="font-semibold text-xs sm:text-sm md:text-base">${Number(inv.amount).toLocaleString()}</p>
                      {inv.profit_amount > 0 && (
                        <p className="text-[10px] sm:text-xs md:text-sm text-green-500">
                          +${Number(inv.profit_amount).toLocaleString()} {t('profit')}
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
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Step {withdrawStep} of 4</p>
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
                  style={{ width: `${(withdrawStep / 4) * 100}%` }}
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="w-full flex items-center justify-between p-4 bg-background/50 border border-border rounded-xl hover:border-green-500/50 transition-colors"
                    >
                      {selectedCountryData ? (
                        <span className="flex items-center gap-3">
                          <span className="text-2xl">{selectedCountryData.flag}</span>
                          <span className="font-medium">{selectedCountryData.name}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{t('chooseCountry')}</span>
                      )}
                      <ChevronDown className={`w-5 h-5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-[#1E1E1E] border border-[#333] rounded-xl shadow-xl max-h-48 overflow-hidden bottom-full mb-2">
                        <div className="p-2 border-b border-[#333]">
                          <Input
                            placeholder={t('searchCountries')}
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="bg-[#2a2a2a] border-[#444] [color:#ffffff_!important] font-semibold placeholder:text-[#888] focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                          />
                        </div>
                        <div className="max-h-36 overflow-y-auto">
                          {filteredCountries.map(country => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setWithdrawCountry(country.code);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                            >
                              <span className="text-xl">{country.flag}</span>
                              <span className="font-medium">{country.name}</span>
                            </button>
                          ))}
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
                        <div className="text-left">
                          <p className="font-semibold">{method.code === 'card' ? t('bankCard') : method.code === 'phone' ? t('mobilePayment') : t('cryptoPayment')}</p>
                          <p className="text-sm text-muted-foreground">{method.code === 'card' ? t('bankCardDesc') : method.code === 'phone' ? t('mobilePaymentDesc') : t('cryptoPaymentDesc')}</p>
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
                      <span className="font-bold">${parseFloat(withdrawAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('country')}</span>
                      <span>{selectedCountryData?.flag} {selectedCountryData?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('method')}</span>
                      <span className="capitalize">{withdrawMethod === 'card' ? t('bankCard') : withdrawMethod === 'phone' ? t('mobilePayment') : t('cryptoPayment')}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">
                      {withdrawMethod === 'crypto' ? t('enterCryptoAddress') :
                       withdrawMethod === 'phone' ? t('enterPhoneNumber') : t('enterCardNumber')}
                    </Label>
                    {withdrawMethod !== 'crypto' && countryBankingFormats[withdrawCountry] && (
                      <p className="text-xs text-[#888]">
                        Format: {withdrawMethod === 'phone' 
                          ? countryBankingFormats[withdrawCountry].phoneFormat 
                          : countryBankingFormats[withdrawCountry].cardFormat}
                        {withdrawMethod === 'card' && ` (${countryBankingFormats[withdrawCountry].cardLength} digits)`}
                        {withdrawMethod === 'phone' && ` (${countryBankingFormats[withdrawCountry].phoneLength} digits)`}
                      </p>
                    )}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={
                          withdrawMethod === 'crypto' ? 'TRC20 wallet address' :
                          withdrawMethod === 'phone' 
                            ? (countryBankingFormats[withdrawCountry]?.phoneFormat || '+X XXX XXX XXXX')
                            : (countryBankingFormats[withdrawCountry]?.cardFormat || '0000 0000 0000 0000')
                        }
                        value={withdrawPaymentDetails}
                        onChange={(e) => handlePaymentDetailsChange(e.target.value)}
                        className="h-14 text-lg font-mono font-bold bg-[#1E1E1E] border-[#333] [color:#ffffff_!important] placeholder:text-[#888] focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleWithdrawSubmit}
                    disabled={submittingWithdrawal || !withdrawPaymentDetails}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 font-semibold text-base"
                  >
                    {submittingWithdrawal ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {t('submittingWithdrawal')}
                      </>
                    ) : (
                      t('submitWithdrawal')
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {withdrawStep < 4 && (
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
                    processingWithdrawal
                  }
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  {processingWithdrawal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('processing')}
                    </>
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
    </div>
  );
};

export default Dashboard;
