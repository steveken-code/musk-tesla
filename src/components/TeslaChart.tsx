import { useEffect, useState, useRef, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Bar, ComposedChart, Line, Brush, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart3, LineChart, ZoomIn, ZoomOut, RotateCcw, Radio, Wifi, Clock } from 'lucide-react';
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
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
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

// Calculate Bollinger Bands
const calculateBollingerBands = (data: DataPoint[], period: number = 20, stdDev: number = 2): DataPoint[] => {
  return data.map((point, index) => {
    if (index < period - 1) {
      return { ...point, bollingerUpper: undefined, bollingerMiddle: undefined, bollingerLower: undefined };
    }
    
    const slice = data.slice(index - period + 1, index + 1);
    const mean = slice.reduce((acc, p) => acc + p.close, 0) / period;
    const squaredDiffs = slice.map(p => Math.pow(p.close - mean, 2));
    const variance = squaredDiffs.reduce((acc, d) => acc + d, 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      ...point,
      bollingerMiddle: Math.round(mean * 100) / 100,
      bollingerUpper: Math.round((mean + stdDev * std) * 100) / 100,
      bollingerLower: Math.round((mean - stdDev * std) * 100) / 100,
    };
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
  
  let result = calculateSMA(data, 20);
  result = calculateEMA(result, 12);
  result = calculateBollingerBands(result, 20, 2);
  
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
  
  let result = calculateSMA(data, 20);
  result = calculateEMA(result, 12);
  result = calculateBollingerBands(result, 20, 2);
  
  return result;
};

interface TeslaChartProps {
  isTradeActive?: boolean;
}

// Enhanced Candlestick component with glow effect
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)';
  const glowColor = isUp ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
  const bodyHeight = Math.abs(close - open);
  const scale = height / (high - low || 1);
  const bodyY = y + (high - Math.max(open, close)) * scale;
  const bodyH = Math.max(bodyHeight * scale, 2);
  
  return (
    <g>
      {/* Glow effect */}
      <rect x={x} y={bodyY - 2} width={width} height={bodyH + 4} fill={glowColor} rx={2} filter="url(#candleGlow)" />
      {/* Wick */}
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} stroke={color} strokeWidth={1.5} />
      {/* Body */}
      <rect x={x + 2} y={bodyY} width={width - 4} height={bodyH} fill={color} stroke={color} strokeWidth={1} rx={2} />
    </g>
  );
};

