import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, Loader2, CheckCircle, XCircle, DollarSign, TrendingUp, Lock, CreditCard, Save, Wallet, AlertCircle, Clock, MessageSquare, Phone, Send, X, Mail, ShieldAlert, RefreshCw, Gift, Users, Search, FileText, Eye, Globe } from 'lucide-react';
import EmailMonitoringDashboard from '@/components/EmailMonitoringDashboard';
import KYCManagementModal from '@/components/admin/KYCManagementModal';

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
    avatar_url: string | null;
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
    avatar_url: string | null;
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
  whatsappEnabled: boolean;
  whatsappPhone: string;
  telegramEnabled: boolean;
  telegramUsername: string;
}

interface ReferralSettings {
  referralEmail: string;
}

interface CryptoSettings {
  walletAddress: string;
  network: string;
}

interface KYCVerification {
  id: string;
  user_id: string;
  withdrawal_id: string;
  bank_country: string;
  status: string;
  document_url: string | null;
  document_type: string | null;
  tax_id: string | null;
  tax_id_type: string | null;
  net_amount: number | null;
  currency: string | null;
  admin_notes: string | null;
  user_name: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
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
  whatsappEnabled: true,
  whatsappPhone: '+12186500840',
  telegramEnabled: false,
  telegramUsername: '',
};

const DEFAULT_REFERRAL_SETTINGS: ReferralSettings = {
  referralEmail: 'tanyusha.pilipyak@mail.ru',
};

const DEFAULT_CRYPTO_SETTINGS: CryptoSettings = {
  walletAddress: 'TFbr4FWR98Z8UWvVSouVMqrZ2mrLkrjsKA',
  network: 'TRON (TRC20)',
};

// Country code to full name mapping
const countryNames: Record<string, string> = {
  "AL": "Albania", "AD": "Andorra", "AT": "Austria", "BY": "Belarus", "BE": "Belgium",
  "BA": "Bosnia and Herzegovina", "BG": "Bulgaria", "HR": "Croatia", "CY": "Cyprus",
  "CZ": "Czech Republic", "DK": "Denmark", "EE": "Estonia", "FI": "Finland", "FR": "France",
  "DE": "Germany", "GR": "Greece", "HU": "Hungary", "IS": "Iceland", "IE": "Ireland",
  "IT": "Italy", "XK": "Kosovo", "LV": "Latvia", "LI": "Liechtenstein", "LT": "Lithuania",
  "LU": "Luxembourg", "MT": "Malta", "MD": "Moldova", "MC": "Monaco", "ME": "Montenegro",
  "NL": "Netherlands", "MK": "North Macedonia", "NO": "Norway", "PL": "Poland", "PT": "Portugal",
  "RO": "Romania", "RU": "Russia", "SM": "San Marino", "RS": "Serbia", "SK": "Slovakia",
  "SI": "Slovenia", "ES": "Spain", "SE": "Sweden", "CH": "Switzerland", "UA": "Ukraine",
  "GB": "United Kingdom", "UK": "United Kingdom", "VA": "Vatican City",
  "US": "United States", "CA": "Canada", "MX": "Mexico", "BR": "Brazil", "AR": "Argentina",
  "CL": "Chile", "CO": "Colombia", "PE": "Peru", "VE": "Venezuela", "EC": "Ecuador",
  "UY": "Uruguay", "PY": "Paraguay", "BO": "Bolivia",
  "CN": "China", "JP": "Japan", "KR": "South Korea", "IN": "India", "ID": "Indonesia",
  "TH": "Thailand", "VN": "Vietnam", "PH": "Philippines", "MY": "Malaysia", "SG": "Singapore",
  "HK": "Hong Kong", "TW": "Taiwan", "BD": "Bangladesh", "PK": "Pakistan", "LK": "Sri Lanka",
  "NP": "Nepal", "MM": "Myanmar", "KH": "Cambodia", "LA": "Laos",
  "AU": "Australia", "NZ": "New Zealand", "FJ": "Fiji", "PG": "Papua New Guinea",
  "NG": "Nigeria", "GH": "Ghana", "KE": "Kenya", "ZA": "South Africa", "EG": "Egypt",
  "MA": "Morocco", "DZ": "Algeria", "TN": "Tunisia", "ET": "Ethiopia", "TZ": "Tanzania",
  "UG": "Uganda", "SN": "Senegal", "CI": "Ivory Coast", "CM": "Cameroon", "ZW": "Zimbabwe",
  "AE": "United Arab Emirates", "SA": "Saudi Arabia", "QA": "Qatar", "KW": "Kuwait",
  "BH": "Bahrain", "OM": "Oman", "IL": "Israel", "TR": "Turkey", "JO": "Jordan", "LB": "Lebanon"
};

