import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStockPrices } from '@/hooks/useStockPrices';
import { formatAbbreviatedValue, formatPercentage } from '@/lib/formatCurrency';
import { Skeleton } from '@/components/ui/skeleton';

// Stock icons/colors mapping
const stockConfig: Record<string, { color: string; bgColor: string }> = {
  TSLA: { color: 'text-red-500', bgColor: 'bg-red-500/20' },
  RIVN: { color: 'text-green-500', bgColor: 'bg-green-500/20' },
  SPY: { color: 'text-blue-500', bgColor: 'bg-blue-500/20' },
  LCID: { color: 'text-purple-500', bgColor: 'bg-purple-500/20' },
  TM: { color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
};

const InvestmentPortfolio = () => {
  const { data, loading } = useStockPrices(30000);
  
  // Filter to show only our main stocks
  const displayStocks = ['TSLA', 'RIVN', 'SPY', 'LCID'];
  const stocks = data?.stocks.filter(s => displayStocks.includes(s.symbol)) || [];

  if (loading && stocks.length === 0) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card/60 rounded-xl p-4 border border-border/50">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-6 w-24 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stocks.map((stock, index) => {
        const config = stockConfig[stock.symbol] || { color: 'text-electric-blue', bgColor: 'bg-electric-blue/20' };
        const isPositive = stock.changePercent >= 0;
        
        return (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-card/60 backdrop-blur-sm rounded-xl p-4 border border-border/50 hover:border-border transition-all group"
          >
            {/* Stock Symbol Badge */}
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${config.bgColor} mb-3`}>
              <span className={`text-xs font-bold ${config.color}`}>{stock.symbol}</span>
            </div>
            
            {/* Price */}
            <p className="text-xl sm:text-2xl font-bold text-foreground mb-1 tracking-tight">
              {formatAbbreviatedValue(stock.price)}
            </p>
            
            {/* Change Percentage */}
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="text-sm font-semibold">
                {formatPercentage(stock.changePercent)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default InvestmentPortfolio;
