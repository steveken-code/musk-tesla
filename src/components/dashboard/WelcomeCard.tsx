import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, ArrowUpFromLine, ChevronDown } from 'lucide-react';
import { formatSmartCurrency } from '@/lib/formatCurrency';

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
  // Calculate a mock weekly change (for display purposes)
  const weeklyChange = portfolioBalance > 0 ? portfolioBalance * 0.075 : 0;
  const weeklyChangeFormatted = formatSmartCurrency(weeklyChange);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-6"
    >
      {/* Greeting */}
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {displayName}
        </h1>
      </div>

      {/* Balance Card - Clean purple gradient like reference */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-4 sm:p-5 md:p-6 shadow-xl">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-lg" />
        
        <div className="relative z-10">
          {/* Current Value Label */}
          <p className="text-white/70 text-xs sm:text-sm mb-1">Current value</p>
          
          {/* Balance Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              {/* Main Balance */}
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight"
              >
                {formatSmartCurrency(portfolioBalance)}
              </motion.span>
              
              {/* Currency Badge */}
              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/20 rounded-lg">
                <span className="text-[10px] sm:text-xs font-medium text-white">USD</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/70" />
              </div>
            </div>
            
            {/* Weekly Change */}
            {portfolioBalance > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-left sm:text-right"
              >
                <p className="text-base sm:text-lg font-semibold text-green-300">
                  +{weeklyChangeFormatted}
                </p>
                <p className="text-[10px] sm:text-xs text-white/60">this week</p>
              </motion.div>
            )}
          </div>
          
          {/* Action Buttons - Stack on very small screens */}
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button 
              size="lg" 
              className="flex-1 h-10 sm:h-11 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm font-semibold transition-all text-sm sm:text-base min-w-0"
              onClick={onInvestClick}
            >
              <ArrowDownToLine className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate">Invest</span>
            </Button>
            <Button 
              size="lg" 
              className="flex-1 h-10 sm:h-11 bg-white text-purple-700 hover:bg-white/90 border-0 font-semibold shadow-lg transition-all text-sm sm:text-base min-w-0"
              onClick={onWithdrawClick}
              disabled={portfolioBalance <= 0}
            >
              <ArrowUpFromLine className="w-4 h-4 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate">Withdraw</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;
