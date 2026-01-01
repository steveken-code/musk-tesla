import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
    // Simulate real-time updates every 3 seconds
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
    <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-y border-slate-700/50 py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-6 text-sm">
          {/* Stock Symbol & Price */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isUpdating ? 'text-tesla-red animate-pulse' : 'text-green-500'}`} />
              <span className="font-bold text-white">TSLA</span>
              <span className="text-slate-500">NASDAQ</span>
            </div>
            
            <div className={`flex items-center gap-2 transition-all duration-300 ${isUpdating ? 'scale-105' : ''}`}>
              <span className="text-xl font-bold text-white">${stockData.price.toFixed(2)}</span>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Additional Stats - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6 text-slate-400">
            <div>
              <span className="text-slate-500">High:</span>{' '}
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
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStockTicker;
