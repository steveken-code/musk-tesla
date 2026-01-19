import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Country coordinates (approximate center points on a normalized map 0-100%)
const countryCoordinates: Record<string, { x: number; y: number }> = {
  "United States": { x: 20, y: 40 },
  "Canada": { x: 22, y: 30 },
  "Brazil": { x: 32, y: 65 },
  "Argentina": { x: 30, y: 78 },
  "United Kingdom": { x: 47, y: 32 },
  "France": { x: 49, y: 38 },
  "Germany": { x: 52, y: 35 },
  "Spain": { x: 46, y: 42 },
  "Italy": { x: 53, y: 42 },
  "Netherlands": { x: 50, y: 33 },
  "Norway": { x: 52, y: 25 },
  "Sweden": { x: 55, y: 26 },
  "Poland": { x: 55, y: 34 },
  "Hungary": { x: 55, y: 38 },
  "Switzerland": { x: 51, y: 38 },
  "Russia": { x: 70, y: 28 },
  "China": { x: 78, y: 40 },
  "Japan": { x: 88, y: 40 },
  "South Korea": { x: 85, y: 42 },
  "India": { x: 72, y: 48 },
  "Singapore": { x: 78, y: 58 },
  "Australia": { x: 85, y: 72 },
  "New Zealand": { x: 92, y: 78 },
  "South Africa": { x: 57, y: 72 },
  "Nigeria": { x: 52, y: 55 },
  "Kenya": { x: 60, y: 58 },
  "Egypt": { x: 57, y: 45 },
  "United Arab Emirates": { x: 65, y: 48 },
  "Saudi Arabia": { x: 62, y: 48 },
  "Kuwait": { x: 63, y: 45 },
  "Israel": { x: 58, y: 44 },
  "Turkey": { x: 58, y: 40 },
  "Mexico": { x: 18, y: 50 },
  "Colombia": { x: 28, y: 56 },
  "Chile": { x: 28, y: 75 },
  "Thailand": { x: 76, y: 52 },
  "Vietnam": { x: 78, y: 52 },
  "Malaysia": { x: 77, y: 58 },
  "Indonesia": { x: 80, y: 62 },
  "Philippines": { x: 84, y: 52 },
  "Pakistan": { x: 68, y: 45 },
  "Bangladesh": { x: 73, y: 48 },
  "Austria": { x: 53, y: 38 },
  "Belgium": { x: 49, y: 34 },
  "Denmark": { x: 52, y: 30 },
  "Finland": { x: 58, y: 24 },
  "Greece": { x: 56, y: 42 },
  "Ireland": { x: 45, y: 32 },
  "Portugal": { x: 44, y: 42 },
  "Czech Republic": { x: 53, y: 36 },
};

