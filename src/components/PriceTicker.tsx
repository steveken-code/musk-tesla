import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockPrices, StockQuote } from '@/hooks/useStockPrices';

// Fallback prices for when API is loading or errors
const fallbackPrices: StockQuote[] = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 421.83, change: 12.45, changePercent: 3.04, volume: 0, high: 425.0, low: 410.0, open: 412.0, previousClose: 409.38 },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 598.42, change: 2.15, changePercent: 0.36, volume: 0, high: 600.0, low: 595.0, open: 596.0, previousClose: 596.27 },
  { symbol: 'QQQ', name: 'NASDAQ-100 ETF', price: 525.18, change: -1.23, changePercent: -0.23, volume: 0, high: 528.0, low: 522.0, open: 526.0, previousClose: 526.41 },
  { symbol: 'RIVN', name: 'Rivian', price: 12.47, change: 0.34, changePercent: 2.80, volume: 0, high: 12.8, low: 12.1, open: 12.2, previousClose: 12.13 },
  { symbol: 'LCID', name: 'Lucid Motors', price: 2.15, change: -0.05, changePercent: -2.27, volume: 0, high: 2.25, low: 2.10, open: 2.20, previousClose: 2.20 },
  { symbol: 'TM', name: 'Toyota Motor', price: 176.42, change: 1.28, changePercent: 0.73, volume: 0, high: 178.0, low: 174.5, open: 175.0, previousClose: 175.14 },
  { symbol: 'STLA', name: 'Stellantis', price: 12.85, change: -0.32, changePercent: -2.43, volume: 0, high: 13.2, low: 12.7, open: 13.1, previousClose: 13.17 },
  { symbol: 'F', name: 'Ford', price: 9.87, change: 0.12, changePercent: 1.23, volume: 0, high: 10.0, low: 9.75, open: 9.80, previousClose: 9.75 },
  { symbol: 'GM', name: 'General Motors', price: 48.25, change: -0.45, changePercent: -0.92, volume: 0, high: 49.0, low: 48.0, open: 48.5, previousClose: 48.70 },
];

const PriceTicker = () => {
  const { data, loading, error } = useStockPrices(30000); // Poll every 30 seconds
  const [displayPrices, setDisplayPrices] = useState<StockQuote[]>(fallbackPrices);

  useEffect(() => {
    if (data?.stocks && data.stocks.length > 0) {
      setDisplayPrices(data.stocks);
    }
  }, [data]);

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  };

  const TickerItemComponent = ({ item }: { item: StockQuote }) => {
    const isPositive = item.changePercent >= 0;
    return (
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1">
        <span className="font-bold text-xs sm:text-sm text-foreground whitespace-nowrap">{item.symbol}</span>
        <span className="text-xs sm:text-sm text-foreground font-medium whitespace-nowrap">${formatPrice(item.price)}</span>
        <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium whitespace-nowrap ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
        </span>
      </div>
    );
  };

  // Duplicate the items for seamless loop
  const tickerItems = [...displayPrices, ...displayPrices];

  return (
    <div className="w-full bg-card/80 border-y border-border/50 overflow-hidden">
      <div className="relative h-8 sm:h-9">
        {/* Loading indicator */}
        {loading && !data && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />
            <span className="text-xs text-muted-foreground">Loading market data...</span>
          </div>
        )}
        
        {/* Error indicator - still show ticker with fallback data */}
        {error && !data && (
          <div className="absolute top-0 right-0 p-1 z-10">
            <AlertCircle className="w-3 h-3 text-amber-500" />
          </div>
        )}

        <motion.div
          className="flex absolute whitespace-nowrap"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {tickerItems.map((item, index) => (
            <TickerItemComponent key={`${item.symbol}-${index}`} item={item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PriceTicker;
