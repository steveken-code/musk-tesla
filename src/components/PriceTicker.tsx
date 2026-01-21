import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Generate realistic price with small fluctuations
const generatePrice = (basePrice: number, volatility: number = 0.002): number => {
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
  return basePrice + change;
};

const initialPrices: TickerItem[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 98234.50, change: 2341.25, changePercent: 2.44 },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -28.45, changePercent: -0.82 },
  { symbol: 'TSLA', name: 'Tesla', price: 248.75, change: 3.12, changePercent: 1.27 },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change: 0.00, changePercent: 0.00 },
  { symbol: 'BNB', name: 'BNB', price: 612.30, change: 8.45, changePercent: 1.40 },
  { symbol: 'SOL', name: 'Solana', price: 187.42, change: -2.18, changePercent: -1.15 },
  { symbol: 'XRP', name: 'Ripple', price: 2.34, change: 0.08, changePercent: 3.54 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.3245, change: 0.0123, changePercent: 3.94 },
];

const PriceTicker = () => {
  const [prices, setPrices] = useState<TickerItem[]>(initialPrices);

  // Update prices periodically for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => {
        if (item.symbol === 'USDT') return item; // USDT stays stable
        
        const newPrice = generatePrice(item.price, 0.001);
        const priceChange = newPrice - (item.price - item.change);
        const percentChange = (priceChange / (item.price - item.change)) * 100;
        
        return {
          ...item,
          price: newPrice,
          change: priceChange,
          changePercent: percentChange,
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      return price.toFixed(2);
    } else {
      return price.toFixed(4);
    }
  };

  const TickerItemComponent = ({ item }: { item: TickerItem }) => {
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
  const tickerItems = [...prices, ...prices];

  return (
    <div className="w-full bg-card border-b border-border overflow-hidden">
      <div className="relative flex">
        <motion.div
          className="flex"
          animate={{
            x: [0, -50 * prices.length * 8],
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