// User data with coordinates
const allUsers = [
  { name: "Liam", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Olivia", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Noah", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Emma", country: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "Dmitri", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Anastasia", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Mikhail", country: "Russia", currency: "RUB", flag: "🇷🇺" },
  { name: "Lukas", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Anna", country: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "Oliver", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Amelia", country: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Gabriel", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Léa", country: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Bence", country: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { name: "Daan", country: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { name: "Lars", country: "Norway", currency: "NOK", flag: "🇳🇴" },
  { name: "Jakub", country: "Poland", currency: "PLN", flag: "🇵🇱" },
  { name: "Njeri", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Kamau", country: "Kenya", currency: "KES", flag: "🇰🇪" },
  { name: "Chukwuemeka", country: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Ahmed", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Fatima", country: "United Arab Emirates", currency: "AED", flag: "🇦🇪" },
  { name: "Mohammad", country: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { name: "Haruto", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Yui", country: "Japan", currency: "JPY", flag: "🇯🇵" },
  { name: "Wei", country: "China", currency: "CNY", flag: "🇨🇳" },
  { name: "Miguel", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Helena", country: "Brazil", currency: "BRL", flag: "🇧🇷" },
  { name: "Ethan", country: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Jack", country: "Australia", currency: "AUD", flag: "🇦🇺" },
  { name: "Aarav", country: "India", currency: "INR", flag: "🇮🇳" },
  { name: "Thabo", country: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { name: "Abdullah", country: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  { name: "Jia Wei", country: "Singapore", currency: "SGD", flag: "🇸🇬" },
  { name: "Luca", country: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  { name: "Oscar", country: "Sweden", currency: "SEK", flag: "🇸🇪" },
  { name: "Sofia", country: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Marco", country: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Chen", country: "South Korea", currency: "KRW", flag: "🇰🇷" },
  { name: "Yuki", country: "Thailand", currency: "THB", flag: "🇹🇭" },
];

interface MapActivity {
  id: string;
  name: string;
  country: string;
  flag: string;
  amount: string;
  type: 'investment' | 'withdrawal';
  x: number;
  y: number;
}

const getRandomAmount = (): string => {
  const ranges = [
    { min: 100, max: 1000, weight: 15 },
    { min: 1000, max: 5000, weight: 20 },
    { min: 5000, max: 25000, weight: 25 },
    { min: 25000, max: 100000, weight: 20 },
    { min: 100000, max: 500000, weight: 12 },
    { min: 500000, max: 2000000, weight: 6 },
    { min: 2000000, max: 10000000, weight: 2 },
  ];
  
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const range of ranges) {
    random -= range.weight;
    if (random <= 0) {
      const amount = Math.floor(Math.random() * (range.max - range.min) + range.min);
      return `$${amount.toLocaleString()}`;
    }
  }
  
  return `$${ranges[0].min.toLocaleString()}`;
};

export const WorldMapVisualization = () => {
  const [activities, setActivities] = useState<MapActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<MapActivity[]>([]);
  const usedIndicesRef = useRef<Set<number>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getUniqueUser = () => {
    if (usedIndicesRef.current.size >= allUsers.length * 0.9) {
      usedIndicesRef.current.clear();
    }
    
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * allUsers.length);
    } while (usedIndicesRef.current.has(randomIndex));
    
    usedIndicesRef.current.add(randomIndex);
    return allUsers[randomIndex];
  };

  const generateActivity = (): MapActivity => {
    const user = getUniqueUser();
    const coords = countryCoordinates[user.country] || { x: 50, y: 50 };
    // Add some randomness to exact position
    const x = coords.x + (Math.random() - 0.5) * 6;
    const y = coords.y + (Math.random() - 0.5) * 6;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      country: user.country,
      flag: user.flag,
      amount: getRandomAmount(),
      type: Math.random() > 0.65 ? 'withdrawal' : 'investment',
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  useEffect(() => {
    // Generate initial activities
    const initial: MapActivity[] = [];
    for (let i = 0; i < 5; i++) {
      initial.push(generateActivity());
    }
    setActivities(initial);
    setRecentActivities(initial.slice(0, 3));

    // Add new activity every 5-10 seconds (natural timing)
    const addActivity = () => {
      const newActivity = generateActivity();
      
      setActivities(prev => {
        const updated = [...prev, newActivity];
        // Remove old activities after 8 seconds
        return updated.slice(-12);
      });
      
      setRecentActivities(prev => [newActivity, ...prev].slice(0, 5));
      
      // Random interval between 5-10 seconds
      const nextInterval = Math.floor(Math.random() * 5000) + 5000;
      intervalRef.current = setTimeout(addActivity, nextInterval);
    };

    // Start after initial delay
    intervalRef.current = setTimeout(addActivity, 3000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, []);

  // Remove old activities
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActivities(prev => prev.slice(-8));
    }, 10000);

    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative w-full">
      {/* Map Container */}
      <div className="relative w-full aspect-[2/1] sm:aspect-[2.5/1] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-white/10">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Simplified World Map SVG */}
        <svg 
          viewBox="0 0 100 50" 
          className="absolute inset-0 w-full h-full opacity-30"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* North America */}
          <path d="M5,12 L25,8 L28,15 L30,25 L25,28 L20,35 L15,32 L10,28 L5,25 Z" fill="currentColor" className="text-green-500/50"/>
          {/* South America */}
          <path d="M20,35 L28,33 L32,40 L30,48 L25,50 L20,45 L18,40 Z" fill="currentColor" className="text-green-500/50"/>
          {/* Europe */}
          <path d="M42,10 L55,8 L58,12 L60,18 L55,22 L48,20 L44,18 L42,14 Z" fill="currentColor" className="text-blue-500/50"/>
          {/* Africa */}
          <path d="M45,22 L58,20 L62,28 L58,40 L52,42 L46,38 L44,30 Z" fill="currentColor" className="text-amber-500/50"/>
          {/* Asia */}
          <path d="M58,8 L85,6 L92,18 L88,28 L78,30 L68,28 L60,22 L58,15 Z" fill="currentColor" className="text-purple-500/50"/>
          {/* Australia */}
          <path d="M78,35 L92,32 L95,40 L90,45 L82,44 L78,40 Z" fill="currentColor" className="text-red-500/50"/>
        </svg>

        {/* Activity Pins */}
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${activity.x}%`, 
                top: `${activity.y}%`,
              }}
            >
              {/* Ripple Effect */}
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  activity.type === 'investment' ? 'bg-green-500' : 'bg-emerald-400'
                }`}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              
              {/* Pin */}
              <div className={`relative z-10 w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg ${
                activity.type === 'investment' 
                  ? 'bg-green-500 shadow-green-500/50' 
                  : 'bg-emerald-400 shadow-emerald-400/50'
              }`}>
                <div className="absolute inset-0 rounded-full animate-ping opacity-75" 
                  style={{ 
                    backgroundColor: activity.type === 'investment' ? '#22c55e' : '#34d399',
                    animationDuration: '2s'
                  }}
                />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2 py-1 bg-black/90 rounded text-xs whitespace-nowrap text-white">
                  {activity.flag} {activity.name} • {activity.amount}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-4 text-xs text-white/70">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span>Investment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Withdrawal</span>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-white/90">LIVE</span>
        </div>
      </div>

      {/* Recent Activity Feed Below Map */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h3>
        <AnimatePresence mode="popLayout">
          {recentActivities.slice(0, 4).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
            >
              <span className="text-xl">{activity.flag}</span>
              <div className={`p-1.5 rounded-lg ${
                activity.type === 'investment' 
                  ? 'bg-green-500/10' 
                  : 'bg-emerald-500/10'
              }`}>
                {activity.type === 'investment' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.name} from {activity.country}
                </p>
              </div>
              <span className={`text-sm font-semibold ${
                activity.type === 'investment' ? 'text-green-500' : 'text-emerald-500'
              }`}>
                {activity.amount}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorldMapVisualization;
