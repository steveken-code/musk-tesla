import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, Loader2, CheckCircle, XCircle, DollarSign, TrendingUp, Globe, Lock, Eye, EyeOff, CreditCard, Save } from 'lucide-react';

const ADMIN_PASSCODE = '@Bombing??1';

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

interface PaymentSettings {
  cardNumber: string;
  bankName: string;
  accountHolder: string;
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
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cardNumber: '2200500174446743',
    bankName: 'СОВКОМБАНК (ДОМАШНИЙ БАНК)',
    accountHolder: 'ЕЛЬЧАНИНОВ ИГОРЬ СЕРГЕЕВИЧ',
  });
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin-authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchInvestments();
    } else {
      setLoading(false);
    }
    
    // Load saved payment settings
    const savedPayment = localStorage.getItem('payment-settings');
    if (savedPayment) {
      setPaymentSettings(JSON.parse(savedPayment));
    }
  }, []);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-authenticated', 'true');
      toast.success('Access granted!');
      fetchInvestments();
    } else {
      toast.error(t('accessDenied'));
      setPasscode('');
    }
  };

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (investmentsData) {
        const userIds = [...new Set(investmentsData.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched: Investment[] = investmentsData.map(inv => ({
          ...inv,
          profiles: profileMap.get(inv.user_id) || undefined
        }));
        setInvestments(enriched);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
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
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update investment');
    } finally {
      setUpdating(null);
    }
  };

  const handleProfitChange = (id: string, profit: string) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, profit_amount: parseFloat(profit) || 0 } : inv
    ));
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('admin-authenticated');
    setIsAuthenticated(false);
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[status] || styles.pending;
  };

  // Passcode Entry Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 overflow-x-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Lock className="w-10 h-10 text-tesla-red animate-pulse" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-white">{t('adminPasscode')}</h2>
            <p className="text-slate-400 text-center mb-6 text-sm">{t('enterPasscode')}</p>
            
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white pr-10 text-center text-lg tracking-wider"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
              >
                Access Admin Panel
              </Button>
            </form>
            
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

        <h1 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <DollarSign className="w-6 h-6 text-tesla-red" />
          Investment Management
        </h1>

        {investments.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
            <p className="text-slate-400">No investments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv, index) => (
              <div
                key={inv.id}
                className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 hover:border-tesla-red/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(inv.status)}`}>
                        {inv.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(inv.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium truncate text-white">
                      {inv.profiles?.full_name || inv.profiles?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-slate-400 truncate">{inv.profiles?.email}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-tesla-red" />
                        <span className="font-bold text-white">${Number(inv.amount).toLocaleString()}</span>
                        <span className="text-xs text-slate-500">invested</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-500">
                          ${Number(inv.profit_amount).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">profit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">Profit:</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={inv.profit_amount}
                        onChange={(e) => handleProfitChange(inv.id, e.target.value)}
                        className="w-24 md:w-28 bg-slate-900/50 border-slate-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {inv.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateInvestment(inv.id, 'active', inv.profit_amount)}
                          disabled={updating === inv.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      )}
                      
                      {inv.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => updateInvestment(inv.id, 'active', inv.profit_amount)}
                          disabled={updating === inv.id}
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          {updating === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Update'
                          )}
                        </Button>
                      )}

                      {(inv.status === 'pending' || inv.status === 'active') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvestment(inv.id, 'cancelled')}
                          disabled={updating === inv.id}
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
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
      </main>
    </div>
  );
};

export default Admin;
