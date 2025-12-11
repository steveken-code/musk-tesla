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
  Wallet, Globe, AlertCircle
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import LanguageSelector from '@/components/LanguageSelector';
import TeslaChart from '@/components/TeslaChart';
import InvestmentChart from '@/components/InvestmentChart';
import PaymentDetails from '@/components/PaymentDetails';

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
}

const USD_TO_RUB = 96.5;

const countries = [
  { code: 'RU', name: 'Russia', format: 'card', label: 'Card Number' },
  { code: 'US', name: 'United States', format: 'account', label: 'Account Number' },
  { code: 'UK', name: 'United Kingdom', format: 'account', label: 'Account Number' },
  { code: 'DE', name: 'Germany', format: 'iban', label: 'IBAN' },
  { code: 'FR', name: 'France', format: 'iban', label: 'IBAN' },
  { code: 'CN', name: 'China', format: 'card', label: 'Card Number' },
  { code: 'JP', name: 'Japan', format: 'account', label: 'Account Number' },
  { code: 'KR', name: 'South Korea', format: 'account', label: 'Account Number' },
  { code: 'BR', name: 'Brazil', format: 'account', label: 'Account Number' },
  { code: 'AE', name: 'UAE', format: 'iban', label: 'IBAN' },
];

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
  const [withdrawCountry, setWithdrawCountry] = useState('');
  const [withdrawPaymentDetails, setWithdrawPaymentDetails] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);

  const rubAmount = investAmount ? Math.round(parseFloat(investAmount) * USD_TO_RUB) : 0;

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

  // Show withdrawal form when amount is entered
  useEffect(() => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      setShowWithdrawalForm(true);
    } else {
      setShowWithdrawalForm(false);
    }
  }, [withdrawAmount]);

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
          .select('full_name, email')
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

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (amount > totalProfit) {
      toast.error('Withdrawal amount cannot exceed your profit');
      return;
    }

    if (!withdrawCountry) {
      toast.error('Please select your country');
      return;
    }

    if (!withdrawPaymentDetails) {
      toast.error('Please enter your payment details');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({ 
          user_id: user!.id, 
          amount, 
          country: withdrawCountry,
          payment_details: withdrawPaymentDetails,
          status: 'pending' 
        });

      if (error) throw error;
      
      toast.success('Withdrawal request submitted!');
      setWithdrawAmount('');
      setWithdrawCountry('');
      setWithdrawPaymentDetails('');
      setShowWithdrawalForm(false);
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

  const selectedCountry = countries.find(c => c.code === withdrawCountry);

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
            <span className="text-xl font-bold font-display tracking-tight">
              <span className="text-tesla-red">Tesla</span>
              <span className="text-slate-400">Invest</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-muted-foreground hidden sm:block text-sm truncate max-w-[120px]">
              {displayName}
            </span>
            <LanguageSelector />
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
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

          {/* Withdrawal Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-500" />
              Withdraw Funds
            </h2>
            
            {/* Show active withdrawal status if any */}
            {withdrawals.length > 0 && withdrawals[0].status !== 'completed' && (
              <div className={`mb-4 p-4 rounded-lg border ${
                withdrawals[0].status === 'on_hold' 
                  ? 'bg-orange-500/10 border-orange-500/30' 
                  : withdrawals[0].status === 'pending'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(withdrawals[0].status)}
                  <span className="font-semibold capitalize">
                    {withdrawals[0].status === 'on_hold' ? 'Withdrawal On Hold' : 
                     withdrawals[0].status === 'pending' ? 'Withdrawal Pending' : 
                     'Withdrawal Processing'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Amount: ${Number(withdrawals[0].amount).toLocaleString()}
                </p>
                {withdrawals[0].hold_message && (
                  <p className="text-sm mt-2 text-orange-400">{withdrawals[0].hold_message}</p>
                )}
                {withdrawals[0].status === 'on_hold' && (
                  <a 
                    href="https://wa.me/12186500840" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-sm text-electric-blue hover:underline"
                  >
                    Contact support on WhatsApp
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label>Withdrawal Amount (Max: ${totalProfit.toLocaleString()})</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setWithdrawAmount(value);
                    }}
                    className="bg-background/50 border-border"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setWithdrawAmount(totalProfit.toString())}
                    className="whitespace-nowrap"
                  >
                    Max
                  </Button>
                </div>
              </div>

              {showWithdrawalForm && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Select Country
                    </Label>
                    <select
                      value={withdrawCountry}
                      onChange={(e) => setWithdrawCountry(e.target.value)}
                      className="w-full p-2 bg-background/50 border border-border rounded-md text-foreground"
                      required
                    >
                      <option value="">Select your country</option>
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCountry && (
                    <div className="space-y-2">
                      <Label>{selectedCountry.label}</Label>
                      <Input
                        type="text"
                        placeholder={`Enter your ${selectedCountry.label.toLowerCase()}`}
                        value={withdrawPaymentDetails}
                        onChange={(e) => setWithdrawPaymentDetails(e.target.value)}
                        className="bg-background/50 border-border"
                        required
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    disabled={submittingWithdrawal || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawCountry || !withdrawPaymentDetails}
                  >
                    {submittingWithdrawal ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Submit Withdrawal'
                    )}
                  </Button>
                </>
              )}
            </form>
          </div>
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
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
