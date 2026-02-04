import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Loader2, CheckCircle, XCircle, FileText, Eye, Send, 
  User, Globe, CreditCard, Building, DollarSign, AlertCircle,
  RefreshCw, ExternalLink, Copy, Link, RotateCcw
} from 'lucide-react';
import { getTaxIdConfig, getAccountConfig, getCountryList, getCurrencyList } from '@/data/taxIdFormats';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface KYCVerification {
  id: string;
  withdrawal_id: string;
  user_id: string;
  user_name: string | null;
  bank_country: string;
  payment_method: string;
  account_number: string | null;
  tax_id: string | null;
  tax_id_type: string | null;
  document_url: string | null;
  document_type: string | null;
  status: string;
  net_amount: number | null;
  currency: string | null;
  admin_notes: string | null;
  kyc_token: string | null;
  created_at: string;
  updated_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  country: string;
  payment_details: string;
  status: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

interface KYCManagementModalProps {
  open: boolean;
  onClose: () => void;
  withdrawal: Withdrawal | null;
  onKycCreated: () => void;
  whatsappPhone?: string;
}

interface ConfirmAction {
  type: 'send_kyc' | 'approve' | 'settlement' | 'complete' | 'reset';
  title: string;
  description: string;
}

const countryNames: Record<string, string> = {
  "RU": "Russia", "US": "United States", "DE": "Germany", "GB": "United Kingdom",
  "FR": "France", "ES": "Spain", "IT": "Italy", "CA": "Canada", "AU": "Australia",
  "NL": "Netherlands", "BE": "Belgium", "AT": "Austria", "CH": "Switzerland",
  "PL": "Poland", "SE": "Sweden", "NO": "Norway", "DK": "Denmark", "FI": "Finland",
  "PT": "Portugal", "GR": "Greece", "IE": "Ireland", "CZ": "Czech Republic",
  "HU": "Hungary", "RO": "Romania", "UA": "Ukraine", "BY": "Belarus",
  "JP": "Japan", "CN": "China", "KR": "South Korea", "IN": "India",
  "BR": "Brazil", "MX": "Mexico", "AR": "Argentina", "ZA": "South Africa",
  "AE": "United Arab Emirates", "SA": "Saudi Arabia", "TR": "Turkey", "IL": "Israel",
  "SG": "Singapore", "HK": "Hong Kong", "TW": "Taiwan", "TH": "Thailand",
};

const getCountryName = (code: string): string => {
  return countryNames[code?.toUpperCase()] || code || 'Unknown';
};

// Generate a unique token
const generateToken = () => {
  return crypto.randomUUID().replace(/-/g, '');
};

// Statuses where user has actually submitted KYC
const USER_SUBMITTED_STATUSES = ['kyc_submitted', 'kyc_approved', 'pending_settlement', 'completed'];

const KYCManagementModal = ({ 
  open, 
  onClose, 
  withdrawal, 
  onKycCreated,
  whatsappPhone = '+12186500840'
}: KYCManagementModalProps) => {
  const [loading, setLoading] = useState(false);
  const [kycData, setKycData] = useState<KYCVerification | null>(null);
  const [loadingKyc, setLoadingKyc] = useState(false);

  // Form state
  const [userName, setUserName] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card'>('bank_transfer');
  const [accountNumber, setAccountNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [netAmount, setNetAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [adminNotes, setAdminNotes] = useState('');

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  // Race condition guard - track which withdrawal we're loading
  const activeWithdrawalIdRef = useRef<string | null>(null);

  const countries = getCountryList();
  const currencies = getCurrencyList();

  // Reset all form state to defaults or withdrawal values
  const resetFormState = (w: Withdrawal | null) => {
    setKycData(null);
    setUserName(w?.profiles?.full_name || '');
    setBankCountry(w?.country || 'US');
    setPaymentMethod('bank_transfer');
    setAccountNumber('');
    setTaxId('');
    setNetAmount(w?.amount?.toString() || '');
    setCurrency('USD');
    setAdminNotes('');
  };

  // Load existing KYC data when modal opens or withdrawal changes
  useEffect(() => {
    if (open && withdrawal) {
      // CRITICAL: Clear stale data immediately before fetching
      resetFormState(withdrawal);
      loadKycData();
    } else if (!open) {
      // Reset when modal closes
      resetFormState(null);
      activeWithdrawalIdRef.current = null;
    }
  }, [open, withdrawal?.id]);

  const loadKycData = async () => {
    if (!withdrawal) return;
    
    // Set which withdrawal we're loading (race condition guard)
    const requestWithdrawalId = withdrawal.id;
    activeWithdrawalIdRef.current = requestWithdrawalId;

    setLoadingKyc(true);
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('withdrawal_id', withdrawal.id)
        .maybeSingle();

      if (error) throw error;
      
      // Race condition guard: If withdrawal changed while fetching, ignore result
      if (activeWithdrawalIdRef.current !== requestWithdrawalId) {
        console.log('KYC data fetch for old withdrawal ignored:', requestWithdrawalId);
        return;
      }
      
      if (data) {
        // Verify the data matches current withdrawal (safety check)
        if (data.withdrawal_id !== withdrawal.id) {
          console.error('KYC data withdrawal_id mismatch!', data.withdrawal_id, 'vs', withdrawal.id);
          setKycData(null);
          return;
        }
        
        setKycData(data);
        // Update form with existing KYC data
        setUserName(data.user_name || withdrawal.profiles?.full_name || '');
        setBankCountry(data.bank_country || withdrawal.country || 'US');
        setPaymentMethod(data.payment_method as 'bank_transfer' | 'card' || 'bank_transfer');
        setAccountNumber(data.account_number || '');
        setTaxId(data.tax_id || '');
        setNetAmount(data.net_amount?.toString() || withdrawal.amount?.toString() || '');
        setCurrency(data.currency || 'USD');
        setAdminNotes(data.admin_notes || '');
      } else {
        // CRITICAL: Explicitly set to null when no record found
        setKycData(null);
        // Keep form reset to withdrawal defaults (already done in resetFormState)
      }
    } catch (err) {
      console.error('Error loading KYC data:', err);
      setKycData(null);
    } finally {
      setLoadingKyc(false);
    }
  };

  // Safety check before any action
  const validateActionSafety = (): boolean => {
    if (!withdrawal) {
      toast.error('No withdrawal selected');
      return false;
    }
    
    if (kycData && kycData.withdrawal_id !== withdrawal.id) {
      toast.error('KYC record mismatch detected! Please refresh the modal.');
      return false;
    }
    
    return true;
  };

  const handleSendKycRequest = async () => {
    if (!validateActionSafety()) return;
    if (!withdrawal || !withdrawal.profiles?.email) {
      toast.error('User email not found');
      return;
    }

    if (!userName.trim() || !bankCountry) {
      toast.error('Please fill in user name and country');
      return;
    }

    setLoading(true);
    try {
      const kycToken = generateToken();
      const verificationUrl = `https://msktesla.net/verify-identity?token=${kycToken}&withdrawal_id=${withdrawal.id}`;

      // Create or update KYC record
      if (kycData) {
        // Update existing record
        const { error } = await supabase
          .from('kyc_verifications')
          .update({
            user_name: userName,
            bank_country: bankCountry,
            payment_method: paymentMethod,
            account_number: accountNumber || null,
            tax_id: taxId || null,
            tax_id_type: getTaxIdConfig(bankCountry).label,
            net_amount: netAmount ? parseFloat(netAmount) : null,
            currency: currency,
            admin_notes: adminNotes || null,
            kyc_token: kycToken,
            status: 'pending_kyc',
            updated_at: new Date().toISOString()
          })
          .eq('id', kycData.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('kyc_verifications')
          .insert({
            withdrawal_id: withdrawal.id,
            user_id: withdrawal.user_id,
            user_name: userName,
            bank_country: bankCountry,
            payment_method: paymentMethod,
            account_number: accountNumber || null,
            tax_id: taxId || null,
            tax_id_type: getTaxIdConfig(bankCountry).label,
            net_amount: netAmount ? parseFloat(netAmount) : null,
            currency: currency,
            admin_notes: adminNotes || null,
            kyc_token: kycToken,
            status: 'pending_kyc'
          });

        if (error) throw error;
      }

      // Send KYC request email
      const { error: emailError } = await supabase.functions.invoke('send-kyc-request', {
        body: {
          userEmail: withdrawal.profiles.email,
          userName: userName,
          withdrawalId: withdrawal.id,
          withdrawalAmount: withdrawal.amount,
          kycToken: kycToken,
          bankCountry: bankCountry,
          verificationUrl: verificationUrl
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast.error('KYC record created but email failed to send');
      } else {
        toast.success('KYC request sent successfully!');
      }

      onKycCreated();
      loadKycData();
    } catch (err) {
      console.error('Error sending KYC request:', err);
      toast.error('Failed to send KYC request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKyc = async () => {
    if (!validateActionSafety()) return;
    if (!kycData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'kyc_approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);

      if (error) throw error;

      toast.success('KYC approved successfully!');
      loadKycData();
    } catch (err) {
      console.error('Error approving KYC:', err);
      toast.error('Failed to approve KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSettlementEmail = async () => {
    if (!validateActionSafety()) return;
    if (!withdrawal || !withdrawal.profiles?.email || !kycData) {
      toast.error('Missing required data');
      return;
    }

    setLoading(true);
    try {
      // Update status to pending_settlement
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending_settlement',
          net_amount: netAmount ? parseFloat(netAmount) : kycData.net_amount,
          currency: currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);

      if (updateError) throw updateError;

      // Send settlement email
      const { error: emailError } = await supabase.functions.invoke('send-settlement-required', {
        body: {
          userEmail: withdrawal.profiles.email,
          userName: userName || kycData.user_name,
          withdrawalId: withdrawal.id,
          netAmount: netAmount ? parseFloat(netAmount) : kycData.net_amount || withdrawal.amount,
          currency: currency,
          bankCountry: bankCountry || kycData.bank_country,
          accountNumber: accountNumber || kycData.account_number || '',
          paymentMethod: paymentMethod || kycData.payment_method,
          whatsappPhone: whatsappPhone
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        toast.error('Status updated but email failed to send');
      } else {
        toast.success('Settlement email sent successfully!');
      }

      loadKycData();
    } catch (err) {
      console.error('Error sending settlement email:', err);
      toast.error('Failed to send settlement email');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!validateActionSafety()) return;
    if (!kycData) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);

      if (error) throw error;

      toast.success('KYC process completed!');
      onKycCreated();
      loadKycData();
    } catch (err) {
      console.error('Error completing KYC:', err);
      toast.error('Failed to complete KYC');
    } finally {
      setLoading(false);
    }
  };

  // Reset KYC - rotates token, clears submissions, resets to pending_kyc
  const handleResetKyc = async () => {
    if (!validateActionSafety()) return;
    if (!kycData) return;

    setLoading(true);
    try {
      const newToken = generateToken();
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          kyc_token: newToken,
          status: 'pending_kyc',
          document_url: null,
          document_type: null,
          tax_id: null,
          tax_id_type: getTaxIdConfig(bankCountry).label,
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);

      if (error) throw error;

      toast.success('KYC has been reset. Old links are now invalid.');
      setTaxId(''); // Clear local form too
      loadKycData();
    } catch (err) {
      console.error('Error resetting KYC:', err);
      toast.error('Failed to reset KYC');
    } finally {
      setLoading(false);
    }
  };

  // Execute confirmed action
  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    
    switch (confirmAction.type) {
      case 'send_kyc':
        handleSendKycRequest();
        break;
      case 'approve':
        handleApproveKyc();
        break;
      case 'settlement':
        handleSendSettlementEmail();
        break;
      case 'complete':
        handleMarkCompleted();
        break;
      case 'reset':
        handleResetKyc();
        break;
    }
    setConfirmAction(null);
  };

  const taxIdConfig = getTaxIdConfig(bankCountry);
  const accountConfig = getAccountConfig(bankCountry);

  // Check if Tax ID should be read-only (user has actually submitted KYC)
  const isUserSubmittedKyc = kycData && USER_SUBMITTED_STATUSES.includes(kycData.status);
  const isTaxIdLocked = isUserSubmittedKyc && !!kycData?.tax_id;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_kyc':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'kyc_submitted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'kyc_approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending_settlement':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Short withdrawal ID for display
  const shortWithdrawalId = withdrawal?.id?.slice(0, 8) || '';

  if (!withdrawal) return null;

  return (
    <>
      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-slate-900/100 border-slate-700 text-white backdrop-blur-none [background:hsl(222_47%_7%)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-slate-800 rounded-lg p-3 text-sm space-y-1">
            <p><span className="text-slate-500">User:</span> <span className="text-white font-medium">{userName || withdrawal.profiles?.full_name}</span></p>
            <p><span className="text-slate-500">Email:</span> <span className="text-electric-blue">{withdrawal.profiles?.email}</span></p>
            <p><span className="text-slate-500">Amount:</span> <span className="text-green-400 font-bold">${withdrawal.amount.toLocaleString()}</span></p>
            <p><span className="text-slate-500">Withdrawal ID:</span> <span className="text-slate-300 font-mono">{shortWithdrawalId}...</span></p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedAction}
              className={
                confirmAction?.type === 'reset' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/100 border-slate-700 text-white backdrop-blur-none [background:hsl(222_47%_7%)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-tesla-red" />
              KYC Management
            </DialogTitle>
          </DialogHeader>

          {loadingKyc ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Withdrawal Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-300">Withdrawal Request</h3>
                  <span className="text-2xl font-bold text-green-400">
                    ${withdrawal.amount.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">User:</span>
                    <p className="text-white font-medium">{withdrawal.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-electric-blue text-xs">{withdrawal.profiles?.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Original Country:</span>
                    <p className="text-white">{getCountryName(withdrawal.country)}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">ID: {shortWithdrawalId}...</p>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              {kycData && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-300">KYC Status</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(kycData.status)}`}>
                      {kycData.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {kycData.document_url && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-2">Uploaded Document:</p>
                      <a 
                        href={kycData.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View {kycData.document_type || 'Document'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  
                  {kycData.tax_id && (
                    <p className="text-sm text-slate-400 mt-2">
                      Tax ID Provided: <span className="text-white font-mono">{kycData.tax_id}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Form */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {/* User Name */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    User Name (for ID)
                  </Label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Full name as on ID"
                    className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white] font-medium"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Bank Country
                  </Label>
                  <Select value={bankCountry} onValueChange={setBankCountry}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white]">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-60 z-[200] [background:hsl(222_39%_13%)]">
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method - Bank Transfer Only */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Payment Method
                  </Label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md">
                    <Building className="w-4 h-4 text-green-400" />
                    <span className="text-white">Bank Transfer</span>
                  </div>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    {accountConfig.label}
                  </Label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={accountConfig.placeholder}
                    className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white] font-mono font-medium"
                  />
                  <p className="text-xs text-slate-500">{accountConfig.format}</p>
                </div>

                {/* Tax ID */}
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    {taxIdConfig.label}
                    {isTaxIdLocked && (
                      <span className="ml-2 text-xs text-green-400">(User submitted)</span>
                    )}
                  </Label>
                  <Input
                    value={taxId}
                    onChange={(e) => !isTaxIdLocked && setTaxId(e.target.value)}
                    placeholder={taxIdConfig.placeholder}
                    maxLength={taxIdConfig.maxLength}
                    className={`bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white] font-mono font-medium ${isTaxIdLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                    readOnly={isTaxIdLocked}
                    disabled={isTaxIdLocked}
                  />
                  <p className="text-xs text-slate-500">{taxIdConfig.format}</p>
                </div>

                {/* Net Amount */}
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Net Amount
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={netAmount}
                    onChange={(e) => {
                      // Allow only numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setNetAmount(value);
                    }}
                    placeholder="Amount to disburse"
                    className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white] font-medium"
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="text-slate-300">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-60 z-[200] [background:hsl(222_39%_13%)]">
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-white hover:bg-slate-700 focus:bg-slate-700 focus:text-white">
                          {c.symbol} {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label className="text-slate-300">Admin Notes (Internal)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this KYC process..."
                  className="bg-slate-800 border-slate-600 text-white [color:white_!important] [-webkit-text-fill-color:white] font-medium min-h-[80px]"
                />
              </div>

              {/* Verification Link Tools (when KYC token exists) */}
              {kycData?.kyc_token && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <Label className="text-slate-300 flex items-center gap-2 mb-3">
                    <Link className="w-4 h-4" />
                    Verification Link
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://msktesla.net/verify-identity?token=${kycData.kyc_token}&withdrawal_id=${withdrawal.id}`;
                        window.open(url, '_blank');
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `https://msktesla.net/verify-identity?token=${kycData.kyc_token}&withdrawal_id=${withdrawal.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Verification link copied!');
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-mono break-all">
                    https://msktesla.net/verify-identity?token={kycData.kyc_token}&withdrawal_id={withdrawal.id}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-4 border-t border-slate-700">
                {/* Send KYC Request */}
                <Button
                  onClick={() => setConfirmAction({
                    type: 'send_kyc',
                    title: 'Send KYC Request?',
                    description: 'This will send a KYC verification email to the user with a new verification link. Any previous links will be invalidated.'
                  })}
                  disabled={loading || !userName.trim() || !bankCountry}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Send KYC Request
                </Button>

                {/* Approve KYC (only if submitted) */}
                {kycData?.status === 'kyc_submitted' && (
                  <Button
                    onClick={() => setConfirmAction({
                      type: 'approve',
                      title: 'Approve KYC?',
                      description: 'This will approve the user\'s identity verification. Make sure you have reviewed their uploaded document.'
                    })}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Approve KYC
                  </Button>
                )}

                {/* Send Settlement Email (only if approved) */}
                {(kycData?.status === 'kyc_approved' || kycData?.status === 'pending_settlement') && (
                  <Button
                    onClick={() => setConfirmAction({
                      type: 'settlement',
                      title: 'Send Settlement Email?',
                      description: 'This will send a settlement/unsettled funds notification email to the user and update status to pending settlement.'
                    })}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Settlement Email
                  </Button>
                )}

                {/* Mark Completed */}
                {kycData?.status === 'pending_settlement' && (
                  <Button
                    onClick={() => setConfirmAction({
                      type: 'complete',
                      title: 'Mark KYC Completed?',
                      description: 'This will mark the entire KYC process as completed. Only do this after settlement has been resolved.'
                    })}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Mark Completed
                  </Button>
                )}

                {/* Reset KYC (only if user has submitted or beyond) */}
                {kycData && USER_SUBMITTED_STATUSES.includes(kycData.status) && (
                  <Button
                    onClick={() => setConfirmAction({
                      type: 'reset',
                      title: 'Reset KYC?',
                      description: 'WARNING: This will clear the user\'s submitted documents and Tax ID, generate a new verification link, and reset status to pending_kyc. Old links will stop working.'
                    })}
                    disabled={loading}
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset KYC
                  </Button>
                )}

                {/* Refresh */}
                <Button
                  variant="outline"
                  onClick={loadKycData}
                  disabled={loadingKyc}
                  className="border-slate-600"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingKyc ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KYCManagementModal;
