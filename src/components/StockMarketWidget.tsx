import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Clock, BarChart3, Wifi, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useStockPrice } from '@/hooks/useStockPrices';
import { Skeleton } from '@/components/ui/skeleton';

interface StockMarketWidgetProps {
  className?: string;
}

// Fallback TSLA data when no data available at all
const fallbackStock = {
  symbol: 'TSLA',
  name: 'Tesla, Inc.',
  price: 421.83,
  change: 12.45,
  changePercent: 3.04,
  volume: 0,
  high: 425.0,
  low: 410.0,
  open: 412.0,
  previousClose: 409.38,
};

const StockMarketWidget = ({ className = '' }: StockMarketWidgetProps) => {
  const { stock, marketStatus, lastUpdated, loading, error } = useStockPrice('TSLA', 30000);

  // Use real stock data if available, otherwise use fallback
  const displayStock = stock || fallbackStock;
  const isUsingFallback = !stock;
  const isLive = !error && stock !== null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getMarketStatusConfig = () => {
    switch (marketStatus) {
      case 'regular':
        return { label: 'Market Open', color: 'text-green-500', bg: 'bg-green-500/20', pulse: true };
      case 'pre-market':
        return { label: 'Pre-Market', color: 'text-yellow-500', bg: 'bg-yellow-500/20', pulse: true };
      case 'after-hours':
        return { label: 'After Hours', color: 'text-orange-500', bg: 'bg-orange-500/20', pulse: true };
      default:
        return { label: 'Market Closed', color: 'text-muted-foreground', bg: 'bg-muted', pulse: false };
    }
  };

  const marketConfig = getMarketStatusConfig();
  const isPositive = displayStock.change >= 0;

  // 52-week range for TSLA (approximate values)
  const week52Low = 138.80;
  const week52High = 488.54;
  const currentPrice = displayStock.price;
  const rangePosition = ((currentPrice - week52Low) / (week52High - week52Low)) * 100;

  // Generate sparkline data
  const generateSparkline = () => {
    const basePrice = displayStock.previousClose || 400;
    const points: number[] = [];
    let price = basePrice;
    
    for (let i = 0; i < 20; i++) {
      price = price + (Math.random() - 0.48) * 5;
      points.push(price);
    }
    
    points[points.length - 1] = displayStock.price;
    
    return points;
  };

  const sparklineData = generateSparkline();
  const sparklineMin = Math.min(...sparklineData);
  const sparklineMax = Math.max(...sparklineData);
  const sparklineRange = sparklineMax - sparklineMin;

  const sparklinePath = sparklineData.map((price, i) => {
    const x = (i / (sparklineData.length - 1)) * 100;
    const y = 100 - ((price - sparklineMin) / sparklineRange) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  if (loading && !stock) {
    return (
      <Card className={`p-6 bg-card border-border ${className}`}>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden bg-card border-border ${className}`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">T</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">TSLA</h3>
              <p className="text-xs text-muted-foreground">Tesla, Inc. • NASDAQ</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Live/Cached Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isLive 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-yellow-500/20 text-yellow-500'
            }`}>
              {isLive ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span>Cached</span>
                </>
              )}
            </div>
            
            {/* Market Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${marketConfig.bg}`}>
              {marketConfig.pulse && (
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marketConfig.color.replace('text-', 'bg-')}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${marketConfig.color.replace('text-', 'bg-')}`}></span>
                </span>
              )}
              <span className={`text-xs font-medium ${marketConfig.color}`}>
                {marketConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="px-6 py-4">
        <div className="flex items-end justify-between mb-4">
          <div>
            <motion.p 
              key={displayStock.price}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-bold text-foreground"
            >
              ${formatPrice(displayStock.price)}
            </motion.p>
            <div className={`flex items-center gap-1 mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}${formatPrice(displayStock.change)}
              </span>
              <span className="text-sm">
                ({isPositive ? '+' : ''}{displayStock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          <div className="text-right text-xs text-muted-foreground">
            <Clock className="w-3 h-3 inline mr-1" />
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '--:--'}
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="h-16 mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Fill area */}
            <path
              d={`${sparklinePath} L 100 100 L 0 100 Z`}
              fill="url(#sparklineGradient)"
            />
            
            {/* Line */}
            <path
              d={sparklinePath}
              fill="none"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Open</p>
            <p className="font-semibold text-foreground">${formatPrice(displayStock.open)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Previous Close</p>
            <p className="font-semibold text-foreground">${formatPrice(displayStock.previousClose)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Day High</p>
            <p className="font-semibold text-green-500">${formatPrice(displayStock.high)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs mb-1">Day Low</p>
            <p className="font-semibold text-red-500">${formatPrice(displayStock.low)}</p>
          </div>
        </div>

        {/* 52-Week Range */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>52-Week Range</span>
            <BarChart3 className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground">${week52Low.toFixed(2)}</span>
            <div className="flex-1 h-2 bg-muted rounded-full relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.max(rangePosition, 0), 100)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
              />
              <motion.div
                initial={{ left: 0 }}
                animate={{ left: `${Math.min(Math.max(rangePosition, 0), 100)}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-lg"
              />
            </div>
            <span className="text-xs font-medium text-foreground">${week52High.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StockMarketWidget;
