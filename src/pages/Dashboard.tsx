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
import WhatsAppButton from '@/components/WhatsAppButton';
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

const withdrawalMethods = [
  { code: 'card', name: 'Card', icon: CreditCard, description: 'Bank Card' },
  { code: 'phone', name: 'Phone', icon: Phone, description: 'Phone Number' },
  { code: 'crypto', name: 'Crypto', icon: Bitcoin, description: 'USDT TRC20' },
];

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
const detectCardType = (cardNumber: string): { type: string; icon: string } | null => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return { type: 'Visa', icon: '💳' };
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return { type: 'MasterCard', icon: '💳' };
  if (/^220[0-4]/.test(cleaned)) return { type: 'Mir', icon: '🏦' };
  if (/^3[47]/.test(cleaned)) return { type: 'American Express', icon: '💳' };
  if (/^6(?:011|5)/.test(cleaned)) return { type: 'Discover', icon: '💳' };
  if (/^(?:2131|1800|35)/.test(cleaned)) return { type: 'JCB', icon: '💳' };
  if (/^62/.test(cleaned)) return { type: 'UnionPay', icon: '💳' };
  return null;
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 19);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
};

// Format Russian phone number
const formatRussianPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  
  let formatted = '+7';
  if (cleaned.length > 1 || cleaned[0] !== '7') {
    const digits = cleaned.startsWith('7') ? cleaned.slice(1) : cleaned;
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
    if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
  }
  return formatted;
};

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
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
      
      toast.success(t('investmentSubmitted'));
      setInvestAmount('');
      setShowPaymentDetails(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawStart = () => {
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
      if (amount > totalProfit) {
        toast.error('Amount exceeds available profit');
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

    // Validate card/phone for Russia
    if (withdrawCountry === 'RU') {
      if (withdrawMethod === 'card' && !detectedCard) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (withdrawMethod === 'phone' && withdrawPaymentDetails.replace(/\D/g, '').length < 11) {
        toast.error('Please enter a valid Russian phone number');
        return;
      }
    }

    setSubmittingWithdrawal(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({ 
          user_id: user!.id, 
          amount: parseFloat(withdrawAmount), 
          country: withdrawCountry,
          payment_details: withdrawPaymentDetails,
          status: 'pending' 
        });

      if (error) throw error;
      
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
      setWithdrawPaymentDetails(formatCardNumber(value));
    } else if (withdrawMethod === 'phone' && withdrawCountry === 'RU') {
      setWithdrawPaymentDetails(formatRussianPhone(value));
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <img src={teslaLogo} alt="Tesla" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-muted-foreground hidden sm:block text-sm truncate max-w-[120px]">
              {displayName}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('signOut')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-full overflow-x-hidden">
        {/* Welcome Message */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('welcomeBack')}, <span className="text-tesla-red">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">{t('dashboardSubtitle') || 'Manage your investments and track your profits'}</p>
        </div>

        {/* Email Verification Banner */}
        {profile && !profile.email_verified && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Mail className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-foreground font-medium">Verify your email address</p>
                <p className="text-sm text-muted-foreground">
                  Please verify your email to secure your account and receive important updates.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 whitespace-nowrap"
            >
              {resendingVerification ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>
          </div>
        )}

        {/* Stats with Withdrawal */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 hover:border-tesla-red/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-tesla-red flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">{t('totalInvested')}</span>
            </div>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold">${totalInvested.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">{t('totalProfit')}</span>
            </div>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold text-green-500">${totalProfit.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">{t('pending')}</span>
            </div>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold">${pendingAmount.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 hover:border-electric-blue/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue flex-shrink-0" />
              <span className="text-muted-foreground text-xs sm:text-sm truncate">{t('active')}</span>
            </div>
            <p className="text-lg sm:text-2xl md:text-3xl font-bold">
              {investments.filter(i => i.status === 'active').length}
            </p>
          </div>

          {/* Withdraw Card */}
          <div 
            onClick={totalProfit > 0 ? handleWithdrawStart : undefined}
            className={`bg-gradient-to-br from-green-600/20 to-green-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 sm:p-6 transition-all col-span-2 md:col-span-1 ${
              totalProfit > 0 ? 'cursor-pointer hover:border-green-500/60 hover:scale-[1.02]' : 'opacity-60'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-400 text-xs sm:text-sm font-medium">Withdraw</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-green-400">
              {totalProfit > 0 ? 'Click to Withdraw' : 'No Profit Yet'}
            </p>
          </div>
        </div>

        {/* Active Withdrawal Status */}
        {withdrawals.length > 0 && withdrawals[0].status !== 'completed' && (
          <div className={`mb-6 p-4 rounded-xl border animate-fade-in ${
            withdrawals[0].status === 'on_hold' 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : withdrawals[0].status === 'pending'
              ? 'bg-yellow-500/10 border-yellow-500/30'
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(withdrawals[0].status)}
                <div>
                  <span className="font-semibold capitalize block">
                    Withdrawal {withdrawals[0].status === 'on_hold' ? 'On Hold' : withdrawals[0].status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ${Number(withdrawals[0].amount).toLocaleString()}
                  </span>
                </div>
              </div>
              {withdrawals[0].hold_message && (
                <p className="text-sm text-orange-400 w-full sm:w-auto">{withdrawals[0].hold_message}</p>
              )}
              {withdrawals[0].status === 'on_hold' && (
                <a 
                  href="https://wa.me/12186500840" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Contact Support
                </a>
              )}
            </div>
          </div>
        )}

        {/* Transaction History Link */}
        <div className="mb-6">
          <Link to="/transactions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-4 h-4" />
            View Full Transaction History →
          </Link>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TeslaChart />
          <InvestmentChart investments={investments} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* New Investment Form */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-tesla-red" />
              {t('makeNewInvestment')}
            </h2>
            <form onSubmit={handleInvest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">{t('investmentAmount')}</Label>
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
                  className="bg-background/50 border-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                {investAmount && parseFloat(investAmount) >= 100 && (
                  <div className="text-sm text-muted-foreground">
                    {t('exchangeRate')} {USD_TO_RUB} ₽
                  </div>
                )}
              </div>
              
              {loadingPayment && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-tesla-red mr-2" />
                  <span className="text-muted-foreground">{t('loadingPayment')}</span>
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
                className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                disabled={submitting || !investAmount || parseFloat(investAmount) < 100 || loadingPayment}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('processingText')}
                  </>
                ) : (
                  t('submitInvestment')
                )}
              </Button>
            </form>
          </div>

          {/* Investment History */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">{t('investmentHistory')}</h2>
            {investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-sm">
                {t('noInvestments')}
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-background/50 rounded-lg border border-border hover:border-tesla-red/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base">${Number(inv.amount).toLocaleString()}</p>
                      {inv.profit_amount > 0 && (
                        <p className="text-xs sm:text-sm text-green-500">
                          +${Number(inv.profit_amount).toLocaleString()} {t('profit')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(inv.status)}
                      <span className="capitalize text-xs sm:text-sm">{inv.status}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Withdraw Funds</h3>
                  <p className="text-xs text-muted-foreground">Step {withdrawStep} of 4</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawalModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pt-4">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                  style={{ width: `${(withdrawStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {/* Step 1: Amount */}
              {withdrawStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-green-500 mb-1">
                      ${totalProfit.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Available for withdrawal</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Withdrawal Amount</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="pl-10 h-14 text-xl font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(totalProfit.toString())}
                      className="text-sm text-green-500 hover:underline"
                    >
                      Withdraw all
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Country */}
              {withdrawStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <Label>Select Your Country</Label>
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
                        <span className="text-muted-foreground">Choose your country</span>
                      )}
                      <ChevronDown className={`w-5 h-5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-border">
                          <Input
                            placeholder="Search countries..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
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
                  <Label>Select Withdrawal Method</Label>
                  <div className="space-y-3">
                    {withdrawalMethods.map(method => (
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
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Sberbank Notice */}
                  {(withdrawMethod === 'card' || withdrawMethod === 'phone') && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 animate-fade-in">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-400">
                          Sberbank transfers may take additional time. Please allow up to 24 hours for processing.
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
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold">${parseFloat(withdrawAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Country</span>
                      <span>{selectedCountryData?.flag} {selectedCountryData?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="capitalize">{withdrawMethod}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {withdrawMethod === 'crypto' ? 'USDT TRC20 Wallet Address' :
                       withdrawMethod === 'phone' ? 'Phone Number' : 'Card Number'}
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={
                          withdrawMethod === 'crypto' ? 'TRC20 wallet address' :
                          withdrawMethod === 'phone' ? '+7 XXX XXX XX XX' :
                          '0000 0000 0000 0000'
                        }
                        value={withdrawPaymentDetails}
                        onChange={(e) => handlePaymentDetailsChange(e.target.value)}
                        className="h-14 text-lg font-mono"
                      />
                      {withdrawMethod === 'card' && detectedCard && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-medium">
                            {detectedCard.type}
                          </span>
                        </div>
                      )}
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
                        Processing...
                      </>
                    ) : (
                      'Confirm Withdrawal'
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
                    Back
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
                      Processing...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
