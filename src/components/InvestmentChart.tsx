import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp } from 'lucide-react';

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

  const chartData = useMemo(() => {
    const activeInvestments = investments.filter(i => i.status === 'active' || i.status === 'completed');
    
    if (activeInvestments.length === 0) return [];

    // Generate chart data based on investments
    const totalInvested = activeInvestments.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalProfit = activeInvestments.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);
    
    // Create 30-day performance data
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate gradual profit accumulation
      const dayProgress = (30 - i) / 30;
      const currentProfit = totalProfit * dayProgress;
      const dailyFluctuation = (Math.random() - 0.5) * (totalProfit * 0.05);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round((totalInvested + currentProfit + dailyFluctuation) * 100) / 100,
        profit: Math.round(currentProfit * 100) / 100,
      });
    }
    
    return data;
  }, [investments]);

  const totalValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const totalProfit = chartData.length > 0 ? chartData[chartData.length - 1].profit : 0;
  const percentGain = totalValue > 0 ? ((totalProfit / (totalValue - totalProfit)) * 100) : 0;

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          {t('performanceChart')}
        </h2>
        <div className="text-right">
          <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          <p className="text-sm text-green-500">
            +${totalProfit.toLocaleString()} (+{percentGain.toFixed(2)}%)
          </p>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(120, 60%, 45%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(120, 60%, 45%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(0, 0%, 65%)" 
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(0, 0%, 65%)" 
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 10%)', 
                border: '1px solid hsl(0, 0%, 20%)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio']}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(120, 60%, 45%)" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentChart;