// Enhanced Volume bar with gradient
const VolumeBar = (props: any) => {
  const { x, y, width, height, payload, index } = props;
  if (!payload) return null;
  
  const { open, close } = payload;
  const isUp = close >= open;
  const gradientId = isUp ? 'volumeGradientUp' : 'volumeGradientDown';
  
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      fill={`url(#${gradientId})`}
      rx={2} 
      className="transition-opacity duration-200 hover:opacity-100"
      style={{ opacity: 0.7 }}
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
  const [showBollinger, setShowBollinger] = useState(true);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomEnd, setZoomEnd] = useState(data.length - 1);
  const animationRef = useRef<number | null>(null);
  const wavePhase = useRef(0);


  // Switch data based on time range
  useEffect(() => {
    if (timeRange === 'intraday') {
      const newData = generateIntradayData();
      setData(newData);
      setPreviousPrice(newData[0]?.price || 248);
      setCurrentPrice(newData[newData.length - 1]?.price || 248);
      setZoomStart(0);
      setZoomEnd(newData.length - 1);
    } else {
      const newData = generate30DayData();
      setData(newData);
      setPreviousPrice(newData[0]?.price || 248);
      setCurrentPrice(newData[newData.length - 1]?.price || 248);
      setZoomStart(0);
      setZoomEnd(newData.length - 1);
    }
  }, [timeRange]);

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
        
        let result = calculateSMA(newData, 20);
        result = calculateEMA(result, 12);
        result = calculateBollingerBands(result, 20, 2);
        
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
          
          let result = calculateSMA(newData, 20);
          result = calculateEMA(result, 12);
          result = calculateBollingerBands(result, 20, 2);
          
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

  const handleZoomIn = () => {
    const range = zoomEnd - zoomStart;
    const newRange = Math.max(10, Math.floor(range * 0.7));
    const center = Math.floor((zoomStart + zoomEnd) / 2);
    setZoomStart(Math.max(0, center - Math.floor(newRange / 2)));
    setZoomEnd(Math.min(data.length - 1, center + Math.floor(newRange / 2)));
  };

  const handleZoomOut = () => {
    const range = zoomEnd - zoomStart;
    const newRange = Math.min(data.length - 1, Math.floor(range * 1.5));
    const center = Math.floor((zoomStart + zoomEnd) / 2);
    setZoomStart(Math.max(0, center - Math.floor(newRange / 2)));
    setZoomEnd(Math.min(data.length - 1, center + Math.floor(newRange / 2)));
  };

  const handleResetZoom = () => {
    setZoomStart(0);
    setZoomEnd(data.length - 1);
  };

  const handleBrushChange = (e: any) => {
    if (e && e.startIndex !== undefined && e.endIndex !== undefined) {
      setZoomStart(e.startIndex);
      setZoomEnd(e.endIndex);
    }
  };

  const isPositive = priceChange >= 0;
  const percentChange = previousPrice > 0 ? ((priceChange / previousPrice) * 100) : 0;
  
  const visibleData = data.slice(zoomStart, zoomEnd + 1);
  const minPrice = Math.min(...visibleData.map(d => Math.min(d.low, d.bollingerLower || d.low)));
  const maxPrice = Math.max(...visibleData.map(d => Math.max(d.high, d.bollingerUpper || d.high)));
  const maxVolume = Math.max(...visibleData.map(d => d.volume));
  const avgPrice = visibleData.reduce((sum, d) => sum + d.price, 0) / visibleData.length;
  const totalVolume = visibleData.reduce((sum, d) => sum + d.volume, 0);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(0)}K`;
    return vol.toString();
  };

  // Professional custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const isUp = d.close >= d.open;
    
    return (
      <div className="bg-slate-900/98 border border-slate-700/80 rounded-xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl min-w-[180px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
          <span className="text-xs text-slate-400 font-medium">{d.time || d.date}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{((d.close - d.open) / d.open * 100).toFixed(2)}%
          </div>
        </div>
        
        {/* OHLC Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Open</span>
            <span className="font-mono text-slate-200">${d.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-500">High</span>
            <span className="font-mono text-green-400">${d.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">Low</span>
            <span className="font-mono text-red-400">${d.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Close</span>
            <span className={`font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>${d.close.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Volume */}
        <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Volume
          </span>
          <span className="font-mono text-xs text-slate-300">{formatVolume(d.volume)}</span>
        </div>
        
        {/* Indicators */}
        {(showSMA || showEMA || showBollinger) && (
          <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
            {showSMA && d.sma20 && (
              <div className="flex justify-between text-[10px]">
                <span className="text-orange-400">SMA(20)</span>
                <span className="font-mono text-orange-400">${d.sma20.toFixed(2)}</span>
              </div>
            )}
            {showEMA && d.ema12 && (
              <div className="flex justify-between text-[10px]">
                <span className="text-cyan-400">EMA(12)</span>
                <span className="font-mono text-cyan-400">${d.ema12.toFixed(2)}</span>
              </div>
            )}
            {showBollinger && d.bollingerUpper && (
              <div className="flex justify-between text-[10px]">
                <span className="text-yellow-400">BB Range</span>
                <span className="font-mono text-yellow-400">${d.bollingerLower?.toFixed(2)} - ${d.bollingerUpper.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-800/85 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 relative overflow-hidden shadow-2xl">
      {/* Professional background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className={`absolute top-0 right-0 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 rounded-full blur-3xl transition-all duration-700 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'} ${isAnimating ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`} />
      <div className="absolute bottom-0 left-0 w-32 sm:w-40 md:w-56 h-32 sm:h-40 md:h-56 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* Live indicator with market status */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/80 rounded-full border border-slate-700/50">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Market Open</span>
        </div>
        {isTradeActive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/30">
            <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500 ${isAnimating ? 'animate-ping' : 'animate-pulse'}`} />
            <span className="text-[9px] sm:text-[10px] text-green-400 font-semibold">LIVE</span>
          </div>
        )}
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-3">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg sm:rounded-xl border border-red-500/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{t('teslaStock')}</h2>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
                <span className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded">NASDAQ: TSLA</span>
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  <span>Real-time</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Price Display */}
        <div className="text-left sm:text-right">
          <div className="flex items-baseline gap-2 sm:justify-end">
            <p className={`text-2xl sm:text-3xl md:text-4xl font-bold font-mono transition-all duration-300 ${isAnimating ? 'scale-105' : ''} ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ${currentPrice.toFixed(2)}
            </p>
            <span className="text-xs text-slate-500">USD</span>
          </div>
          <div className={`flex items-center gap-2 sm:justify-end mt-1 px-2 py-0.5 rounded-lg inline-flex ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            <span className={`text-sm font-bold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`transition-transform duration-300 ${isAnimating ? (isPositive ? '-translate-y-1' : 'translate-y-1') : ''}`}>
                {isPositive ? '▲' : '▼'}
              </span>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}
            </span>
            <span className={`text-sm font-medium ${isPositive ? 'text-green-400/80' : 'text-red-400/80'}`}>
              ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        {/* Time Range Toggle */}
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          <Button
            variant={timeRange === 'intraday' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-3 sm:px-4 text-xs font-medium transition-all ${timeRange === 'intraday' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setTimeRange('intraday')}
          >
            1D
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-3 sm:px-4 text-xs font-medium transition-all ${timeRange === '30d' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setTimeRange('30d')}
          >
            30D
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700/50" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700/50" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 text-slate-400 hover:text-white hover:bg-slate-700/50" onClick={handleResetZoom}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          <Button
            variant={chartType === 'area' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-2 ${chartType === 'area' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setChartType('area')}
          >
            <LineChart className="w-4 h-4" />
          </Button>
          <Button
            variant={chartType === 'candlestick' ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-2 ${chartType === 'candlestick' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            onClick={() => setChartType('candlestick')}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          <Button
            variant={showSMA ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-2 text-[10px] sm:text-xs font-medium ${showSMA ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:text-orange-400'}`}
            onClick={() => setShowSMA(!showSMA)}
          >
            SMA
          </Button>
          <Button
            variant={showEMA ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-2 text-[10px] sm:text-xs font-medium ${showEMA ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-cyan-400'}`}
            onClick={() => setShowEMA(!showEMA)}
          >
            EMA
          </Button>
          <Button
            variant={showBollinger ? 'default' : 'ghost'}
            size="sm"
            className={`h-7 sm:h-8 px-2 text-[10px] sm:text-xs font-medium ${showBollinger ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-400 hover:text-yellow-400'}`}
            onClick={() => setShowBollinger(!showBollinger)}
          >
            BB
          </Button>
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="h-[180px] sm:h-[220px] md:h-[280px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <defs>
                {/* Enhanced gradient for area */}
                <linearGradient id="colorPriceTesla" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0.5}/>
                  <stop offset="25%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0.3}/>
                  <stop offset="50%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0.15}/>
                  <stop offset="100%" stopColor={isPositive ? 'hsl(142, 76%, 45%)' : 'hsl(0, 72%, 51%)'} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="bollingerFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.15}/>
                  <stop offset="100%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.02}/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={isPositive ? 'hsl(142, 76%, 35%)' : 'hsl(0, 72%, 45%)'} />
                  <stop offset="50%" stopColor={isPositive ? 'hsl(142, 76%, 50%)' : 'hsl(0, 72%, 55%)'} />
                  <stop offset="100%" stopColor={isPositive ? 'hsl(142, 76%, 60%)' : 'hsl(0, 72%, 65%)'} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} horizontal={false} opacity={0} />
              <XAxis 
                dataKey={timeRange === 'intraday' ? 'time' : 'date'}
                stroke="hsl(220, 10%, 40%)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fill: 'hsl(220, 10%, 50%)' }}
              />
              <YAxis 
                stroke="hsl(220, 10%, 40%)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={[minPrice - 2, maxPrice + 2]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fill: 'hsl(220, 10%, 50%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgPrice} stroke="hsl(220, 10%, 35%)" strokeDasharray="4 4" strokeOpacity={0.6} />
              
              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="bollingerUpper" 
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fillOpacity={0}
                    animationDuration={300}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bollingerLower" 
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="url(#bollingerFill)"
                    fillOpacity={1}
                    animationDuration={300}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bollingerMiddle" 
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={1}
                    strokeOpacity={0.5}
                    dot={false}
                    animationDuration={300}
                  />
                </>
              )}
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPriceTesla)"
                filter="url(#glow)"
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
          ) : (
            <ComposedChart data={visibleData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="bollingerFillCandle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.1}/>
                  <stop offset="100%" stopColor="hsl(45, 93%, 47%)" stopOpacity={0.02}/>
                </linearGradient>
                <filter id="candleGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} horizontal={false} opacity={0} />
              <XAxis 
                dataKey={timeRange === 'intraday' ? 'time' : 'date'}
                stroke="hsl(220, 10%, 40%)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fill: 'hsl(220, 10%, 50%)' }}
              />
              <YAxis 
                stroke="hsl(220, 10%, 40%)" 
                fontSize={9}
                tickLine={false}
                axisLine={false}
                domain={[minPrice - 2, maxPrice + 2]}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                tick={{ fill: 'hsl(220, 10%, 50%)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={avgPrice} stroke="hsl(220, 10%, 35%)" strokeDasharray="4 4" strokeOpacity={0.6} />
              
              {/* Bollinger Bands */}
              {showBollinger && (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="bollingerUpper" 
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fillOpacity={0}
                    animationDuration={300}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bollingerLower" 
                    stroke="hsl(45, 93%, 47%)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    fill="url(#bollingerFillCandle)"
                    fillOpacity={1}
                    animationDuration={300}
                  />
                </>
              )}
              <Bar dataKey="high" shape={(props: any) => <CandlestickBar {...props} />} animationDuration={300} />
              {showSMA && (
                <Line type="monotone" dataKey="sma20" stroke="hsl(30, 100%, 50%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" animationDuration={300} />
              )}
              {showEMA && (
                <Line type="monotone" dataKey="ema12" stroke="hsl(190, 100%, 50%)" strokeWidth={1.5} dot={false} animationDuration={300} />
              )}
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart - Enhanced */}
      <div className="h-[45px] sm:h-[55px] md:h-[65px] w-full mt-2 sm:mt-3">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Volume
          </span>
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">{formatVolume(totalVolume)} total</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visibleData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradientUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 50%)" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="hsl(142, 76%, 35%)" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="volumeGradientDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="hsl(0, 72%, 40%)" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis dataKey={timeRange === 'intraday' ? 'time' : 'date'} stroke="hsl(220, 10%, 35%)" fontSize={8} tickLine={false} axisLine={false} interval="preserveStartEnd" tick={{ fill: 'hsl(220, 10%, 40%)' }} />
            <YAxis stroke="hsl(220, 10%, 35%)" fontSize={8} tickLine={false} axisLine={false} domain={[0, maxVolume * 1.1]} tickFormatter={formatVolume} tick={{ fill: 'hsl(220, 10%, 40%)' }} width={40} />
            <Bar dataKey="volume" shape={(props: any) => <VolumeBar {...props} />} animationDuration={300} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Brush for zoom selection */}
      <div className="h-[25px] sm:h-[30px] md:h-[35px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="brushGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(220, 15%, 25%)" stopOpacity={1}/>
                <stop offset="100%" stopColor="hsl(220, 15%, 15%)" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <Brush 
              dataKey={timeRange === 'intraday' ? 'time' : 'date'}
              height={22}
              stroke="hsl(220, 15%, 35%)"
              fill="url(#brushGradient)"
              startIndex={zoomStart}
              endIndex={zoomEnd}
              onChange={handleBrushChange}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Stats Bar */}
      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3 sm:gap-5 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Low:</span>
            <span className="text-red-400 font-mono font-medium">${minPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Avg:</span>
            <span className="text-slate-300 font-mono">${avgPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">High:</span>
            <span className="text-green-400 font-mono font-medium">${maxPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500">
          <Radio className="w-3 h-3 text-green-500" />
          <span>{timeRange === 'intraday' ? 'Intraday' : '30 Day'} • Auto-refresh</span>
        </div>
      </div>
    </div>
  );
};

export default TeslaChart;