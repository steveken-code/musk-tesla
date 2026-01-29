import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface WelcomeCardProps {
  displayName: string;
  portfolioBalance: number;
  onInvestClick: () => void;
  onWithdrawClick?: () => void;
  greeting: string;
  t: (key: string) => string;
}

const WelcomeCard = ({ 
  displayName, 
  portfolioBalance, 
  onInvestClick, 
  onWithdrawClick,
  greeting,
  t 
}: WelcomeCardProps) => {
  // Format balance with smart decimals
  const formatBalance = (amount: number): string => {
    const hasDecimals = amount % 1 !== 0;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative mb-5 sm:mb-6 overflow-hidden"
    >
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-indigo-900/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-600/40 shadow-2xl shadow-black/20">
        {/* Decorative mesh pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mesh" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1" fill="currentColor" className="text-slate-500/30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mesh)" />
          </svg>
        </div>
        
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-electric-blue/15 rounded-full blur-2xl" />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <p className="text-muted-foreground text-xs sm:text-sm font-medium">{greeting}</p>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {displayName}
              </h1>
            </div>
            
            {/* Pro Badge - shows when balance > 0 */}
            {portfolioBalance > 0 && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30"
              >
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">Active Investor</span>
              </motion.div>
            )}
          </div>
          
          {/* Balance Section */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available Balance
              </p>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight font-mono"
              >
                <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl">$</span>
                {formatBalance(portfolioBalance)}
              </motion.p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 sm:flex-none h-11 sm:h-12 px-5 sm:px-6 text-sm font-semibold border-electric-blue/40 text-electric-blue hover:bg-electric-blue/10 hover:border-electric-blue/60 transition-all group"
                onClick={onInvestClick}
              >
                <ArrowDownToLine className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                Invest
              </Button>
              <Button 
                size="lg" 
                className="flex-1 sm:flex-none h-11 sm:h-12 px-5 sm:px-6 text-sm font-semibold bg-gradient-to-r from-primary to-electric-blue hover:from-primary/90 hover:to-electric-blue/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group"
                onClick={onWithdrawClick}
                disabled={portfolioBalance <= 0}
              >
                <ArrowUpFromLine className="w-4 h-4 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
