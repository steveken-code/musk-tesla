import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, TrendingUp, DollarSign, Clock, 
  CheckCircle, XCircle, Loader2, Filter,
  Wallet, AlertCircle, Calendar, Search,
  ChevronDown, ArrowUpDown, Download,
  CheckCircle2, BadgeCheck, ArrowDownRight,
  ArrowUpRight, Sparkles, Activity
} from 'lucide-react';
import teslaLogo from '@/assets/tesla-logo-red.png';

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

type TransactionType = 'all' | 'investments' | 'withdrawals';
type StatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'cancelled' | 'on_hold' | 'approved' | 'rejected';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

const TransactionHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [investmentsRes, withdrawalsRes] = await Promise.all([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
      ]);

      if (investmentsRes.data) setInvestments(investmentsRes.data);
      if (withdrawalsRes.data) setWithdrawals(withdrawalsRes.data as Withdrawal[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, type: string) => {
    // For completed/approved withdrawals, show success checkmark
    if (type === 'withdrawal' && (status === 'completed' || status === 'approved')) {
      return <BadgeCheck className="w-5 h-5 text-emerald-400" />;
    }
    
    switch (status) {
      case 'active': return <Activity className="w-4 h-4 text-green-400" />;
      case 'completed': 
      case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'cancelled': 
      case 'rejected': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active': 
        return 'text-green-400 bg-green-500/10 border-green-500/30 shadow-green-500/20';
      case 'completed':
      case 'approved': 
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20';
      case 'pending': 
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/20';
      case 'cancelled':
      case 'rejected': 
        return 'text-red-400 bg-red-500/10 border-red-500/30 shadow-red-500/20';
      case 'on_hold': 
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-orange-500/20';
      default: 
        return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
  };

  const getCardGradient = (type: string, status: string) => {
    if (type === 'withdrawal' && (status === 'completed' || status === 'approved')) {
      return 'bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 border-emerald-500/20 hover:border-emerald-500/40';
    }
    if (type === 'investment') {
      return 'bg-gradient-to-br from-tesla-red/5 via-transparent to-red-500/5 border-tesla-red/20 hover:border-tesla-red/40';
    }
    return 'bg-gradient-to-br from-slate-500/5 via-transparent to-gray-500/5 border-border hover:border-border/60';
  };

  // Combine and filter transactions
  const allTransactions = [
    ...investments.map(inv => ({
      ...inv,
      type: 'investment' as const,
      displayAmount: inv.amount,
      profit: inv.profit_amount
    })),
    ...withdrawals.map(w => ({
      ...w,
      type: 'withdrawal' as const,
      displayAmount: w.amount,
      profit: 0
    }))
  ];

  const filteredTransactions = allTransactions
    .filter(t => {
      // Type filter
      if (typeFilter === 'investments' && t.type !== 'investment') return false;
      if (typeFilter === 'withdrawals' && t.type !== 'withdrawal') return false;
      
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (t.type === 'withdrawal') {
          const withdrawal = t as typeof t & { country?: string; payment_details?: string };
          if (!withdrawal.country?.toLowerCase().includes(query) && 
              !withdrawal.payment_details?.toLowerCase().includes(query) &&
              !t.id.toLowerCase().includes(query)) {
            return false;
          }
        } else {
          if (!t.id.toLowerCase().includes(query)) return false;
        }
      }
      
      // Date filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (new Date(t.created_at) < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        if (new Date(t.created_at) > toDate) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest': return b.displayAmount - a.displayAmount;
        case 'lowest': return a.displayAmount - b.displayAmount;
        default: return 0;
      }
    });

  const totalInvested = investments
    .filter(i => i.status === 'active' || i.status === 'completed')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalProfit = investments.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'approved' || w.status === 'completed')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending' || w.status === 'on_hold')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  // Count successful withdrawals
  const successfulWithdrawalsCount = withdrawals.filter(
    w => w.status === 'approved' || w.status === 'completed'
  ).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-tesla-red" />
          <p className="text-muted-foreground animate-pulse">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Modern gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-tesla-red/3 via-transparent to-emerald-500/3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-tesla-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <img src={teslaLogo} alt="Tesla" className="h-10 md:h-12 w-auto brightness-150 drop-shadow-lg" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">{successfulWithdrawalsCount} Successful</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">{t('viewTransactionHistory') || 'Transaction History'}</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        {/* Summary Cards - Modern Glass Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {/* Total Invested */}
          <div className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-tesla-red/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-tesla-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-tesla-red/10 border border-tesla-red/20">
                  <DollarSign className="w-4 h-4 text-tesla-red" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">{t('totalInvested')}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">${totalInvested.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-tesla-red" />
                <span className="text-xs text-muted-foreground">{investments.length} investments</span>
              </div>
            </div>
          </div>
          
          {/* Total Profit */}
          <div className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-green-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">{t('totalProfit')}</span>
              </div>
              <p className="text-2xl font-bold text-green-500 tracking-tight">${totalProfit.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500/70">+{((totalProfit / Math.max(totalInvested, 1)) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          {/* Withdrawn */}
          <div className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-emerald-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">{t('withdrawn') || 'Withdrawn'}</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">${totalWithdrawn.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-400/70">{successfulWithdrawalsCount} successful</span>
              </div>
            </div>
          </div>
          
          {/* Pending */}
          <div className="group relative overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-amber-500/40 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-muted-foreground text-xs font-medium">{t('pending')}</span>
              </div>
              <p className="text-2xl font-bold text-amber-400 tracking-tight">${pendingWithdrawals.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400/70">Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters Section */}
        <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted/30">
                <Filter className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <span className="font-semibold text-foreground">Filters</span>
                <p className="text-xs text-muted-foreground">Refine your transaction view</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showFilters ? 'Hide Advanced' : 'Advanced Filters'}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 focus:border-tesla-red/50 rounded-xl"
              />
            </div>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType)}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
                <SelectItem value="withdrawals">Withdrawals</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border/50 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
              <SelectTrigger className="w-[150px] bg-background/50 border-border/50 rounded-xl">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-xl">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground font-medium">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10 w-[180px] bg-background/50 border-border/50 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground font-medium">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10 w-[180px] bg-background/50 border-border/50 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setSortOrder('newest');
                    setSearchQuery('');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="rounded-xl border-border/50"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filteredTransactions.length}</span> of {allTransactions.length} transactions
          </p>
        </div>

        {/* Transactions List - Modern Cards */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-4 md:p-5 transition-all duration-300 ${getCardGradient(transaction.type, transaction.status)}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Success glow for completed withdrawals */}
                {transaction.type === 'withdrawal' && (transaction.status === 'completed' || transaction.status === 'approved') && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                )}
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Icon with type indicator */}
                    <div className={`relative p-3 rounded-2xl ${
                      transaction.type === 'investment' 
                        ? 'bg-gradient-to-br from-tesla-red/20 to-red-500/10 border border-tesla-red/30' 
                        : transaction.status === 'completed' || transaction.status === 'approved'
                          ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30'
                          : 'bg-gradient-to-br from-slate-500/20 to-gray-500/10 border border-slate-500/30'
                    }`}>
                      {transaction.type === 'investment' ? (
                        <TrendingUp className="w-5 h-5 text-tesla-red" />
                      ) : transaction.status === 'completed' || transaction.status === 'approved' ? (
                        <BadgeCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Wallet className="w-5 h-5 text-slate-400" />
                      )}
                      
                      {/* Success checkmark overlay for completed withdrawals */}
                      {transaction.type === 'withdrawal' && (transaction.status === 'completed' || transaction.status === 'approved') && (
                        <div className="absolute -top-1 -right-1 p-0.5 bg-emerald-500 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold capitalize text-foreground">
                          {transaction.type === 'investment' ? 'Investment' : 'Withdrawal'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border shadow-sm ${getStatusStyles(transaction.status)}`}>
                          {getStatusIcon(transaction.status, transaction.type)}
                          <span className="capitalize">{transaction.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.type === 'withdrawal' && 'country' in transaction && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                          {transaction.country} • {(transaction as any).payment_details?.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {transaction.type === 'withdrawal' ? (
                          <ArrowDownRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-tesla-red" />
                        )}
                        <p className={`text-xl font-bold tracking-tight ${
                          transaction.type === 'withdrawal' && (transaction.status === 'completed' || transaction.status === 'approved')
                            ? 'text-emerald-400'
                            : ''
                        }`}>
                          {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.displayAmount.toLocaleString()}
                        </p>
                      </div>
                      {transaction.type === 'investment' && transaction.profit > 0 && (
                        <p className="text-sm text-green-500 flex items-center justify-end gap-1 mt-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +${transaction.profit.toLocaleString()} profit
                        </p>
                      )}
                      {transaction.type === 'withdrawal' && (transaction.status === 'completed' || transaction.status === 'approved') && (
                        <p className="text-xs text-emerald-400 flex items-center justify-end gap-1 mt-0.5">
                          <BadgeCheck className="w-3 h-3" />
                          Successfully transferred
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hold message for withdrawals - only show if NOT completed */}
                {transaction.type === 'withdrawal' && 
                 'hold_message' in transaction && 
                 transaction.hold_message && 
                 transaction.status !== 'completed' && 
                 transaction.status !== 'approved' && (
                  <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Hold Notice</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{transaction.hold_message}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionHistory;
