import { useMemo, useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, ComposedChart, Line, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart2, Zap, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';

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
        dailyReturn: 0, // No daily returns shown for simplicity
        volume: 0,
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

  return (
    <div className="bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-xl border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 relative overflow-hidden shadow-2xl">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className={`absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-green-500/10 rounded-full blur-3xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-50'}`} />
      
      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg sm:rounded-xl">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground">{t('performanceChart')}</h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>30-Day Performance</span>
                <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 ${isAnimating ? 'animate-ping' : 'animate-pulse'}`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-2 sm:gap-3">
          <div className="bg-background/50 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-border/50">
            <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Portfolio</p>
            <p className={`text-sm sm:text-base md:text-xl font-bold font-mono transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
              ${displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-green-500/30">
            <p className="text-[8px] sm:text-[10px] text-green-400 uppercase tracking-wider mb-0.5">Profit</p>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              <p className={`text-sm sm:text-base md:text-xl font-bold font-mono text-green-500 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
                ${displayProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        <div className="bg-background/30 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center">
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">Total Return</p>
          <p className="text-[10px] sm:text-xs md:text-sm font-bold text-green-500">+{percentGain.toFixed(2)}%</p>
        </div>
        <div className="bg-background/30 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center">
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">{t('profit')}</p>
          <p className="text-[10px] sm:text-xs md:text-sm font-bold text-green-500">${totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-background/30 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center">
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">Invested</p>
          <p className="text-[10px] sm:text-xs md:text-sm font-bold text-foreground">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-background/30 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center">
          <p className="text-[8px] sm:text-[10px] text-muted-foreground mb-0.5">Status</p>
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            {hasCompletedInvestments ? (
              <>
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-green-500">Completed</p>
              </>
            ) : (
              <>
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500" />
                <p className="text-[10px] sm:text-xs md:text-sm font-bold text-yellow-500">Active</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="h-[100px] sm:h-[130px] md:h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValueInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.4}/>
                <stop offset="50%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.15}/>
                <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfitInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
              </linearGradient>
              <filter id="glowInv">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(0, 0%, 45%)" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: 'hsl(0, 0%, 45%)' }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 45%)" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              domain={[minValue, maxValue]}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              tick={{ fill: 'hsl(0, 0%, 45%)' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 8%)', 
                border: '1px solid hsl(0, 0%, 25%)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-background/95 border border-border rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-xl text-[10px] sm:text-xs">
                      <p className="text-muted-foreground mb-1 sm:mb-2 font-medium">{d.date}</p>
                      <div className="space-y-0.5 sm:space-y-1.5">
                        <div className="flex justify-between gap-4 sm:gap-6">
                          <span className="text-muted-foreground">Portfolio:</span>
                          <span className="font-mono font-bold text-foreground">${d.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4 sm:gap-6">
                          <span className="text-green-400">Profit:</span>
                          <span className="font-mono font-bold text-green-400">+${d.profit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4 sm:gap-6">
                          <span className="text-muted-foreground">Invested:</span>
                          <span className="font-mono text-muted-foreground">${d.invested.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              y={avgValue} 
              stroke="hsl(0, 0%, 40%)" 
              strokeDasharray="4 4" 
              strokeOpacity={0.5}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(142, 76%, 45%)" 
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValueInv)"
              filter="url(#glowInv)"
              animationDuration={500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Trend Mini Chart */}
      <div className="h-[25px] sm:h-[30px] md:h-[40px] w-full mt-1.5 sm:mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
            <XAxis hide />
            <YAxis hide domain={[0, 'auto']} />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(160, 84%, 39%)" 
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorProfitInv)"
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Stats */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/30">
        <div className="flex items-center gap-2 sm:gap-4 text-[8px] sm:text-[10px]">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 sm:w-3 h-0.5 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Portfolio: ${portfolioValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 sm:w-3 h-0.5 bg-emerald-500 rounded-full" />
            <span className="text-muted-foreground">{t('profit')}: ${totalProfit.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] text-muted-foreground">
          <BarChart2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span>{hasCompletedInvestments ? 'Completed' : 'Active'}</span>
        </div>
      </div>
    </div>
  );
};

export default InvestmentChart;
