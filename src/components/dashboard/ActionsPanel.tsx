import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowUpFromLine, Wallet, Sparkles, Star, TrendingUp, DollarSign, Percent, Clock, Users, Headphones, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatSmartCurrency } from '@/lib/formatCurrency';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
}

interface ActionsPanelProps {
  onInvestClick: () => void;
  onWithdrawClick?: () => void;
  portfolioBalance: number;
  watchlist?: WatchlistItem[];
}

// Investment platform rules
const investmentRules = [
  { icon: DollarSign, title: 'Minimum Investment', description: '$100 minimum to start investing' },
  { icon: Percent, title: 'Weekly Returns', description: '7.5% weekly returns on your investment' },
  { icon: Sparkles, title: 'Bonus Tier', description: 'Invest $500+ and earn an extra 5% bonus' },
  { icon: Clock, title: 'Withdrawal Processing', description: 'Withdrawals processed within 24-48 hours' },
  { icon: Users, title: 'One Active Investment', description: 'One active investment at a time per account' },
  { icon: Headphones, title: '24/7 Support', description: 'Contact us anytime via WhatsApp or Telegram' },
];

const ActionsPanel = ({ 
  onInvestClick, 
  onWithdrawClick, 
  portfolioBalance,
  watchlist = []
}: ActionsPanelProps) => {
  const [showRules, setShowRules] = useState(false);

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
          <button 
            onClick={() => setShowRules(true)}
            className="text-xs font-medium text-white underline underline-offset-2 hover:no-underline transition-all"
          >
            See rules →
          </button>
        </div>
      </motion.div>

      {/* Investment Rules Modal - Scrollable & Responsive */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-hidden flex flex-col p-0 bg-card border-border">
          {/* Fixed Header */}
          <DialogHeader className="p-4 sm:p-6 pb-2 shrink-0 border-b border-border/30">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-electric-blue/10">
                <CheckCircle className="w-5 h-5 text-electric-blue" />
              </div>
              Investment Rules
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Follow these guidelines for a successful investment experience.
            </DialogDescription>
          </DialogHeader>
          
          {/* Scrollable Content with explicit overflow and touch support */}
          <div 
            className="flex-1 overflow-y-auto px-4 sm:px-6 overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="space-y-3 py-4">
              {investmentRules.map((rule, index) => (
                <motion.div
                  key={rule.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/30 min-h-[52px]"
                >
                  <div className="p-1.5 sm:p-2 rounded-md bg-electric-blue/10 shrink-0">
                    <rule.icon className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{rule.title}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Fixed Footer */}
          <div className="p-4 sm:p-6 pt-4 border-t border-border/50 shrink-0">
            <Button 
              onClick={() => {
                setShowRules(false);
                onInvestClick();
              }}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-electric-blue to-electric-blue/80 hover:from-electric-blue/90 hover:to-electric-blue/70 text-sm sm:text-base"
            >
              Start Investing Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
