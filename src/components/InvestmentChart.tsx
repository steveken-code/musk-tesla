import { useMemo, useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Bar, ComposedChart, Line, ReferenceLine } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Activity, BarChart2, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

  const chartData = useMemo(() => {
    const activeInvestments = investments.filter(i => i.status === 'active' || i.status === 'completed');
    
    if (activeInvestments.length === 0) return [];

    // Generate chart data based on investments
    const totalInvested = activeInvestments.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalProfit = activeInvestments.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);
    
    // Create 30-day performance data with more realistic patterns
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate gradual profit accumulation with market-like fluctuations
      const dayProgress = (30 - i) / 30;
      const trendBias = Math.sin((30 - i) / 6) * (totalProfit * 0.08);
      const volatility = (Math.random() - 0.5) * (totalProfit * 0.04);
      const currentProfit = totalProfit * dayProgress + trendBias + volatility;
      const dailyReturn = i < 30 ? (Math.random() - 0.4) * 2 : 0;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.max(totalInvested, Math.round((totalInvested + currentProfit) * 100) / 100),
        profit: Math.max(0, Math.round(currentProfit * 100) / 100),
        invested: totalInvested,
        dailyReturn: Math.round(dailyReturn * 100) / 100,
        volume: Math.floor(Math.random() * 10000 + 5000),
      });
    }
    
    return data;
  }, [investments]);

  const totalValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const totalProfit = chartData.length > 0 ? chartData[chartData.length - 1].profit : 0;
  const totalInvested = chartData.length > 0 ? chartData[chartData.length - 1].invested : 0;
  const percentGain = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;
  const yesterdayValue = chartData.length > 1 ? chartData[chartData.length - 2].value : totalValue;
  const dailyChange = totalValue - yesterdayValue;
  const dailyPercent = yesterdayValue > 0 ? ((dailyChange / yesterdayValue) * 100) : 0;

  // Animate values on mount and updates
  useEffect(() => {
    if (totalValue > 0) {
      setIsAnimating(true);
      const duration = 1000;
      const startTime = performance.now();
      const startValue = displayValue;
      const startProfit = displayProfit;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setDisplayValue(startValue + (totalValue - startValue) * easeOut);
        setDisplayProfit(startProfit + (totalProfit - startProfit) * easeOut);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [totalValue, totalProfit]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (chartData.length === 0) {
    return null;
  }

  const minValue = Math.min(...chartData.map(d => d.value)) * 0.98;
  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.02;
  const avgValue = chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length;

  return (
    <div className="bg-gradient-to-br from-card/90 via-card/80 to-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className={`absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-50'}`} />
      
      {/* Header */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{t('performanceChart')}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-3 h-3" />
                <span>30-Day Performance</span>
                <span className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isAnimating ? 'animate-ping' : 'animate-pulse'}`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="bg-background/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Portfolio</p>
            <p className={`text-xl font-bold font-mono transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
              ${displayValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-green-500/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-green-500/30">
            <p className="text-[10px] text-green-400 uppercase tracking-wider mb-0.5">Profit</p>
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <p className={`text-xl font-bold font-mono text-green-500 transition-all duration-300 ${isAnimating ? 'scale-105' : ''}`}>
                ${displayProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-background/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Total Return</p>
          <p className="text-sm font-bold text-green-500">+{percentGain.toFixed(2)}%</p>
        </div>
        <div className="bg-background/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Today</p>
          <div className={`text-sm font-bold flex items-center justify-center gap-0.5 ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {dailyChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {dailyPercent >= 0 ? '+' : ''}{dailyPercent.toFixed(2)}%
          </div>
        </div>
        <div className="bg-background/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Invested</p>
          <p className="text-sm font-bold text-foreground">${totalInvested.toLocaleString()}</p>
        </div>
        <div className="bg-background/30 rounded-lg p-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Status</p>
          <div className="flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <p className="text-sm font-bold text-yellow-500">Active</p>
          </div>
        </div>
      </div>
      
      {/* Main Chart */}
      <div className="h-[160px] w-full">
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
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tick={{ fill: 'hsl(0, 0%, 45%)' }}
            />
            <YAxis 
              stroke="hsl(0, 0%, 45%)" 
              fontSize={10}
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
                padding: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-background/95 border border-border rounded-xl p-3 shadow-xl text-xs">
                      <p className="text-muted-foreground mb-2 font-medium">{d.date}</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between gap-6">
                          <span className="text-muted-foreground">Portfolio:</span>
                          <span className="font-mono font-bold text-foreground">${d.value.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                          <span className="text-green-400">Profit:</span>
                          <span className="font-mono font-bold text-green-400">+${d.profit.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-6">
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
      <div className="h-[40px] w-full mt-2">
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
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Portfolio Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-emerald-500 rounded-full" />
            <span className="text-muted-foreground">Profit Trend</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <BarChart2 className="w-3 h-3" />
          <span>Last 30 days • Live</span>
        </div>
      </div>
    </div>
  );
};

export default InvestmentChart;
