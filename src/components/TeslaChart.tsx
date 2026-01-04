import { useEffect, useState, useRef, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, Bar, ComposedChart } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart3, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataPoint {
  date: string;
  time: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type TimeRange = 'intraday' | '30d';
type ChartType = 'area' | 'candlestick';

// Generate realistic intraday Tesla stock data
const generateIntradayData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  let price = 248 + (Math.random() - 0.5) * 20;
  const baseTime = new Date();
  baseTime.setHours(9, 30, 0, 0);
  
  for (let i = 0; i < 60; i++) {
    const time = new Date(baseTime);
    time.setMinutes(time.getMinutes() + i * 6.5);
    
    const momentum = Math.sin(i / 10) * 0.5;
    const volatility = (Math.random() - 0.48) * 3;
    const change = momentum + volatility;
    const open = price;
    price = Math.max(220, Math.min(280, price + change));
    const close = price;
    const high = Math.max(open, close) + Math.random() * 1.5;
    const low = Math.min(open, close) - Math.random() * 1.5;
    
    data.push({
      date: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(close * 100) / 100,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 500000 + 100000),
    });
  }
  
  return data;
};

// Generate 30-day historical data
const generate30DayData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  let price = 240 + (Math.random() - 0.5) * 30;
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const trendBias = Math.sin((30 - i) / 8) * 2;
    const volatility = (Math.random() - 0.45) * 8;
    const change = trendBias + volatility;
    const open = price;
    price = Math.max(200, Math.min(300, price + change));
    const close = price;
    const high = Math.max(open, close) + Math.random() * 4;
    const low = Math.min(open, close) - Math.random() * 4;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleDateString('en-US', { weekday: 'short' }),
      price: Math.round(close * 100) / 100,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 2000000 + 500000),
    });
  }
  
  return data;
};

interface TeslaChartProps {
  isTradeActive?: boolean;
}

// Custom Candlestick component
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)';
  const bodyHeight = Math.abs(close - open);
  const wickTop = high;
  const wickBottom = low;
  
  const scale = height / (high - low || 1);
  const bodyY = y + (high - Math.max(open, close)) * scale;
  const bodyH = Math.max(bodyHeight * scale, 2);
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x + 2}
        y={bodyY}
        width={width - 4}
        height={bodyH}
        fill={isUp ? color : color}
        stroke={color}
        strokeWidth={1}
        rx={1}
      />
    </g>
  );
};

