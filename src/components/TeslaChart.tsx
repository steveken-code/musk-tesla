import { useEffect, useState, useRef, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity } from 'lucide-react';

interface DataPoint {
  date: string;
  time: string;
  price: number;
  volume: number;
}

// Generate realistic intraday Tesla stock data
const generateIntradayData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  let price = 248 + (Math.random() - 0.5) * 20;
  const baseTime = new Date();
  baseTime.setHours(9, 30, 0, 0); // Market open
  
  for (let i = 0; i < 60; i++) {
    const time = new Date(baseTime);
    time.setMinutes(time.getMinutes() + i * 6.5); // ~6.5 min intervals for trading day
    
    // More realistic price movement with momentum
    const momentum = Math.sin(i / 10) * 0.5;
    const volatility = (Math.random() - 0.48) * 3;
    const change = momentum + volatility;
    price = Math.max(220, Math.min(280, price + change));
    
    data.push({
      date: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 500000 + 100000),
    });
  }
  
  return data;
};

interface TeslaChartProps {
  isTradeActive?: boolean;
}

const TeslaChart = ({ isTradeActive = true }: TeslaChartProps) => {
  const { t } = useLanguage();
  const [data, setData] = useState<DataPoint[]>(generateIntradayData);
  const [currentPrice, setCurrentPrice] = useState(data[data.length - 1]?.price || 248);
  const [previousPrice, setPreviousPrice] = useState(data[0]?.price || 248);
  const [priceChange, setPriceChange] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Smooth price animation
  const animatePrice = useCallback((targetPrice: number, duration: number = 800) => {
    const startPrice = currentPrice;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const animatedPrice = startPrice + (targetPrice - startPrice) * easeOutCubic;
      
      setCurrentPrice(animatedPrice);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [currentPrice]);

  useEffect(() => {
    if (!isTradeActive) return;

    // Fast tick updates for live feel (every 2 seconds)
    const tickInterval = setInterval(() => {
      setIsAnimating(true);
      
      setData(prevData => {
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];
        
        // Realistic micro-movements
        const microChange = (Math.random() - 0.48) * 1.5;
        const trendBias = Math.sin(Date.now() / 10000) * 0.3;
        const newPrice = Math.max(220, Math.min(280, lastPoint.price + microChange + trendBias));
        
        newData[newData.length - 1] = {
          ...lastPoint,
          price: Math.round(newPrice * 100) / 100,
        };
        
        const change = newPrice - previousPrice;
        setPriceChange(change);
        animatePrice(newPrice);
        
        return newData;
      });
      
      setTimeout(() => setIsAnimating(false), 500);
    }, 2000);

    // Add new data points periodically (every 30 seconds)
    const dataInterval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const lastPoint = prevData[prevData.length - 1];
        const now = new Date();
        
        const momentum = Math.sin(Date.now() / 20000) * 0.8;
        const volatility = (Math.random() - 0.45) * 2.5;
        const newPrice = Math.max(220, Math.min(280, lastPoint.price + momentum + volatility));
        
        newData.push({
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Math.round(newPrice * 100) / 100,
          volume: Math.floor(Math.random() * 500000 + 100000),
        });
        
        return newData;
      });
    }, 30000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(dataInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTradeActive, previousPrice, animatePrice]);

  const isPositive = priceChange >= 0;
  const percentChange = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;
  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const avgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6 relative overflow-hidden">
      {/* Live indicator */}
      {isTradeActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-green-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-green-500 font-medium">LIVE</span>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-tesla-red" />
            <h2 className="text-xl font-bold">{t('teslaStock')}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">NASDAQ: TSLA</span>
            <span>•</span>
            <Activity className="w-3 h-3" />
            <span>Real-time</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold font-mono transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
            ${currentPrice.toFixed(2)}
          </p>
          <p className={`text-sm font-medium flex items-center justify-end gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`transition-transform duration-300 ${isAnimating ? (isPositive ? '-translate-y-0.5' : 'translate-y-0.5') : ''}`}>
              {isPositive ? '▲' : '▼'}
            </span>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
          </p>
        </div>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPriceTesla" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0.4}/>
                <stop offset="50%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0.15}/>
                <stop offset="100%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0}/>
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(0, 0%, 20%)" 
              vertical={false}
              opacity={0.5}
            />
            <ReferenceLine 
              y={avgPrice} 
              stroke="hsl(0, 0%, 40%)" 
              strokeDasharray="5 5" 
              strokeWidth={1}
            />
            <XAxis 
              dataKey="time" 
              stroke="hsl(0, 0%, 50%)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: 'hsl(0, 0%, 50%)' }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 50%)" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[minPrice - 2, maxPrice + 2]}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              tick={{ fill: 'hsl(0, 0%, 50%)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 8%)', 
                border: '1px solid hsl(0, 0%, 25%)',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 60%)', marginBottom: '4px', fontSize: '11px' }}
              formatter={(value: number) => [
                <span className="font-mono font-bold text-foreground">${value.toFixed(2)}</span>,
                'TSLA'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorPriceTesla)"
              filter="url(#glow)"
              animationDuration={500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Bottom stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Low: <span className="text-red-400 font-mono">${minPrice.toFixed(2)}</span></span>
          <span>High: <span className="text-green-400 font-mono">${maxPrice.toFixed(2)}</span></span>
        </div>
        <span className="text-muted-foreground/60">Updated every 2s</span>
      </div>
    </div>
  );
};

export default TeslaChart;