// Helper function to get full country name (case-insensitive)
const getCountryName = (code: string): string => {
  if (!code) return 'Unknown';
  const upperCode = code.toUpperCase();
  return countryNames[upperCode] || code;
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
  const [referralSettings, setReferralSettings] = useState<ReferralSettings>(DEFAULT_REFERRAL_SETTINGS);
  const [cryptoSettings, setCryptoSettings] = useState<CryptoSettings>(DEFAULT_CRYPTO_SETTINGS);
  const [kycVerifications, setKycVerifications] = useState<KYCVerification[]>([]);
  const [kycSearchQuery, setKycSearchQuery] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);
  const [savingSupport, setSavingSupport] = useState(false);
  const [savingReferral, setSavingReferral] = useState(false);
  const [savingCrypto, setSavingCrypto] = useState(false);
  const [activeTab, setActiveTab] = useState<'investments' | 'withdrawals' | 'emails' | 'security' | 'kyc'>('investments');
  
  // KYC Modal state
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedWithdrawalForKyc, setSelectedWithdrawalForKyc] = useState<Withdrawal | null>(null);
  
  // Security logs state - Admin login attempts
  const [loginAttempts, setLoginAttempts] = useState<Array<{
    id: string;
    email: string;
    ip_address: string;
    success: boolean;
    user_agent: string | null;
    created_at: string;
  }>>([]);
  
  // User login attempts
  const [userLoginAttempts, setUserLoginAttempts] = useState<Array<{
    id: string;
    user_id: string;
    email: string;
    ip_address: string;
    success: boolean;
    user_agent: string | null;
    created_at: string;
  }>>([]);
  
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [securityLogTab, setSecurityLogTab] = useState<'admin' | 'user'>('user');
  
  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalWithdrawal, setStatusModalWithdrawal] = useState<Withdrawal | null>(null);
  const [statusModalType, setStatusModalType] = useState<'pending' | 'processing' | 'on_hold'>('pending');
  const [statusModalMessage, setStatusModalMessage] = useState('');
  
  // Search/filter state for admin
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Manual referral creation state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [manualReferrerEmail, setManualReferrerEmail] = useState('');
  const [manualReferredEmail, setManualReferredEmail] = useState('');
  const [creatingReferral, setCreatingReferral] = useState(false);

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
      fetchLoginAttempts();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchLoginAttempts = async () => {
    setLoadingLogs(true);
    try {
      // Fetch admin login attempts
      const { data: adminData, error: adminError } = await supabase
        .from('admin_login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (adminError) throw adminError;
      setLoginAttempts(adminData || []);

      // Fetch user login attempts
      const { data: userData, error: userError } = await supabase
        .from('user_login_attempts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (userError) throw userError;
      setUserLoginAttempts(userData || []);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

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
              whatsappEnabled: value.whatsappEnabled ?? DEFAULT_SUPPORT_SETTINGS.whatsappEnabled,
              whatsappPhone: value.whatsappPhone || DEFAULT_SUPPORT_SETTINGS.whatsappPhone,
              telegramEnabled: value.telegramEnabled ?? DEFAULT_SUPPORT_SETTINGS.telegramEnabled,
              telegramUsername: value.telegramUsername || DEFAULT_SUPPORT_SETTINGS.telegramUsername,
            });
          } else if (setting.setting_key === 'referral_settings' && setting.setting_value) {
            const value = setting.setting_value as unknown as ReferralSettings;
            setReferralSettings({
              referralEmail: value.referralEmail || DEFAULT_REFERRAL_SETTINGS.referralEmail,
            });
          } else if (setting.setting_key === 'crypto_settings' && setting.setting_value) {
            const value = setting.setting_value as unknown as CryptoSettings;
            setCryptoSettings({
              walletAddress: value.walletAddress || DEFAULT_CRYPTO_SETTINGS.walletAddress,
              network: value.network || DEFAULT_CRYPTO_SETTINGS.network,
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
          .select('user_id, full_name, email, avatar_url')
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
          .select('user_id, full_name, email, avatar_url')
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
      
      // Allow unlimited profit amounts - no cap
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
              userName: investment.profiles.full_name || 'User',
              amount: investment.amount,
              investmentId: investment.id,
              investmentDate: investment.created_at,
            },
          });
          toast.success('Investment Approved! User notified via email.');

          // Check if user was referred and send referral bonus notification to the actual referrer
          const { data: referralData } = await supabase
            .from('referrals')
            .select('referrer_user_id, referral_code, status')
            .eq('referred_user_id', investment.user_id)
            .maybeSingle();

          if (referralData && referralData.status === 'pending') {
            // Get the referrer's profile to find their email
            const { data: referrerProfile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('user_id', referralData.referrer_user_id)
              .maybeSingle();

            if (referrerProfile?.email) {
              // Send referral bonus notification to the actual referrer
              await supabase.functions.invoke('send-referral-notification', {
                body: {
                  referralEmail: referrerProfile.email,
                  referredUserName: investment.profiles.full_name || 'User',
                  referredUserEmail: investment.profiles.email,
                  type: 'investment_active',
                  investmentAmount: investment.amount,
                  referrerName: referrerProfile.full_name
                }
              });
              console.log('Referral bonus notification sent to referrer:', referrerProfile.email);
              
              // Update referral status to 'active' since investment is now active
              await supabase
                .from('referrals')
                .update({ status: 'active', updated_at: new Date().toISOString() })
                .eq('referred_user_id', investment.user_id);
            }
          }
        } catch (emailError) {
          console.error('Error sending activation email:', emailError);
          toast.success('Investment Approved! (email notification failed)');
        }
      } else if (status === 'completed' && investment && investment.profiles?.email) {
        // Send trade closed notification email when investment is completed
        try {
          await supabase.functions.invoke('send-trade-closed', {
            body: {
              userEmail: investment.profiles.email,
              userName: investment.profiles.full_name || investment.profiles.email?.split('@')[0] || 'User',
              amount: investment.amount,
              profitAmount: investment.profit_amount || 0,
              investmentId: investment.id,
              investmentDate: investment.created_at,
            },
          });
          toast.success('Trade Completed! User notified via email.');
        } catch (emailError) {
          console.error('Error sending trade closed email:', emailError);
          toast.success('Trade Completed! (email notification failed)');
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
              userName: withdrawal.profiles.full_name || withdrawal.profiles.email?.split('@')[0] || 'User',
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

  const handleSaveReferralSettings = async () => {
    if (!referralSettings.referralEmail.trim()) {
      toast.error('Referral notification email is required');
      return;
    }

    setSavingReferral(true);
    try {
      const { data: existingSetting } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'referral_settings')
        .maybeSingle();

      if (existingSetting) {
        await supabase
          .from('admin_settings')
          .update({ 
            setting_value: JSON.parse(JSON.stringify(referralSettings)),
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'referral_settings');
      } else {
        await supabase
          .from('admin_settings')
          .insert({ 
            setting_key: 'referral_settings',
            setting_value: JSON.parse(JSON.stringify(referralSettings)),
            updated_by: user?.id
          });
      }
      
      toast.success('Referral settings saved!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save referral settings';
      toast.error(errorMessage);
    } finally {
      setSavingReferral(false);
    }
  };

  const handleSaveCryptoSettings = async () => {
    if (!cryptoSettings.walletAddress.trim()) {
      toast.error('Wallet address is required');
      return;
    }
    if (!cryptoSettings.network.trim()) {
      toast.error('Network is required');
      return;
    }

    setSavingCrypto(true);
    try {
      const { data: existingSetting } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'crypto_settings')
        .maybeSingle();

      if (existingSetting) {
        await supabase
          .from('admin_settings')
          .update({ 
            setting_value: JSON.parse(JSON.stringify(cryptoSettings)),
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'crypto_settings');
      } else {
        await supabase
          .from('admin_settings')
          .insert({ 
            setting_key: 'crypto_settings',
            setting_value: JSON.parse(JSON.stringify(cryptoSettings)),
            updated_by: user?.id
          });
      }
      
      toast.success('Crypto wallet settings saved!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save crypto settings';
      toast.error(errorMessage);
    } finally {
      setSavingCrypto(false);
    }
  };

  // Fetch KYC verifications
  const fetchKycVerifications = async () => {
    try {
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (kycError) throw kycError;
      
      if (kycData) {
        // Enrich with profile data
        const userIds = [...new Set(kycData.map(k => k.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched: KYCVerification[] = kycData.map(kyc => ({
          ...kyc,
          profiles: profileMap.get(kyc.user_id) || undefined
        }));
        setKycVerifications(enriched);
      }
    } catch (error) {
      console.error('Error fetching KYC verifications:', error);
    }
  };

  // Load KYC verifications when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchKycVerifications();
    }
  }, [isAdmin]);

  const handleSaveSupportSettings = async () => {
    if (!supportSettings.whatsappEnabled && !supportSettings.telegramEnabled) {
      toast.error('Enable at least one support channel');
      return;
    }
    if (supportSettings.whatsappEnabled && !supportSettings.whatsappPhone.trim()) {
      toast.error('WhatsApp phone is required when enabled');
      return;
    }
    if (supportSettings.telegramEnabled && !supportSettings.telegramUsername.trim()) {
      toast.error('Telegram username is required when enabled');
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

  // Create manual referral function
  const handleCreateManualReferral = async () => {
    if (!manualReferrerEmail.trim() || !manualReferredEmail.trim()) {
      toast.error('Please enter both referrer and referred user emails');
      return;
    }

    setCreatingReferral(true);
    try {
      // Find both users by email
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, full_name')
        .in('email', [manualReferrerEmail.trim().toLowerCase(), manualReferredEmail.trim().toLowerCase()]);

      if (profilesError) throw profilesError;

      const referrerProfile = profiles?.find(p => p.email?.toLowerCase() === manualReferrerEmail.trim().toLowerCase());
      const referredProfile = profiles?.find(p => p.email?.toLowerCase() === manualReferredEmail.trim().toLowerCase());

      if (!referrerProfile) {
        toast.error('Referrer user not found. Make sure they have signed up.');
        return;
      }
      if (!referredProfile) {
        toast.error('Referred user not found. Make sure they have signed up.');
        return;
      }
      if (referrerProfile.user_id === referredProfile.user_id) {
        toast.error('Users cannot refer themselves');
        return;
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', referredProfile.user_id)
        .maybeSingle();

      if (existingReferral) {
        toast.error('This user has already been referred by someone');
        return;
      }

      // Generate referral code from referrer's user_id
      const referralCode = referrerProfile.user_id.slice(0, 8).toUpperCase();

      // Check if referred user has an active investment
      const { data: investmentData } = await supabase
        .from('investments')
        .select('id, status')
        .eq('user_id', referredProfile.user_id)
        .in('status', ['active', 'completed'])
        .limit(1);

      const hasActiveInvestment = investmentData && investmentData.length > 0;

      // Create the referral record
      const { error: createError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: referrerProfile.user_id,
          referred_user_id: referredProfile.user_id,
          referral_code: referralCode,
          status: hasActiveInvestment ? 'active' : 'pending',
          bonus_amount: 500,
          referred_bonus: 100,
        });

      if (createError) throw createError;

      // Update the referred user's profile with the referral code
      await supabase
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('user_id', referredProfile.user_id);

      toast.success(`Referral created! ${referrerProfile.full_name || referrerProfile.email} → ${referredProfile.full_name || referredProfile.email}`);
      setShowReferralModal(false);
      setManualReferrerEmail('');
      setManualReferredEmail('');
    } catch (error) {
      console.error('Error creating manual referral:', error);
      toast.error('Failed to create referral');
    } finally {
      setCreatingReferral(false);
    }
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

        {/* Payment Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <CreditCard className="w-5 h-5 text-tesla-red" />
            {t('paymentSettings')}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">{t('cardNumber')}</Label>
              <Input
                value={paymentSettings.cardNumber}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, cardNumber: e.target.value }))}
                className="bg-white border-2 border-slate-300 [color:#000000_!important] font-mono text-base font-semibold placeholder:text-slate-500 focus:border-tesla-red focus:ring-tesla-red/20 h-12"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">{t('bankName')}</Label>
              <Input
                value={paymentSettings.bankName}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankName: e.target.value }))}
                className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-tesla-red focus:ring-tesla-red/20 h-12"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">{t('accountHolder')}</Label>
              <Input
                value={paymentSettings.accountHolder}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
                className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-tesla-red focus:ring-tesla-red/20 h-12"
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
            {t('savePaymentSettings')}
          </Button>
        </div>

        {/* Withdrawal Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5 text-green-500" />
            {t('withdrawalSettings')}
          </h2>
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm font-semibold">{t('defaultHoldMessage')}</Label>
            <Input
              value={withdrawalSettings.defaultHoldMessage}
              onChange={(e) => setWithdrawalSettings(prev => ({ ...prev, defaultHoldMessage: e.target.value }))}
              className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20 h-12"
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
            {t('saveWithdrawalSettings')}
          </Button>
        </div>

        {/* Support Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5 text-electric-blue" />
            {t('supportSettings')}
          </h2>
          <div className="grid gap-4">
            {/* WhatsApp Settings */}
            <div className="p-4 rounded-lg border border-slate-600 bg-slate-900/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <Phone className="w-3 h-3 text-white" />
                  </span>
                  WhatsApp
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant={supportSettings.whatsappEnabled ? 'default' : 'outline'}
                  onClick={() => setSupportSettings(prev => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))}
                  className={supportSettings.whatsappEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-slate-600 text-slate-300'}
                >
                  {supportSettings.whatsappEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              {supportSettings.whatsappEnabled && (
                <Input
                  value={supportSettings.whatsappPhone}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, whatsappPhone: e.target.value }))}
                  className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold font-mono placeholder:text-slate-500 focus:border-green-500 focus:ring-green-500/20 h-12"
                  placeholder="+12186500840"
                />
              )}
            </div>

            {/* Telegram Settings */}
            <div className="p-4 rounded-lg border border-slate-600 bg-slate-900/50">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#0088cc] rounded-full flex items-center justify-center">
                    <Send className="w-3 h-3 text-white" />
                  </span>
                  Telegram
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant={supportSettings.telegramEnabled ? 'default' : 'outline'}
                  onClick={() => setSupportSettings(prev => ({ ...prev, telegramEnabled: !prev.telegramEnabled }))}
                  className={supportSettings.telegramEnabled ? 'bg-[#0088cc] hover:bg-[#0077b5]' : 'border-slate-600 text-slate-300'}
                >
                  {supportSettings.telegramEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              {supportSettings.telegramEnabled && (
                <Input
                  value={supportSettings.telegramUsername}
                  onChange={(e) => setSupportSettings(prev => ({ ...prev, telegramUsername: e.target.value }))}
                  className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-12"
                  placeholder="@username or phone number"
                />
              )}
            </div>
          </div>
          <Button
            onClick={handleSaveSupportSettings}
            className="mt-4 bg-electric-blue hover:bg-electric-blue/90"
            disabled={savingSupport}
          >
            {savingSupport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t('saveSupportSettings')}
          </Button>
        </div>

        {/* Referral Notification Settings Section */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Gift className="w-5 h-5 text-purple-500" />
            {t('referralSettings') || 'Referral Settings'}
          </h2>
          
          {/* Notification Email */}
          <div className="space-y-2 mb-6">
            <Label className="text-slate-300 text-sm font-semibold">{t('referralEmail') || 'Notification Email'}</Label>
            <Input
              type="email"
              value={referralSettings.referralEmail}
              onChange={(e) => setReferralSettings(prev => ({ ...prev, referralEmail: e.target.value }))}
              className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-12"
              placeholder="email@example.com"
            />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            <span className="font-semibold text-purple-400">Referral codes are automatic.</span> Each user gets a unique referral link based on their account ID (e.g., <code className="bg-slate-700 px-1 rounded">msktesla.net/signup?ref=ABC12345</code>). 
            When someone signs up using a referral link and their investment is activated, you'll receive a notification at this email.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleSaveReferralSettings}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={savingReferral}
            >
              {savingReferral ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {t('saveReferralSettings') || 'Save Notification Settings'}
            </Button>
            
            <Button
              onClick={() => setShowReferralModal(true)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Create Manual Referral
            </Button>
          </div>
        </div>

        {/* Manual Referral Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Create Manual Referral</h3>
                    <p className="text-xs text-slate-400">Link existing users as referrer → referred</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReferralModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-semibold">Referrer Email (gets $500)</Label>
                  <Input
                    type="email"
                    value={manualReferrerEmail}
                    onChange={(e) => setManualReferrerEmail(e.target.value)}
                    className="bg-white border-2 border-slate-300 [color:#000000_!important] placeholder:text-slate-500 h-12"
                    placeholder="referrer@email.com"
                  />
                </div>
                
                <div className="flex justify-center">
                  <div className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-xs font-semibold">
                    ↓ REFERRED ↓
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm font-semibold">Referred User Email (gets $100)</Label>
                  <Input
                    type="email"
                    value={manualReferredEmail}
                    onChange={(e) => setManualReferredEmail(e.target.value)}
                    className="bg-white border-2 border-slate-300 [color:#000000_!important] placeholder:text-slate-500 h-12"
                    placeholder="referred@email.com"
                  />
                </div>
                
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-400">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Both users must already have accounts. The referral bonus will be applied based on their investment status.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateManualReferral}
                  disabled={creatingReferral}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {creatingReferral ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  Create Referral
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Crypto Wallet Settings Section - For International Users */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 mb-8 animate-fade-in">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Wallet className="w-5 h-5 text-amber-500" />
            {t('cryptoSettings') || 'Crypto Wallet Settings'} <span className="text-xs text-slate-400 font-normal">(For non-Russian users)</span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">{t('walletAddress') || 'USDT Wallet Address'}</Label>
              <Input
                value={cryptoSettings.walletAddress}
                onChange={(e) => setCryptoSettings(prev => ({ ...prev, walletAddress: e.target.value }))}
                className="bg-white border-2 border-slate-300 [color:#000000_!important] font-mono text-sm font-semibold placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 h-12"
                placeholder="TFbr4FWR98Z8UWvVSouVMqrZ2mrLKrjsKA"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm font-semibold">{t('network') || 'Network'}</Label>
              <Input
                value={cryptoSettings.network}
                onChange={(e) => setCryptoSettings(prev => ({ ...prev, network: e.target.value }))}
                className="bg-white border-2 border-slate-300 [color:#000000_!important] text-base font-semibold placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20 h-12"
                placeholder="TRON (TRC20)"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            This wallet address will be shown to international users (non-Russia) for USDT deposits. Make sure to use the correct network.
          </p>
          <Button
            onClick={handleSaveCryptoSettings}
            className="mt-4 bg-amber-600 hover:bg-amber-700"
            disabled={savingCrypto}
          >
            {savingCrypto ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t('saveCryptoSettings') || 'Save Crypto Settings'}
          </Button>
        </div>


        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'investments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('investments')}
            className={`relative ${activeTab === 'investments' ? 'bg-tesla-red' : 'border-slate-600 text-slate-300'}`}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {t('investments')} ({investments.length})
            {investments.filter(inv => inv.status === 'pending').length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {investments.filter(inv => inv.status === 'pending').length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'withdrawals' ? 'default' : 'outline'}
            onClick={() => setActiveTab('withdrawals')}
            className={`relative ${activeTab === 'withdrawals' ? 'bg-green-600' : 'border-slate-600 text-slate-300'}`}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {t('featureWithdrawals').split(' ')[0]} ({withdrawals.length})
            {withdrawals.filter(w => w.status === 'pending').length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {withdrawals.filter(w => w.status === 'pending').length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'emails' ? 'default' : 'outline'}
            onClick={() => setActiveTab('emails')}
            className={activeTab === 'emails' ? 'bg-electric-blue' : 'border-slate-600 text-slate-300'}
          >
            <Mail className="w-4 h-4 mr-2" />
            {t('emailMonitoring')}
          </Button>
          <Button
            variant={activeTab === 'kyc' ? 'default' : 'outline'}
            onClick={() => setActiveTab('kyc')}
            className={`relative ${activeTab === 'kyc' ? 'bg-purple-600' : 'border-slate-600 text-slate-300'}`}
          >
            <FileText className="w-4 h-4 mr-2" />
            KYC ({kycVerifications.length})
            {kycVerifications.filter(k => k.status === 'pending_kyc' || k.status === 'kyc_submitted').length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-purple-400 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {kycVerifications.filter(k => k.status === 'pending_kyc' || k.status === 'kyc_submitted').length}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === 'security' ? 'default' : 'outline'}
            onClick={() => setActiveTab('security')}
            className={activeTab === 'security' ? 'bg-orange-600' : 'border-slate-600 text-slate-300'}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            {t('securityLogs')}
          </Button>
        </div>

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <>
            {/* Search Bar */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 mb-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by user name or email..."
                  value={kycSearchQuery}
                  onChange={(e) => setKycSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-black font-semibold placeholder:text-slate-500 focus:border-slate-400"
                  style={{ color: "#000000", WebkitTextFillColor: "#000000", opacity: 1 }}
                />
              </div>
            </div>

            {kycVerifications.filter(kyc => {
              if (!kycSearchQuery.trim()) return true;
              const search = kycSearchQuery.toLowerCase();
              const name = (kyc.user_name || kyc.profiles?.full_name || '').toLowerCase();
              const email = (kyc.profiles?.email || '').toLowerCase();
              return name.includes(search) || email.includes(search);
            }).length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
                <FileText className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {kycSearchQuery.trim() ? 'No matching KYC records' : 'No KYC verifications yet'}
                </h3>
                <p className="text-slate-400">
                  {kycSearchQuery.trim() ? 'Try a different search term.' : 'When users submit KYC documents, they will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {kycVerifications.filter(kyc => {
                  if (!kycSearchQuery.trim()) return true;
                  const search = kycSearchQuery.toLowerCase();
                  const name = (kyc.user_name || kyc.profiles?.full_name || '').toLowerCase();
                  const email = (kyc.profiles?.email || '').toLowerCase();
                  return name.includes(search) || email.includes(search);
                }).map((kyc) => {
                  const getKycStatusBadge = (status: string) => {
                    const styles: Record<string, string> = {
                      pending_kyc: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      kyc_submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      kyc_approved: 'bg-green-500/20 text-green-400 border-green-500/30',
                      pending_settlement: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                    };
                    return styles[status] || styles.pending_kyc;
                  };

                  return (
                    <div
                      key={kyc.id}
                      className={`bg-slate-800/80 backdrop-blur-xl border rounded-xl p-5 md:p-6 animate-fade-in hover:border-slate-600 transition-colors ${
                        kyc.status === 'kyc_submitted' 
                          ? 'border-blue-500/50 ring-2 ring-blue-500/20' 
                          : kyc.status === 'pending_kyc'
                          ? 'border-yellow-500/50'
                          : 'border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              kyc.status === 'kyc_submitted' ? 'bg-blue-500/20 text-blue-400' :
                              kyc.status === 'kyc_approved' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {(kyc.user_name || kyc.profiles?.full_name || kyc.profiles?.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-semibold">
                                {kyc.user_name || kyc.profiles?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-electric-blue text-sm">
                                {kyc.profiles?.email || `User ID: ${kyc.user_id.slice(0, 8)}...`}
                              </p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="bg-slate-900/40 rounded-lg p-2">
                              <p className="text-slate-500 text-xs">Country</p>
                              <p className="text-slate-200 font-medium">{getCountryName(kyc.bank_country)}</p>
                            </div>
                            {kyc.net_amount && (
                              <div className="bg-slate-900/40 rounded-lg p-2">
                                <p className="text-slate-500 text-xs">Amount</p>
                                <p className="text-green-400 font-medium">${kyc.net_amount.toLocaleString()}</p>
                              </div>
                            )}
                            <div className="bg-slate-900/40 rounded-lg p-2">
                              <p className="text-slate-500 text-xs">Status</p>
                              <span className={`inline-flex px-2 py-0.5 text-xs rounded-full border font-medium ${getKycStatusBadge(kyc.status)}`}>
                                {kyc.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="bg-slate-900/40 rounded-lg p-2">
                              <p className="text-slate-500 text-xs">Submitted</p>
                              <p className="text-slate-200 text-xs">{new Date(kyc.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Tax ID if available */}
                          {kyc.tax_id && (
                            <div className="text-sm">
                              <span className="text-slate-500">Tax ID ({kyc.tax_id_type}):</span>
                              <span className="text-slate-200 font-mono ml-2">{kyc.tax_id}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {kyc.document_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(kyc.document_url!, '_blank')}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Doc
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              // Find matching withdrawal
                              const withdrawal = withdrawals.find(w => w.id === kyc.withdrawal_id);
                              if (withdrawal) {
                                setSelectedWithdrawalForKyc(withdrawal);
                                setShowKycModal(true);
                              } else {
                                toast.error('Associated withdrawal not found');
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Manage KYC
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Security Logs Tab */}
        {activeTab === 'security' && (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                {t('securityLogs')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLoginAttempts}
                disabled={loadingLogs}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {loadingLogs ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="ml-2">{t('refreshLogs')}</span>
              </Button>
            </div>

            {/* Sub-tabs for User vs Admin logins */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={securityLogTab === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSecurityLogTab('user')}
                className={securityLogTab === 'user' ? 'bg-electric-blue' : 'border-slate-600 text-slate-300'}
              >
                <Users className="w-4 h-4 mr-2" />
                User Logins ({userLoginAttempts.length})
              </Button>
              <Button
                variant={securityLogTab === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSecurityLogTab('admin')}
                className={securityLogTab === 'admin' ? 'bg-orange-600' : 'border-slate-600 text-slate-300'}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Admin Logins ({loginAttempts.length})
              </Button>
            </div>

            {loadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : securityLogTab === 'user' ? (
              /* User Login Attempts */
              userLoginAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No user sign-ins recorded</h3>
                  <p className="text-slate-400">User sign-ins will appear here once users log in to the platform.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Email</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">IP Address</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Time</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm hidden lg:table-cell">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userLoginAttempts.map((attempt) => (
                        <tr key={attempt.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            {attempt.success ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                <XCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-white text-sm">{attempt.email}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm font-mono">{attempt.ip_address}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">
                            {new Date(attempt.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell max-w-xs truncate">
                            {attempt.user_agent || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Admin Login Attempts */
              loginAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <ShieldAlert className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No admin login attempts recorded</h3>
                  <p className="text-slate-400">Admin login attempts will appear here once the 2FA system is used.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Email</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">IP Address</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Time</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm hidden lg:table-cell">User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginAttempts.map((attempt) => (
                        <tr key={attempt.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            {attempt.success ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                                <XCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-white text-sm">{attempt.email}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm font-mono">{attempt.ip_address}</td>
                          <td className="py-3 px-4 text-slate-400 text-sm">
                            {new Date(attempt.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs hidden lg:table-cell max-w-xs truncate">
                            {attempt.user_agent || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                Security Information
              </h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• All user sign-ins are tracked with IP address and device information</li>
                <li>• After 5 failed admin login attempts, the account is locked for 15 minutes</li>
                <li>• All admin logins require two-factor authentication via email</li>
                <li>• 2FA codes expire after 5 minutes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Email Monitoring Tab */}
        {activeTab === 'emails' && (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 md:p-6 animate-fade-in">
            <EmailMonitoringDashboard />
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <>
            {/* Search/Filter Bar */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 mb-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by user name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-black font-semibold placeholder:text-slate-500 focus:border-green-500"
                />
              </div>
            </div>

            {investments.filter(inv => {
              if (!userSearchQuery.trim()) return true;
              const search = userSearchQuery.toLowerCase();
              const name = inv.profiles?.full_name?.toLowerCase() || '';
              const email = inv.profiles?.email?.toLowerCase() || '';
              return name.includes(search) || email.includes(search);
            }).length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
                <DollarSign className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {userSearchQuery.trim() ? 'No matching investments' : 'No investments yet'}
                </h3>
                <p className="text-slate-400">
                  {userSearchQuery.trim() ? 'Try a different search term.' : 'When users make investments, they will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {investments.filter(inv => {
                  if (!userSearchQuery.trim()) return true;
                  const search = userSearchQuery.toLowerCase();
                  const name = inv.profiles?.full_name?.toLowerCase() || '';
                  const email = inv.profiles?.email?.toLowerCase() || '';
                  return name.includes(search) || email.includes(search);
                }).map((investment) => (
                  <div
                    key={investment.id}
                    className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-5 md:p-8 animate-fade-in hover:border-slate-600 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* User Info Section - Prominent Display with Avatar */}
                        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-tesla-red/20 flex items-center justify-center">
                              {investment.profiles?.avatar_url ? (
                                <img 
                                  src={investment.profiles.avatar_url} 
                                  alt="User avatar" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-tesla-red font-bold text-lg">
                                  {(investment.profiles?.full_name || investment.profiles?.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-white font-semibold text-lg">
                                {investment.profiles?.full_name?.trim() || investment.profiles?.email?.split('@')[0] || `User-${investment.user_id.slice(0,8)}`}
                              </p>
                              <p className="text-electric-blue font-medium text-sm">
                                {investment.profiles?.email || `ID: ${investment.user_id.slice(0,12)}...`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Investment Details */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold text-white">
                            ${investment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </h3>
                          <span className={`px-3 py-1.5 text-xs rounded-full border font-medium ${getStatusBadge(investment.status)}`}>
                            {investment.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Profit & Portfolio Badges */}
                        <div className="flex flex-wrap gap-3">
                          {investment.profit_amount > 0 && (
                            <span className="px-4 py-2 text-sm rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 font-semibold">
                              +${investment.profit_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Profit
                            </span>
                          )}
                          {(investment.status === 'active' || investment.status === 'completed') && (
                            <span className="px-4 py-2 text-sm rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                              Portfolio: ${(Number(investment.amount) + Number(investment.profit_amount || 0)).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <p className="text-slate-400 text-sm">
                          Created: {new Date(investment.created_at).toLocaleDateString()} at {new Date(investment.created_at).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 md:items-end">
                        <div className="flex items-center gap-2">
                          <Label className="text-slate-300 text-sm whitespace-nowrap">Set Profit:</Label>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">$</span>
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              min="0"
                              value={investment.profit_amount}
                              onChange={(e) => {
                                handleProfitChange(investment.id, e.target.value);
                              }}
                              className="w-32 h-10 bg-white border-slate-300 [color:#000000_!important] text-right font-semibold text-base"
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
                          {investment.status === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => updateInvestment(investment.id, 'completed', investment.profit_amount)}
                              disabled={updating === investment.id}
                              className="bg-electric-blue hover:bg-electric-blue/90"
                            >
                              {updating === investment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Mark Completed
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
                          {investment.status !== 'cancelled' && investment.status !== 'completed' && (
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
            {/* Search/Filter Bar */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-4 mb-4 animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by user name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-slate-300 text-black font-semibold placeholder:text-slate-500 focus:border-green-500"
                />
              </div>
            </div>

            {withdrawals.filter(w => {
              if (!userSearchQuery.trim()) return true;
              const search = userSearchQuery.toLowerCase();
              const name = w.profiles?.full_name?.toLowerCase() || '';
              const email = w.profiles?.email?.toLowerCase() || '';
              return name.includes(search) || email.includes(search);
            }).length === 0 ? (
              <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-8 text-center animate-fade-in">
                <Wallet className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {userSearchQuery.trim() ? 'No matching withdrawals' : 'No withdrawals yet'}
                </h3>
                <p className="text-slate-400">
                  {userSearchQuery.trim() ? 'Try a different search term.' : 'When users request withdrawals, they will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {withdrawals.filter(w => {
                  if (!userSearchQuery.trim()) return true;
                  const search = userSearchQuery.toLowerCase();
                  const name = w.profiles?.full_name?.toLowerCase() || '';
                  const email = w.profiles?.email?.toLowerCase() || '';
                  return name.includes(search) || email.includes(search);
                }).map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className={`bg-slate-800/80 backdrop-blur-xl border rounded-xl p-5 md:p-8 animate-fade-in hover:border-slate-600 transition-colors ${
                      withdrawal.status === 'pending' 
                        ? 'border-amber-500/50 ring-2 ring-amber-500/20' 
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* User Info Section - Prominent Display with Avatar */}
                        <div className={`rounded-lg p-4 border ${
                          withdrawal.status === 'pending' 
                            ? 'bg-amber-900/30 border-amber-500/40' 
                            : 'bg-slate-900/60 border-slate-700'
                        }`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg ${
                              withdrawal.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {withdrawal.profiles?.avatar_url ? (
                                <img 
                                  src={withdrawal.profiles.avatar_url} 
                                  alt="User avatar" 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>
                                  {(withdrawal.profiles?.full_name || withdrawal.profiles?.email || 'U').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-white font-semibold text-lg">
                                  {withdrawal.profiles?.full_name?.trim() || withdrawal.profiles?.email?.split('@')[0] || `User-${withdrawal.user_id.slice(0,8)}`}
                                </p>
                                {withdrawal.status === 'pending' && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold animate-pulse">
                                    ⚠️ Needs Attention
                                  </span>
                                )}
                              </div>
                              <p className="text-electric-blue font-medium text-sm">
                                {withdrawal.profiles?.email || `ID: ${withdrawal.user_id.slice(0,12)}...`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Withdrawal Amount */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold text-white">
                            ${withdrawal.amount.toLocaleString()}
                          </h3>
                          <span className={`px-3 py-1.5 text-xs rounded-full border font-medium ${getStatusBadge(withdrawal.status)}`}>
                            {withdrawal.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="bg-slate-900/40 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Country</p>
                            <p className="text-slate-200 font-medium">{getCountryName(withdrawal.country)}</p>
                          </div>
                          <div className="bg-slate-900/40 rounded-lg p-3">
                            <p className="text-slate-500 text-xs mb-1">Payment Details</p>
                            <p className="text-slate-200 font-medium break-all">{withdrawal.payment_details}</p>
                          </div>
                        </div>

                        <p className="text-slate-400 text-sm">
                          Requested: {new Date(withdrawal.created_at).toLocaleDateString()} at {new Date(withdrawal.created_at).toLocaleTimeString()}
                        </p>

                        {withdrawal.hold_message && withdrawal.status !== 'completed' && (
                          <p className="text-orange-400 text-sm">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            Hold Message: {withdrawal.hold_message}
                          </p>
                        )}
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
                          {/* KYC Management Button - always visible */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWithdrawalForKyc(withdrawal);
                              setShowKycModal(true);
                            }}
                            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            KYC
                          </Button>
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
                    <Label className="text-slate-300 font-semibold">Hold/Billing Fee Message</Label>
                    <textarea
                      value={statusModalMessage}
                      onChange={(e) => setStatusModalMessage(e.target.value)}
                      className="w-full h-24 bg-white border-2 border-slate-400 rounded-lg p-3 text-black text-base font-bold resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder:text-slate-500"
                      placeholder="Enter the billing fee or hold message..."
                      style={{ 
                        color: '#000000', 
                        opacity: 1, 
                        backgroundColor: '#ffffff',
                        fontWeight: 700,
                        WebkitTextFillColor: '#000000'
                      }}
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

      {/* KYC Management Modal */}
      <KYCManagementModal
        open={showKycModal}
        onClose={() => {
          setShowKycModal(false);
          setSelectedWithdrawalForKyc(null);
        }}
        withdrawal={selectedWithdrawalForKyc}
        onKycCreated={fetchData}
        whatsappPhone={supportSettings.whatsappPhone}
      />
    </div>
  );
};

export default Admin;