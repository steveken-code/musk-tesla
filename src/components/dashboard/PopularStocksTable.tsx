import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Radio } from 'lucide-react';
import { useStockPrices } from '@/hooks/useStockPrices';
import { formatAbbreviatedValue, formatVolume, formatPercentage } from '@/lib/formatCurrency';
import { Skeleton } from '@/components/ui/skeleton';

// Stock name mapping
const stockNames: Record<string, string> = {
  TSLA: 'Tesla Inc.',
  RIVN: 'Rivian Automotive',
  SPY: 'S&P 500 ETF',
  LCID: 'Lucid Group',
  TM: 'Toyota Motor',
  GM: 'General Motors',
  F: 'Ford Motor',
  QQQ: 'Nasdaq 100 ETF',
  STLA: 'Stellantis',
};

// Stock colors for mini chart
const stockColors: Record<string, string> = {
  TSLA: '#ef4444',
  RIVN: '#22c55e',
  SPY: '#3b82f6',
  LCID: '#a855f7',
  TM: '#f97316',
  GM: '#06b6d4',
  F: '#0ea5e9',
  QQQ: '#eab308',
  STLA: '#ec4899',
};

type TabType = 'this_week' | 'price' | 'volume';

const tabLabels: Record<TabType, string> = {
  this_week: 'This Week',
  price: 'Price',
  volume: 'Volume'
};

const PopularStocksTable = () => {
  const [activeTab, setActiveTab] = useState<TabType>('this_week');
  const { data, loading } = useStockPrices(30000);
  
  // Filter to show main stocks
  const displayStocks = ['TSLA', 'SPY', 'RIVN', 'LCID', 'TM', 'GM'];
  const stocks = data?.stocks.filter(s => displayStocks.includes(s.symbol)) || [];

  // Sort based on active tab with proper memoization
  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      if (activeTab === 'price') return b.price - a.price;
      if (activeTab === 'volume') return b.volume - a.volume;
      return Math.abs(b.changePercent) - Math.abs(a.changePercent);
    });
  }, [stocks, activeTab]);

  // Generate mini chart bars based on trend direction
  const generateChartBars = (isPositive: boolean, color: string) => {
    const bars = [];
    for (let i = 0; i < 6; i++) {
      // Create trending pattern based on stock direction
      const baseHeight = isPositive ? 6 + (i * 2.5) : 18 - (i * 2);
      const variance = Math.random() * 4 - 2;
      const height = Math.max(4, Math.min(24, baseHeight + variance));
      bars.push({ height, opacity: 0.4 + (i * 0.1) });
    }
    return bars;
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card/60 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Header with Tabs */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-electric-blue" />
            <h3 className="text-base font-semibold text-foreground">Popular Stocks</h3>
            {/* Live indicator */}
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 rounded-full">
              <Radio className="w-2.5 h-2.5 text-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-green-500">LIVE</span>
            </div>
          </div>
          
          {/* Tab Pills with animated indicator */}
          <div className="relative flex bg-muted/50 rounded-lg p-1 gap-1">
            {(['this_week', 'price', 'volume'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-all z-10 ${
                  activeTab === tab
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-card shadow-sm rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tabLabels[tab]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">Market Cap</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Volume</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Chart</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {sortedStocks.map((stock, index) => {
                const isPositive = stock.changePercent >= 0;
                const color = stockColors[stock.symbol] || '#6366f1';
                const chartBars = generateChartBars(isPositive, color);
                
                // Simulated market cap based on price (for display purposes)
                const estimatedMarketCap = stock.price * (stock.symbol === 'SPY' ? 500000000000 : 
                                           stock.symbol === 'TSLA' ? 3170000000 :
                                           stock.symbol === 'TM' ? 13500000000 :
                                           stock.symbol === 'GM' ? 2700000000 :
                                           stock.symbol === 'F' ? 3900000000 :
                                           1500000000);
                
                return (
                  <motion.tr
                    key={stock.symbol}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--muted) / 0.3)' }}
                    className="border-b border-border/20 transition-colors cursor-pointer"
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: color }}
                        >
                          {stock.symbol.slice(0, 2)}
                        </motion.div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {stockNames[stock.symbol] || stock.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Market Cap */}
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <motion.span 
                        key={estimatedMarketCap}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium text-foreground"
                      >
                        {formatAbbreviatedValue(estimatedMarketCap)}
                      </motion.span>
                    </td>
                    
                    {/* Volume */}
                    <td className="py-3 px-4 text-right">
                      <motion.span 
                        key={stock.volume}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-muted-foreground"
                      >
                        {formatVolume(stock.volume)}
                      </motion.span>
                    </td>
                    
                    {/* Mini Chart - Dynamic based on trend */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-end gap-0.5 h-6">
                        {chartBars.map((bar, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="w-1 rounded-full"
                            style={{ 
                              backgroundColor: isPositive ? '#22c55e' : '#ef4444',
                              opacity: bar.opacity
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    
                    {/* Change */}
                    <td className="py-3 px-4 text-right">
                      <motion.span 
                        key={stock.changePercent}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          isPositive ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {formatPercentage(stock.changePercent)}
                      </motion.span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default PopularStocksTable;
