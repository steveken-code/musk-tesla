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
      className="mb-5 sm:mb-6 md:mb-8"
    >
      {/* Greeting */}
      <div className="mb-3 sm:mb-4">
        <p className="text-muted-foreground text-xs sm:text-sm">{greeting},</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">
          {displayName}
        </h1>
      </div>

      {/* Balance Card - Clean purple gradient like reference */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full blur-lg" />
        
        <div className="relative z-10">
          {/* Current Value Label */}
          <p className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-1.5">Current value</p>
          
          {/* Balance Row */}
          <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
            <div className="flex items-baseline gap-1.5 sm:gap-2 md:gap-3 flex-wrap min-w-0">
              {/* Main Balance */}
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight truncate"
              >
                {formatSmartCurrency(portfolioBalance)}
              </motion.span>
              
              {/* Currency Badge */}
              <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 md:px-2 py-0.5 bg-white/20 rounded-md sm:rounded-lg shrink-0">
                <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-white">USD</span>
                <ChevronDown className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white/70" />
              </div>
            </div>
            
            {/* Weekly Change */}
            {portfolioBalance > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-left md:text-right shrink-0"
              >
                <p className="text-sm sm:text-base md:text-lg font-semibold text-green-300">
                  +{weeklyChangeFormatted}
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-white/60">this week</p>
              </motion.div>
            )}
          </div>
          
          {/* Action Buttons - Refined sizing with max-width constraints */}
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 items-center xs:justify-center w-full max-w-sm xs:max-w-none mx-auto">
            <Button 
              size="lg" 
              className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white/20 hover:bg-white/30 hover:scale-[1.02] text-white border-0 backdrop-blur-sm font-semibold transition-all duration-300 text-sm sm:text-base rounded-lg shadow-lg"
              onClick={onInvestClick}
            >
              <ArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>Invest</span>
            </Button>
            <Button 
              size="lg" 
              className="h-11 sm:h-12 px-6 sm:px-8 w-full xs:w-auto xs:min-w-[160px] bg-white text-purple-700 hover:bg-white/95 hover:scale-[1.02] border-0 font-semibold shadow-xl transition-all duration-300 text-sm sm:text-base rounded-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              onClick={onWithdrawClick}
              disabled={portfolioBalance <= 0}
            >
              <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span>Withdraw</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeCard;