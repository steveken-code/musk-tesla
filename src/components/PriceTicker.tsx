import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockPrices, StockQuote } from '@/hooks/useStockPrices';

// Fallback data when API is loading or unavailable
const fallbackPrices: StockQuote[] = [
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 421.83, change: 12.47, changePercent: 3.05, volume: 0, high: 425, low: 408, open: 410, previousClose: 409.36 },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 594.25, change: 2.15, changePercent: 0.36, volume: 0, high: 595, low: 591, open: 592, previousClose: 592.10 },
  { symbol: 'QQQ', name: 'NASDAQ-100', price: 518.42, change: 4.28, changePercent: 0.83, volume: 0, high: 520, low: 514, open: 515, previousClose: 514.14 },
  { symbol: 'RIVN', name: 'Rivian', price: 14.85, change: -0.32, changePercent: -2.11, volume: 0, high: 15.2, low: 14.6, open: 15.1, previousClose: 15.17 },
  { symbol: 'LCID', name: 'Lucid', price: 2.45, change: 0.08, changePercent: 3.38, volume: 0, high: 2.5, low: 2.35, open: 2.38, previousClose: 2.37 },
  { symbol: 'TM', name: 'Toyota Motor', price: 176.42, change: 1.28, changePercent: 0.73, volume: 0, high: 178, low: 174, open: 175, previousClose: 175.14 },
  { symbol: 'STLA', name: 'Stellantis', price: 12.85, change: -0.18, changePercent: -1.38, volume: 0, high: 13.1, low: 12.6, open: 13.0, previousClose: 13.03 },
  { symbol: 'F', name: 'Ford', price: 9.85, change: 0.12, changePercent: 1.23, volume: 0, high: 9.95, low: 9.7, open: 9.75, previousClose: 9.73 },
  { symbol: 'GM', name: 'General Motors', price: 54.32, change: 0.87, changePercent: 1.63, volume: 0, high: 54.8, low: 53.5, open: 53.6, previousClose: 53.45 },
];

const PriceTicker = () => {
  const { data, loading, error } = useStockPrices(15000);
  const [displayPrices, setDisplayPrices] = useState<StockQuote[]>(fallbackPrices);

  // Update display prices when real data arrives
  useEffect(() => {
    if (data?.stocks && data.stocks.length > 0) {
      setDisplayPrices(data.stocks);
    }
  }, [data]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };

  const TickerItemComponent = ({ item }: { item: StockQuote }) => {
    const isPositive = item.change >= 0;
    
    return (
      <div className="flex items-center gap-2 px-4 py-1 whitespace-nowrap">
        <span className="font-bold text-foreground">{item.symbol}</span>
        <motion.span 
          key={item.price}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          ${formatPrice(item.price)}
        </motion.span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
        </span>
        <span className="text-border mx-2">|</span>
      </div>
    );
  };

  // Double the items for seamless loop
  const tickerItems = [...displayPrices, ...displayPrices];

  return (
    <div className="w-full bg-card border-b border-border overflow-hidden">
      <div className="relative flex">
        <motion.div
          className="flex"
          animate={{
            x: [0, -50 * displayPrices.length * 8],
          }}
          transition={{
            x: {
              duration: 60,
              repeat: Infinity,
              ease: "linear",
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
