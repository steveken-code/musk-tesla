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
  ChevronDown, ArrowUpDown, Download
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'completed': 
      case 'approved': return <CheckCircle className="w-4 h-4 text-electric-blue" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': 
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'on_hold': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'completed':
      case 'approved': return 'text-electric-blue bg-electric-blue/10 border-electric-blue/30';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'cancelled':
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'on_hold': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      default: return 'text-muted-foreground bg-muted/10 border-muted/30';
    }
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <img src={teslaLogo} alt="Tesla" className="h-8 w-auto" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Transaction History</h1>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-tesla-red/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-tesla-red" />
              <span className="text-muted-foreground text-xs">Total Invested</span>
            </div>
            <p className="text-xl font-bold">${totalInvested.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-muted-foreground text-xs">Total Profit</span>
            </div>
            <p className="text-xl font-bold text-green-500">${totalProfit.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-electric-blue/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-electric-blue" />
              <span className="text-muted-foreground text-xs">Withdrawn</span>
            </div>
            <p className="text-xl font-bold text-electric-blue">${totalWithdrawn.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-yellow-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground text-xs">Pending</span>
            </div>
            <p className="text-xl font-bold text-yellow-500">${pendingWithdrawals.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Filters</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-muted-foreground"
            >
              {showFilters ? 'Hide Filters' : 'Show All Filters'}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
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
                className="pl-10 bg-background/50"
              />
            </div>

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType)}>
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="investments">Investments</SelectItem>
                <SelectItem value="withdrawals">Withdrawals</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[150px] bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="w-[150px] bg-background/50">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Amount</SelectItem>
                <SelectItem value="lowest">Lowest Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-10 w-[180px] bg-background/50"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-10 w-[180px] bg-background/50"
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
            Showing {filteredTransactions.length} of {allTransactions.length} transactions
          </p>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-4 hover:border-tesla-red/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      transaction.type === 'investment' 
                        ? 'bg-tesla-red/10' 
                        : 'bg-green-500/10'
                    }`}>
                      {transaction.type === 'investment' ? (
                        <TrendingUp className={`w-5 h-5 ${
                          transaction.type === 'investment' ? 'text-tesla-red' : 'text-green-500'
                        }`} />
                      ) : (
                        <Wallet className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{transaction.type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {transaction.type === 'withdrawal' && 'country' in transaction && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {transaction.country} • {(transaction as any).payment_details?.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {transaction.type === 'withdrawal' ? '-' : ''}${transaction.displayAmount.toLocaleString()}
                      </p>
                      {transaction.type === 'investment' && transaction.profit > 0 && (
                        <p className="text-sm text-green-500">
                          +${transaction.profit.toLocaleString()} profit
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hold message for withdrawals */}
                {transaction.type === 'withdrawal' && 'hold_message' in transaction && transaction.hold_message && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-500">
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