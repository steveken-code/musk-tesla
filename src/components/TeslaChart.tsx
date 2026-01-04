import { useEffect, useState, useRef, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, Bar, ComposedChart, Line } from 'recharts';
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
  sma20?: number;
  ema12?: number;
}

type TimeRange = 'intraday' | '30d';
type ChartType = 'area' | 'candlestick';

// Calculate SMA (Simple Moving Average)
const calculateSMA = (data: DataPoint[], period: number): DataPoint[] => {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { ...point, sma20: undefined };
    }
    const sum = data.slice(index - period + 1, index + 1).reduce((acc, p) => acc + p.close, 0);
    return { ...point, sma20: Math.round((sum / period) * 100) / 100 };
  });
};

// Calculate EMA (Exponential Moving Average)
const calculateEMA = (data: DataPoint[], period: number): DataPoint[] => {
  const multiplier = 2 / (period + 1);
  let ema = data[0]?.close || 0;
  
  return data.map((point, index) => {
    if (index === 0) {
      return { ...point, ema12: Math.round(ema * 100) / 100 };
    }
    ema = (point.close - ema) * multiplier + ema;
    return { ...point, ema12: Math.round(ema * 100) / 100 };
  });
};

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
  
  // Add SMA and EMA
  let result = calculateSMA(data, 20);
  result = calculateEMA(result, 12);
  
  return result;
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
  
  // Add SMA and EMA
  let result = calculateSMA(data, 20);
  result = calculateEMA(result, 12);
  
  return result;
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

// Volume bar component
const VolumeBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  
  const { open, close } = payload;
  const isUp = close >= open;
  const color = isUp ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)';
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      opacity={0.5}
      rx={1}
    />
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
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(true);
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

    const waveInterval = setInterval(() => {
      wavePhase.current += 0.15;
      setIsAnimating(true);
      
      setData(prevData => {
        const newData = prevData.map((point, index) => {
          const waveOffset = Math.sin(wavePhase.current + index * 0.2) * 0.3;
          const microNoise = (Math.random() - 0.5) * 0.15;
          const newPrice = point.price + waveOffset + microNoise;
          
          return {
            ...point,
            price: Math.round(Math.max(200, Math.min(300, newPrice)) * 100) / 100,
            close: Math.round(Math.max(200, Math.min(300, newPrice)) * 100) / 100,
            high: Math.max(point.high, newPrice + 0.5),
            low: Math.min(point.low, newPrice - 0.5),
            volume: point.volume + Math.floor((Math.random() - 0.5) * 10000),
          };
        });
        
        // Recalculate SMA and EMA
        let result = calculateSMA(newData, 20);
        result = calculateEMA(result, 12);
        
        const lastPrice = result[result.length - 1].price;
        const change = lastPrice - previousPrice;
        setPriceChange(change);
        animatePrice(lastPrice);
        
        return result;
      });
      
      setTimeout(() => setIsAnimating(false), 300);
    }, 1500);

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
          
          // Recalculate SMA and EMA
          let result = calculateSMA(newData, 20);
          result = calculateEMA(result, 12);
          
          return result;
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
  const maxVolume = Math.max(...data.map(d => d.volume));

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toString();
  };

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
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
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

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2">
          <Button
            variant={showSMA ? 'default' : 'outline'}
            size="sm"
            className={`h-7 px-2 text-xs ${showSMA ? 'bg-orange-500/80 hover:bg-orange-500' : 'border-orange-500/50 text-orange-400'}`}
            onClick={() => setShowSMA(!showSMA)}
          >
            SMA
          </Button>
          <Button
            variant={showEMA ? 'default' : 'outline'}
            size="sm"
            className={`h-7 px-2 text-xs ${showEMA ? 'bg-cyan-500/80 hover:bg-cyan-500' : 'border-cyan-500/50 text-cyan-400'}`}
            onClick={() => setShowEMA(!showEMA)}
          >
            EMA
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
      
      {/* Price Chart */}
      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                    const d = payload[0].payload;
                    return (
                      <div className="bg-background/95 border border-border rounded-lg p-3 shadow-xl text-xs">
                        <p className="text-muted-foreground mb-2">{d.time || d.date}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="font-mono font-bold">${d.price.toFixed(2)}</span>
                          </div>
                          {showSMA && d.sma20 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-orange-400">SMA(20):</span>
                              <span className="font-mono text-orange-400">${d.sma20.toFixed(2)}</span>
                            </div>
                          )}
                          {showEMA && d.ema12 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-cyan-400">EMA(12):</span>
                              <span className="font-mono text-cyan-400">${d.ema12.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Volume:</span>
                            <span className="font-mono">{formatVolume(d.volume)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
              {showSMA && (
                <Line 
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="hsl(30, 100%, 50%)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                  animationDuration={300}
                />
              )}
              {showEMA && (
                <Line 
                  type="monotone" 
                  dataKey="ema12" 
                  stroke="hsl(190, 100%, 50%)"
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={300}
                />
              )}
            </ComposedChart>
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const d = payload[0].payload;
                    const isUp = d.close >= d.open;
                    return (
                      <div className="bg-background/95 border border-border rounded-lg p-3 shadow-xl">
                        <p className="text-xs text-muted-foreground mb-2">{d.time || d.date}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">Open:</span>
                          <span className="font-mono">${d.open.toFixed(2)}</span>
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono text-green-400">${d.high.toFixed(2)}</span>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono text-red-400">${d.low.toFixed(2)}</span>
                          <span className="text-muted-foreground">Close:</span>
                          <span className={`font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                            ${d.close.toFixed(2)}
                          </span>
                          {showSMA && d.sma20 && (
                            <>
                              <span className="text-orange-400">SMA:</span>
                              <span className="font-mono text-orange-400">${d.sma20.toFixed(2)}</span>
                            </>
                          )}
                          {showEMA && d.ema12 && (
                            <>
                              <span className="text-cyan-400">EMA:</span>
                              <span className="font-mono text-cyan-400">${d.ema12.toFixed(2)}</span>
                            </>
                          )}
                          <span className="text-muted-foreground">Vol:</span>
                          <span className="font-mono">{formatVolume(d.volume)}</span>
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
              {showSMA && (
                <Line 
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="hsl(30, 100%, 50%)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                  animationDuration={300}
                />
              )}
              {showEMA && (
                <Line 
                  type="monotone" 
                  dataKey="ema12" 
                  stroke="hsl(190, 100%, 50%)"
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={300}
                />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="h-[60px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey={timeRange === 'intraday' ? 'time' : 'date'}
              stroke="hsl(0, 0%, 50%)" 
              fontSize={9}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: 'hsl(0, 0%, 40%)' }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 50%)" 
              fontSize={9}
              tickLine={false}
              axisLine={false}
              domain={[0, maxVolume * 1.1]}
              tickFormatter={formatVolume}
              tick={{ fill: 'hsl(0, 0%, 40%)' }}
              width={45}
            />
            <Bar 
              dataKey="volume" 
              shape={(props: any) => <VolumeBar {...props} />}
              animationDuration={300}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-xs">
        {showSMA && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-orange-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0', borderColor: 'hsl(30, 100%, 50%)' }} />
            <span className="text-orange-400">SMA(20)</span>
          </div>
        )}
        {showEMA && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-cyan-500" />
            <span className="text-cyan-400">EMA(12)</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500/50 rounded-sm" />
          <span className="text-muted-foreground">Volume</span>
        </div>
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
