import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface StockData {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  lastUpdated: Date;
}

const LiveStockTicker = () => {
  const [stockData, setStockData] = useState<StockData>({
    price: 248.50,
    change: 12.45,
    changePercent: 5.28,
    high: 252.30,
    low: 241.20,
    volume: '125.4M',
    lastUpdated: new Date(),
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      setStockData(prev => {
        const changeAmount = (Math.random() - 0.45) * 3;
        const newPrice = Math.max(200, Math.min(320, prev.price + changeAmount));
        const newChange = prev.change + changeAmount * 0.5;
        const newChangePercent = (newChange / (newPrice - newChange)) * 100;
        
        return {
          price: Math.round(newPrice * 100) / 100,
          change: Math.round(newChange * 100) / 100,
          changePercent: Math.round(newChangePercent * 100) / 100,
          high: Math.max(prev.high, newPrice),
          low: Math.min(prev.low, newPrice),
          volume: `${(125 + Math.random() * 10).toFixed(1)}M`,
          lastUpdated: new Date(),
        };
      });
      
      setTimeout(() => setIsUpdating(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = stockData.change >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-16 z-40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/50 py-3"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6">
          {/* Stock Symbol & Price */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity className={`w-5 h-5 ${isUpdating ? 'text-tesla-red animate-pulse' : 'text-green-500'}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-white text-lg">TSLA</span>
              <span className="text-slate-500 text-sm hidden sm:inline">NASDAQ</span>
            </div>
            
            <motion.div 
              animate={{ scale: isUpdating ? 1.02 : 1 }}
              className="flex items-center gap-3"
            >
              <span className="text-2xl md:text-3xl font-bold text-white">${stockData.price.toFixed(2)}</span>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold text-sm">
                  {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <div className="hidden lg:flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">High:</span>
              <span className="text-white font-medium">${stockData.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">Low:</span>{' '}
              <span className="text-white font-medium">${stockData.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500">Vol:</span>{' '}
              <span className="text-white font-medium">{stockData.volume}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/30">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Live Market</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveStockTicker;
