import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, Wallet, MoreHorizontal, Sparkles, Star, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatSmartCurrency } from '@/lib/formatCurrency';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
}

interface ActionsPanelProps {
  onInvestClick: () => void;
  onWithdrawClick?: () => void;
  portfolioBalance: number;
  recentTransactions?: Transaction[];
  watchlist?: WatchlistItem[];
}

const ActionsPanel = ({ 
  onInvestClick, 
  onWithdrawClick, 
  portfolioBalance,
  recentTransactions = [],
  watchlist = []
}: ActionsPanelProps) => {
  
  // Default transactions if none provided
  const displayTransactions = recentTransactions.length > 0 ? recentTransactions : [
    { id: '1', type: 'deposit' as const, amount: 500, date: '2 hours ago', status: 'completed' as const },
    { id: '2', type: 'buy' as const, amount: 250, date: 'Yesterday', status: 'completed' as const },
    { id: '3', type: 'withdrawal' as const, amount: 100, date: '3 days ago', status: 'pending' as const },
  ];

  // Default watchlist
  const displayWatchlist = watchlist.length > 0 ? watchlist : [
    { symbol: 'TSLA', price: 248.50, change: 2.5 },
    { symbol: 'RIVN', price: 14.20, change: -1.2 },
    { symbol: 'LCID', price: 2.85, change: 0.8 },
  ];

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-electric-blue" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onInvestClick}
            className="h-12 flex flex-col gap-1 border-electric-blue/30 hover:bg-electric-blue/10 hover:border-electric-blue/50"
          >
            <ArrowDownToLine className="w-4 h-4 text-electric-blue" />
            <span className="text-xs">Invest</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onWithdrawClick}
            disabled={portfolioBalance <= 0}
            className="h-12 flex flex-col gap-1 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 disabled:opacity-50"
          >
            <ArrowUpFromLine className="w-4 h-4 text-green-500" />
            <span className="text-xs">Withdraw</span>
          </Button>
        </div>
      </motion.div>

      {/* Promo Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4"
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-medium text-white/80">Special Offer</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">Tesla Stock Bonus!</h4>
          <p className="text-xs text-white/70 mb-3">Invest $500+ and earn extra 5% bonus returns</p>
          <button className="text-xs font-medium text-white underline underline-offset-2 hover:no-underline">
            See rules →
          </button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Recent Activity
        </h3>
        
        <div className="space-y-2">
          {displayTransactions.slice(0, 3).map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  tx.type === 'deposit' || tx.type === 'buy' ? 'bg-green-500/20' : 'bg-orange-500/20'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'buy' ? (
                    <ArrowDownToLine className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <ArrowUpFromLine className="w-3.5 h-3.5 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground capitalize">{tx.type}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold ${
                tx.type === 'deposit' || tx.type === 'buy' ? 'text-green-500' : 'text-foreground'
              }`}>
                {tx.type === 'deposit' || tx.type === 'buy' ? '+' : '-'}{formatSmartCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Watchlist */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Watchlist
        </h3>
        
        <div className="space-y-2">
          {displayWatchlist.map((stock) => (
            <div 
              key={stock.symbol} 
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-electric-blue/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-electric-blue" />
                </div>
                <span className="text-xs font-semibold text-foreground">{stock.symbol}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">${stock.price.toFixed(2)}</p>
                <p className={`text-[10px] font-medium ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ActionsPanel;
