import { useMemo, useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, ComposedChart, Line, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart2, Zap, ArrowUpRight, ArrowDownRight, CheckCircle, PieChart, Target, DollarSign, Radio } from 'lucide-react';

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
}

interface InvestmentChartProps {
  investments: Investment[];
}

const InvestmentChart = ({ investments }: InvestmentChartProps) => {
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [displayProfit, setDisplayProfit] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Check if all investments are completed (no animations needed)
  const isCompleted = investments.every(i => i.status === 'completed' || i.status === 'pending');
  const hasCompletedInvestments = investments.some(i => i.status === 'completed');
  
  // Calculate actual totals from database
  const actualTotals = useMemo(() => {
    const activeOrCompleted = investments.filter(i => i.status === 'active' || i.status === 'completed');
    const totalInvested = activeOrCompleted.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalProfit = activeOrCompleted.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);
    const portfolioValue = totalInvested + totalProfit;
    return { totalInvested, totalProfit, portfolioValue };
  }, [investments]);

  const chartData = useMemo(() => {
    const activeInvestments = investments.filter(i => i.status === 'active' || i.status === 'completed');
    
    if (activeInvestments.length === 0) return [];

    const { totalInvested, totalProfit, portfolioValue } = actualTotals;
    
    // For completed investments, show stable values - no fluctuations
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Gradual progression to final value (no random fluctuations for completed)
      const dayProgress = (30 - i) / 30;
      
      // For completed investments: smooth progression to final value, no volatility
      // For active investments: slight visual progression
      const currentProfit = hasCompletedInvestments 
        ? totalProfit * dayProgress // Smooth progression, no volatility
        : totalProfit * dayProgress; // Same for active, just gradual increase
      
      const currentValue = totalInvested + currentProfit;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(currentValue * 100) / 100,
        profit: Math.round(currentProfit * 100) / 100,
        invested: totalInvested,
        dailyReturn: i > 0 ? (currentProfit / totalInvested * 100 / (31 - i)).toFixed(3) : 0,
        volume: Math.floor(Math.random() * 50000 + 10000),
      });
    }
    
    // Ensure the last data point has the EXACT values from database
    if (data.length > 0) {
      data[data.length - 1] = {
        ...data[data.length - 1],
        value: portfolioValue,
        profit: totalProfit,
        invested: totalInvested,
      };
    }
    
    return data;
  }, [investments, actualTotals, hasCompletedInvestments]);

  // Use actual values directly
  const { totalInvested, totalProfit, portfolioValue } = actualTotals;
  const percentGain = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const dailyReturn = percentGain / 30;

  // Animate values ONCE on mount, then use exact values
  useEffect(() => {
    if (portfolioValue > 0 && !hasAnimated) {
      setIsAnimating(true);
      const duration = 1000;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setDisplayValue(portfolioValue * easeOut);
        setDisplayProfit(totalProfit * easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete - set exact values
          setDisplayValue(portfolioValue);
          setDisplayProfit(totalProfit);
          setIsAnimating(false);
          setHasAnimated(true);
        }
      };
      
      requestAnimationFrame(animate);
    } else if (hasAnimated) {
      // After initial animation, always show exact values
      setDisplayValue(portfolioValue);
      setDisplayProfit(totalProfit);
    }
  }, [portfolioValue, totalProfit, hasAnimated]);

  // No live updates for completed investments - values stay stable
  useEffect(() => {
    if (hasCompletedInvestments) {
      // Don't animate for completed investments
      return;
    }
    
    // Only animate pulse for active investments
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 5000); // Slower interval
    return () => clearInterval(interval);
  }, [hasCompletedInvestments]);

  if (chartData.length === 0) {
    return null;
  }

  const minValue = Math.min(...chartData.map(d => d.value)) * 0.98;
  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.02;
  const avgValue = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length;

  // Professional custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const d = payload[0].payload;
    const isProfit = d.profit > 0;
    
    return (
      <div className="bg-slate-900/98 border border-slate-700/80 rounded-xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl min-w-[200px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
          <span className="text-xs text-slate-400 font-medium">{d.date}</span>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isProfit ? '+' : ''}{((d.profit / d.invested) * 100).toFixed(2)}%
          </div>
        </div>
        
        {/* Values */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Portfolio Value
            </span>
            <span className="font-mono font-bold text-white text-sm">${d.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Total Profit
            </span>
            <span className="font-mono font-bold text-emerald-400">+${d.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Invested
            </span>
            <span className="font-mono text-slate-400">${d.invested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        {/* Performance indicator */}
        <div className="mt-3 pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Daily Avg Return</span>
            <span className="text-emerald-400 font-mono">+{dailyReturn.toFixed(3)}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/30 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 relative overflow-hidden shadow-2xl">
      {/* Professional background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 pointer-events-none" />
      <div className={`absolute top-0 right-0 w-40 sm:w-56 md:w-72 h-40 sm:h-56 md:h-72 bg-emerald-500/10 rounded-full blur-3xl transition-all duration-700 ${isAnimating ? 'opacity-100 scale-110' : 'opacity-40 scale-100'}`} />
      <div className="absolute bottom-0 left-0 w-32 sm:w-40 md:w-56 h-32 sm:h-40 md:h-56 bg-green-500/5 rounded-full blur-3xl" />
      
      {/* Header with Status Badge */}
      <div className="relative flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Top row: Title and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg sm:rounded-xl border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white">{t('performanceChart')}</h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                <PieChart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>30-Day Performance</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge - inline with header */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${hasCompletedInvestments ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            {hasCompletedInvestments ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-wide">Completed</span>
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full bg-amber-500 ${isAnimating ? 'animate-ping' : 'animate-pulse'}`} />
                <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase tracking-wide">Active</span>
              </>
            )}
          </div>
        </div>
        
        {/* Stats Cards Row */}
        <div className="flex gap-2 sm:gap-3">
          <div className="flex-1 bg-slate-800/60 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-700/50">
            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider mb-1">Portfolio Value</p>
            <p className={`text-lg sm:text-xl md:text-2xl font-bold font-mono text-white transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
              ${displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex-1 bg-emerald-500/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 border border-emerald-500/30">
            <p className="text-[9px] sm:text-[10px] text-emerald-400 uppercase tracking-wider mb-1">Total Profit</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <p className={`text-lg sm:text-xl md:text-2xl font-bold font-mono text-emerald-400 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
                ${displayProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-700/30">
          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Total Return</p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-400">+{percentGain.toFixed(2)}%</p>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-700/30">
          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-1 uppercase tracking-wide">{t('profit')}</p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-400">${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-700/30">
          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Invested</p>
          <p className="text-sm sm:text-base md:text-lg font-bold text-white">${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-slate-700/30">
          <p className="text-[8px] sm:text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Status</p>
          <div className="flex items-center justify-center gap-1">
            {hasCompletedInvestments ? (
              <>
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                <p className="text-sm sm:text-base font-bold text-emerald-400">Done</p>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                <p className="text-sm sm:text-base font-bold text-yellow-400">Active</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="h-[120px] sm:h-[150px] md:h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <defs>
              {/* Enhanced multi-stop gradient */}
              <linearGradient id="colorValueInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(155, 80%, 45%)" stopOpacity={0.6}/>
                <stop offset="25%" stopColor="hsl(155, 80%, 45%)" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="hsl(160, 75%, 40%)" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="hsl(160, 75%, 35%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfitInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.5}/>
                <stop offset="50%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="lineGradientInv" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(155, 75%, 35%)" />
                <stop offset="50%" stopColor="hsl(155, 80%, 50%)" />
                <stop offset="100%" stopColor="hsl(160, 85%, 55%)" />
              </linearGradient>
              <filter id="glowInv">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} horizontal={false} opacity={0} />
            <XAxis 
              dataKey="date" 
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
              domain={[minValue, maxValue]}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fill: 'hsl(220, 10%, 50%)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={avgValue} 
              stroke="hsl(220, 10%, 35%)" 
              strokeDasharray="4 4" 
              strokeOpacity={0.6}
              label={{ value: 'Avg', position: 'right', fill: 'hsl(220, 10%, 50%)', fontSize: 10 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="url(#lineGradientInv)" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValueInv)"
              filter="url(#glowInv)"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Trend Mini Chart */}
      <div className="h-[35px] sm:h-[45px] md:h-[55px] w-full mt-2 sm:mt-3">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Profit Growth
          </span>
          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">+${totalProfit.toLocaleString()}</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="profitBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="hsl(160, 84%, 35%)" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <XAxis hide />
            <YAxis hide domain={[0, 'auto']} />
            <Bar 
              dataKey="profit" 
              fill="url(#profitBarGradient)"
              radius={[2, 2, 0, 0]}
              animationDuration={500}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(160, 84%, 50%)" 
              strokeWidth={2}
              dot={false}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3 sm:gap-5 text-[9px] sm:text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
            <span className="text-slate-400">Portfolio: <span className="text-white font-mono">${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 rounded-full bg-emerald-500/60" />
            <span className="text-slate-400">{t('profit')}: <span className="text-emerald-400 font-mono">+${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>{hasCompletedInvestments ? 'Investment Complete' : 'Tracking Active'}</span>
        </div>
      </div>
    </div>
  );
};

export default InvestmentChart;