import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, Loader2, CheckCircle, XCircle, DollarSign, TrendingUp, Globe, Lock, CreditCard, Save, Wallet, AlertCircle, Clock } from 'lucide-react';

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface Withdrawal {
  id: string;
  amount: number;
  country: string;
  payment_details: string;
  status: string;
  hold_message: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface PaymentSettings {
  cardNumber: string;
  bankName: string;
  accountHolder: string;
}

interface WithdrawalSettings {
  defaultHoldMessage: string;
}

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

const Admin = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updatingWithdrawal, setUpdatingWithdrawal] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cardNumber: '2200500174446743',
    bankName: 'СОВКОМБАНК (ДОМАШНИЙ БАНК)',
    accountHolder: 'ЕЛЬЧАНИНОВ ИГОРЬ СЕРГЕЕВИЧ',
  });
  const [withdrawalSettings, setWithdrawalSettings] = useState<WithdrawalSettings>({
    defaultHoldMessage: 'Your withdrawal is currently being processed. Please contact support for more information.',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'withdrawals'>('investments');

  // Check admin role via database
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingRole(false);
        setIsAdmin(false);
        return;
      }

      try {
        // Query user_roles table to check if user has admin role
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!roleData);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
        setIsAdmin(false);
      } finally {
        setCheckingRole(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  // Load settings and fetch data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      // Load saved settings
      const savedPayment = localStorage.getItem('payment-settings');
      if (savedPayment) {
        setPaymentSettings(JSON.parse(savedPayment));
      }
      const savedWithdrawal = localStorage.getItem('withdrawal-settings');
      if (savedWithdrawal) {
        setWithdrawalSettings(JSON.parse(savedWithdrawal));
      }
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investmentsData, withdrawalsData] = await Promise.all([
        supabase.from('investments').select('*').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
      ]);
      
      if (investmentsData.data) {
        const userIds = [...new Set(investmentsData.data.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched: Investment[] = investmentsData.data.map(inv => ({
          ...inv,
          profiles: profileMap.get(inv.user_id) || undefined
        }));
        setInvestments(enriched);
      }

      if (withdrawalsData.data) {
        const userIds = [...new Set(withdrawalsData.data.map(w => w.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched: Withdrawal[] = withdrawalsData.data.map(w => ({
          ...w,
          profiles: profileMap.get(w.user_id) || undefined
        }));
        setWithdrawals(enriched);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvestment = async (id: string, status: string, profitAmount?: number) => {
    setUpdating(id);
    try {
      const updateData: any = { status };
      if (profitAmount !== undefined) {
        updateData.profit_amount = profitAmount;
      }

      const { error } = await supabase
        .from('investments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Investment ${status === 'active' ? 'approved' : 'updated'} successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update investment');
    } finally {
      setUpdating(null);
    }
  };

  const updateWithdrawal = async (id: string, status: string, holdMessage?: string) => {
    setUpdatingWithdrawal(id);
    try {
      const updateData: any = { status };
      if (holdMessage !== undefined) {
        updateData.hold_message = holdMessage;
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Withdrawal ${status} successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update withdrawal');
    } finally {
      setUpdatingWithdrawal(null);
    }
  };

  const handleProfitChange = (id: string, profit: string) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, profit_amount: parseFloat(profit) || 0 } : inv
    ));
  };

  const handleWithdrawalHoldMessageChange = (id: string, message: string) => {
    setWithdrawals(prev => prev.map(w => 
      w.id === id ? { ...w, hold_message: message } : w
    ));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSetDefaultLanguage = (langCode: string) => {
    setLanguage(langCode as any);
    localStorage.setItem('app-language', langCode);
    toast.success(`Default language set to ${languages.find(l => l.code === langCode)?.label}`);
  };

  const handleSavePaymentSettings = () => {
    setSavingPayment(true);
    localStorage.setItem('payment-settings', JSON.stringify(paymentSettings));
    setTimeout(() => {
      setSavingPayment(false);
      toast.success('Payment settings saved successfully!');
    }, 500);
  };

  const handleSaveWithdrawalSettings = () => {
    localStorage.setItem('withdrawal-settings', JSON.stringify(withdrawalSettings));
    toast.success('Withdrawal settings saved!');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      on_hold: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    };
    return styles[status] || styles.pending;
  };

  // Loading state
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  // Not logged in - redirect to auth
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Lock className="w-10 h-10 text-tesla-red" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-white">{t('adminPasscode')}</h2>
            <p className="text-slate-400 text-center mb-6 text-sm">Please sign in with an admin account to access this page.</p>
            
            <Button
              onClick={() => navigate('/auth')}
              className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
            >
              Sign In
            </Button>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-electric-blue hover:underline text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not an admin - access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <AlertCircle className="w-10 h-10 text-tesla-red" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-white">{t('accessDenied')}</h2>
            <p className="text-slate-400 text-center mb-6 text-sm">You do not have admin privileges to access this page.</p>
            
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Sign Out
              </Button>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-electric-blue hover:underline text-sm"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl font-bold font-display">
              <span className="text-tesla-red">Admin</span>
              <span className="text-slate-400">Panel</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('signOut')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-full">
        {/* Language Control Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Globe className="w-5 h-5 text-electric-blue" />
            {t('defaultLanguage') || 'Default Language Control'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSetDefaultLanguage(lang.code)}
                className={language === lang.code ? 'bg-tesla-red hover:bg-tesla-red/90' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-tesla-red" />
            Payment Settings
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-slate-300">Card Number</Label>
              <Input
                value={paymentSettings.cardNumber}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, cardNumber: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Bank Name</Label>
              <Input
                value={paymentSettings.bankName}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankName: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Account Holder</Label>
              <Input
                value={paymentSettings.accountHolder}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleSavePaymentSettings}
            className="mt-4 bg-tesla-red hover:bg-tesla-red/90"
            disabled={savingPayment}
          >
            {savingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Payment Settings
          </Button>
        </div>

        {/* Withdrawal Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5 text-green-500" />
            Withdrawal Settings
          </h2>
          <div className="space-y-2">
            <Label className="text-slate-300">Default Hold Message</Label>
            <Input
              value={withdrawalSettings.defaultHoldMessage}
              onChange={(e) => setWithdrawalSettings(prev => ({ ...prev, defaultHoldMessage: e.target.value }))}
              className="bg-slate-900/50 border-slate-600 text-white"
              placeholder="Enter default message for withdrawals on hold..."
            />
          </div>
          <Button
            onClick={handleSaveWithdrawalSettings}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Withdrawal Settings
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'investments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('investments')}
            className={activeTab === 'investments' ? 'bg-tesla-red' : 'border-slate-600 text-slate-300'}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Investments ({investments.length})
          </Button>
          <Button
            variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('withdrawals')}
            className={activeTab === 'withdrawals' ? 'bg-green-600' : 'border-slate-600 text-slate-300'}
          >
            <Wallet className="w-4 h-4 mr-2" />
            Withdrawals ({withdrawals.length})
          </Button>
        </div>

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <>
            {investments.length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
                <DollarSign className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No investments yet</h3>
                <p className="text-slate-400">When users make investments, they will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 animate-fade-in hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            ${investment.amount.toLocaleString()}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(investment.status)}`}>
                            {investment.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>User: {investment.profiles?.full_name || 'Unknown'}</p>
                          <p>Email: {investment.profiles?.email || 'N/A'}</p>
                          <p>Date: {new Date(investment.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="flex items-center gap-2">
                          <Label className="text-slate-300 text-sm whitespace-nowrap">Profit:</Label>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">$</span>
                            <Input
                              type="number"
                              value={investment.profit_amount}
                              onChange={(e) => handleProfitChange(investment.id, e.target.value)}
                              className="w-24 bg-slate-900/50 border-slate-600 text-white text-right"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {investment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateInvestment(investment.id, 'active', investment.profit_amount)}
                              disabled={updating === investment.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {updating === investment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInvestment(investment.id, investment.status, investment.profit_amount)}
                            disabled={updating === investment.id}
                            className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
                          >
                            {updating === investment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <TrendingUp className="w-4 h-4 mr-1" />
                            )}
                            Update Profit
                          </Button>
                          {investment.status !== 'cancelled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateInvestment(investment.id, 'cancelled')}
                              disabled={updating === investment.id}
                              className="border-red-500 text-red-500 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <>
            {withdrawals.length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
                <Wallet className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No withdrawals yet</h3>
                <p className="text-slate-400">When users request withdrawals, they will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 animate-fade-in hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            ${withdrawal.amount.toLocaleString()}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>User: {withdrawal.profiles?.full_name || 'Unknown'}</p>
                          <p>Email: {withdrawal.profiles?.email || 'N/A'}</p>
                          <p>Country: {withdrawal.country}</p>
                          <p>Payment Details: {withdrawal.payment_details}</p>
                          <p>Date: {new Date(withdrawal.created_at).toLocaleDateString()}</p>
                          {withdrawal.hold_message && (
                            <p className="text-orange-400">
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                              Hold Message: {withdrawal.hold_message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        {withdrawal.status === 'on_hold' && (
                          <div className="w-full md:w-64">
                            <Label className="text-slate-300 text-sm">Hold Message:</Label>
                            <Input
                              value={withdrawal.hold_message || withdrawalSettings.defaultHoldMessage}
                              onChange={(e) => handleWithdrawalHoldMessageChange(withdrawal.id, e.target.value)}
                              className="mt-1 bg-slate-900/50 border-slate-600 text-white text-sm"
                              placeholder="Enter hold message..."
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateWithdrawal(withdrawal.id, 'completed')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updatingWithdrawal === withdrawal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateWithdrawal(withdrawal.id, 'on_hold', withdrawalSettings.defaultHoldMessage)}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Put on Hold
                              </Button>
                            </>
                          )}
                          {withdrawal.status === 'on_hold' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateWithdrawal(withdrawal.id, 'completed')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {updatingWithdrawal === withdrawal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                )}
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateWithdrawal(withdrawal.id, 'on_hold', withdrawal.hold_message || withdrawalSettings.defaultHoldMessage)}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
                              >
                                Update Message
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateWithdrawal(withdrawal.id, 'pending')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                              >
                                Set Pending
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;