const TeslaChart = ({ isTradeActive = true }: TeslaChartProps) => {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState<TimeRange>('intraday');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [data, setData] = useState<DataPoint[]>(generateIntradayData);
  const [currentPrice, setCurrentPrice] = useState(data[data.length - 1]?.price || 248);
  const [previousPrice, setPreviousPrice] = useState(data[0]?.price || 248);
  const [priceChange, setPriceChange] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const wavePhase = useRef(0);

  // Switch data based on time range
  useEffect(() => {
    if (timeRange === 'intraday') {
      const newData = generateIntradayData();
      setData(newData);
      setPreviousPrice(newData[0]?.price || 248);
      setCurrentPrice(newData[newData.length - 1]?.price || 248);
    } else {
      const newData = generate30DayData();
      setData(newData);
      setPreviousPrice(newData[0]?.price || 248);
      setCurrentPrice(newData[newData.length - 1]?.price || 248);
    }
  }, [timeRange]);

  // Smooth price animation
  const animatePrice = useCallback((targetPrice: number, duration: number = 600) => {
    const startPrice = currentPrice;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
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

  // Continuous wave animation and price updates
  useEffect(() => {
    if (!isTradeActive) return;

    // Fast continuous updates for smooth wave movement
    const waveInterval = setInterval(() => {
      wavePhase.current += 0.15;
      setIsAnimating(true);
      
      setData(prevData => {
        const newData = prevData.map((point, index) => {
          // Create smooth wave effect across all points
          const waveOffset = Math.sin(wavePhase.current + index * 0.2) * 0.3;
          const microNoise = (Math.random() - 0.5) * 0.15;
          const newPrice = point.price + waveOffset + microNoise;
          
          return {
            ...point,
            price: Math.round(Math.max(200, Math.min(300, newPrice)) * 100) / 100,
            close: Math.round(Math.max(200, Math.min(300, newPrice)) * 100) / 100,
            high: Math.max(point.high, newPrice + 0.5),
            low: Math.min(point.low, newPrice - 0.5),
          };
        });
        
        // Update current price from last point
        const lastPrice = newData[newData.length - 1].price;
        const change = lastPrice - previousPrice;
        setPriceChange(change);
        animatePrice(lastPrice);
        
        return newData;
      });
      
      setTimeout(() => setIsAnimating(false), 300);
    }, 1500);

    // Add new data point periodically
    const dataInterval = setInterval(() => {
      if (timeRange === 'intraday') {
        setData(prevData => {
          const newData = [...prevData.slice(1)];
          const lastPoint = prevData[prevData.length - 1];
          const now = new Date();
          
          const momentum = Math.sin(Date.now() / 15000) * 1.2;
          const volatility = (Math.random() - 0.45) * 2;
          const open = lastPoint.close;
          const close = Math.max(220, Math.min(280, open + momentum + volatility));
          const high = Math.max(open, close) + Math.random() * 1.5;
          const low = Math.min(open, close) - Math.random() * 1.5;
          
          newData.push({
            date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: Math.round(close * 100) / 100,
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            close: Math.round(close * 100) / 100,
            volume: Math.floor(Math.random() * 500000 + 100000),
          });
          
          return newData;
        });
      }
    }, 20000);

    return () => {
      clearInterval(waveInterval);
      clearInterval(dataInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTradeActive, previousPrice, animatePrice, timeRange]);

  const isPositive = priceChange >= 0;
  const percentChange = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;
  const minPrice = Math.min(...data.map(d => d.low));
  const maxPrice = Math.max(...data.map(d => d.high));
  const avgPrice = data.reduce((sum, d) => sum + d.price, 0) / data.length;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6 relative overflow-hidden">
      {/* Live indicator */}
      {isTradeActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full bg-green-500 ${isAnimating ? 'animate-ping' : 'animate-pulse'}`} />
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

      {/* Toggle Controls */}
      <div className="flex items-center justify-between mb-4 gap-2">
        {/* Time Range Toggle */}
        <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
          <Button
            variant={timeRange === 'intraday' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-3 text-xs ${timeRange === 'intraday' ? 'bg-tesla-red hover:bg-tesla-red/90' : ''}`}
            onClick={() => setTimeRange('intraday')}
          >
            1D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-3 text-xs ${timeRange === '30d' ? 'bg-tesla-red hover:bg-tesla-red/90' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </Button>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
          <Button
            variant={chartType === 'area' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${chartType === 'area' ? 'bg-muted' : ''}`}
            onClick={() => setChartType('area')}
          >
            <LineChart className="w-4 h-4" />
          </Button>
          <Button
            variant={chartType === 'candlestick' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 px-2 ${chartType === 'candlestick' ? 'bg-muted' : ''}`}
            onClick={() => setChartType('candlestick')}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
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
                dataKey={timeRange === 'intraday' ? 'time' : 'date'}
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
                  <span key="price" className="font-mono font-bold text-foreground">${value.toFixed(2)}</span>,
                  'TSLA'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPriceTesla)"
                filter="url(#glow)"
                animationDuration={300}
                animationEasing="ease-out"
                isAnimationActive={true}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(0, 0%, 20%)" 
                vertical={false}
                opacity={0.5}
              />
              <XAxis 
                dataKey={timeRange === 'intraday' ? 'time' : 'date'}
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    const isUp = data.close >= data.open;
                    return (
                      <div className="bg-background/95 border border-border rounded-lg p-3 shadow-xl">
                        <p className="text-xs text-muted-foreground mb-2">{data.time || data.date}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Open:</span>
                          <span className="font-mono">${data.open.toFixed(2)}</span>
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono text-green-400">${data.high.toFixed(2)}</span>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono text-red-400">${data.low.toFixed(2)}</span>
                          <span className="text-muted-foreground">Close:</span>
                          <span className={`font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            ${data.close.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="high" 
                shape={(props: any) => <CandlestickBar {...props} />}
                animationDuration={300}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Bottom stats */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Low: <span className="text-red-400 font-mono">${minPrice.toFixed(2)}</span></span>
          <span>High: <span className="text-green-400 font-mono">${maxPrice.toFixed(2)}</span></span>
        </div>
        <span className="text-muted-foreground/60">
          {timeRange === 'intraday' ? 'Intraday' : '30 Day'} • Auto-refresh
        </span>
      </div>
    </div>
  );
};

export default TeslaChart;