import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp } from 'lucide-react';

// Simulated Tesla stock data
const generateTeslaData = () => {
  const data = [];
  let price = 248;
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic price movement
    const change = (Math.random() - 0.45) * 8;
    price = Math.max(200, Math.min(320, price + change));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Math.round(price * 100) / 100,
    });
  }
  
  return data;
};

const TeslaChart = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(generateTeslaData);
  const [currentPrice, setCurrentPrice] = useState(data[data.length - 1].price);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    // Update price every 5 seconds for live feel
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        const lastPrice = newData[newData.length - 1].price;
        const change = (Math.random() - 0.48) * 2;
        const newPrice = Math.max(200, Math.min(320, lastPrice + change));
        
        newData[newData.length - 1] = {
          ...newData[newData.length - 1],
          price: Math.round(newPrice * 100) / 100,
        };
        
        setCurrentPrice(newPrice);
        setPriceChange(change);
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isPositive = priceChange >= 0;

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-tesla-red" />
          {t('teslaStock')}
        </h2>
        <div className="text-right">
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%)
          </p>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(0, 0%, 65%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(0, 0%, 65%)" 
              fontSize={12}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 10%)', 
                border: '1px solid hsl(0, 0%, 20%)',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(0, 0%, 98%)' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'TSLA']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(0, 72%, 51%)" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeslaChart;
