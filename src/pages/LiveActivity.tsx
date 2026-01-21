import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Globe, ArrowLeft, Users, DollarSign, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WorldMapVisualization from '@/components/WorldMapVisualization';

// User data - all amounts will be in USD
const allUsers = [
  // United States
  { name: "Liam", country: "United States", flag: "🇺🇸" },
  { name: "Olivia", country: "United States", flag: "🇺🇸" },
  { name: "Noah", country: "United States", flag: "🇺🇸" },
  { name: "Emma", country: "United States", flag: "🇺🇸" },
  { name: "James", country: "United States", flag: "🇺🇸" },
  { name: "Charlotte", country: "United States", flag: "🇺🇸" },
  
  // Russia
  { name: "Dmitri", country: "Russia", flag: "🇷🇺" },
  { name: "Anastasia", country: "Russia", flag: "🇷🇺" },
  { name: "Mikhail", country: "Russia", flag: "🇷🇺" },
  { name: "Olga", country: "Russia", flag: "🇷🇺" },
  { name: "Sergei", country: "Russia", flag: "🇷🇺" },
  
  // Germany
  { name: "Lukas", country: "Germany", flag: "🇩🇪" },
  { name: "Anna", country: "Germany", flag: "🇩🇪" },
  { name: "Maximilian", country: "Germany", flag: "🇩🇪" },
  { name: "Sophie", country: "Germany", flag: "🇩🇪" },
  
  // United Kingdom
  { name: "Oliver", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Amelia", country: "United Kingdom", flag: "🇬🇧" },
  { name: "George", country: "United Kingdom", flag: "🇬🇧" },
  { name: "Grace", country: "United Kingdom", flag: "🇬🇧" },
  
  // France
  { name: "Gabriel", country: "France", flag: "🇫🇷" },
  { name: "Léa", country: "France", flag: "🇫🇷" },
  { name: "Louis", country: "France", flag: "🇫🇷" },
  { name: "Chloé", country: "France", flag: "🇫🇷" },
  
  // Hungary
  { name: "Bence", country: "Hungary", flag: "🇭🇺" },
  { name: "Eszter", country: "Hungary", flag: "🇭🇺" },
  { name: "Levente", country: "Hungary", flag: "🇭🇺" },
  
  // Netherlands
  { name: "Daan", country: "Netherlands", flag: "🇳🇱" },
  { name: "Lotte", country: "Netherlands", flag: "🇳🇱" },
  { name: "Sem", country: "Netherlands", flag: "🇳🇱" },
  
  // Norway
  { name: "Lars", country: "Norway", flag: "🇳🇴" },
  { name: "Ingrid", country: "Norway", flag: "🇳🇴" },
  { name: "Magnus", country: "Norway", flag: "🇳🇴" },
  
  // Poland
  { name: "Jakub", country: "Poland", flag: "🇵🇱" },
  { name: "Zuzanna", country: "Poland", flag: "🇵🇱" },
  { name: "Kacper", country: "Poland", flag: "🇵🇱" },
  
  // Kenya
  { name: "Njeri", country: "Kenya", flag: "🇰🇪" },
  { name: "Kamau", country: "Kenya", flag: "🇰🇪" },
  { name: "Wambui", country: "Kenya", flag: "🇰🇪" },
  
  // Nigeria
  { name: "Chukwuemeka", country: "Nigeria", flag: "🇳🇬" },
  { name: "Adaeze", country: "Nigeria", flag: "🇳🇬" },
  { name: "Oluwaseun", country: "Nigeria", flag: "🇳🇬" },
  
  // UAE
  { name: "Ahmed", country: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Fatima", country: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Khalid", country: "United Arab Emirates", flag: "🇦🇪" },
  
  // Kuwait
  { name: "Mohammad", country: "Kuwait", flag: "🇰🇼" },
  { name: "Sara", country: "Kuwait", flag: "🇰🇼" },
  { name: "Yousef", country: "Kuwait", flag: "🇰🇼" },
  
  // Japan
  { name: "Haruto", country: "Japan", flag: "🇯🇵" },
  { name: "Yui", country: "Japan", flag: "🇯🇵" },
  { name: "Sota", country: "Japan", flag: "🇯🇵" },
  
  // China
  { name: "Wei", country: "China", flag: "🇨🇳" },
  { name: "Xiaoming", country: "China", flag: "🇨🇳" },
  { name: "Jing", country: "China", flag: "🇨🇳" },
  
  // Brazil
  { name: "Miguel", country: "Brazil", flag: "🇧🇷" },
  { name: "Helena", country: "Brazil", flag: "🇧🇷" },
  { name: "Arthur", country: "Brazil", flag: "🇧🇷" },
  
  // Canada
  { name: "Ethan", country: "Canada", flag: "🇨🇦" },
  { name: "Sophia", country: "Canada", flag: "🇨🇦" },
  { name: "Mason", country: "Canada", flag: "🇨🇦" },
  
  // Australia
  { name: "Jack", country: "Australia", flag: "🇦🇺" },
  { name: "Chloe", country: "Australia", flag: "🇦🇺" },
  { name: "William", country: "Australia", flag: "🇦🇺" },
  
  // India
  { name: "Aarav", country: "India", flag: "🇮🇳" },
  { name: "Ananya", country: "India", flag: "🇮🇳" },
  { name: "Vihaan", country: "India", flag: "🇮🇳" },
  
  // South Africa
  { name: "Thabo", country: "South Africa", flag: "🇿🇦" },
  { name: "Naledi", country: "South Africa", flag: "🇿🇦" },
  { name: "Sipho", country: "South Africa", flag: "🇿🇦" },
  
  // Saudi Arabia
  { name: "Abdullah", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Fatimah", country: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Omar", country: "Saudi Arabia", flag: "🇸🇦" },
  
  // Singapore
  { name: "Jia Wei", country: "Singapore", flag: "🇸🇬" },
  { name: "Hui Ling", country: "Singapore", flag: "🇸🇬" },
  { name: "Wei Ming", country: "Singapore", flag: "🇸🇬" },
  
  // Switzerland
  { name: "Luca", country: "Switzerland", flag: "🇨🇭" },
  { name: "Elena", country: "Switzerland", flag: "🇨🇭" },
  { name: "Noah", country: "Switzerland", flag: "🇨🇭" },
  
  // Sweden
  { name: "Oscar", country: "Sweden", flag: "🇸🇪" },
  { name: "Maja", country: "Sweden", flag: "🇸🇪" },
  { name: "Elias", country: "Sweden", flag: "🇸🇪" },
];

interface ActivityItem {
  id: string;
  name: string;
  country: string;
  flag: string;
  amount: string;
  type: 'investment' | 'withdrawal';
  timestamp: Date;
}

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getRandomAmount = (): number => {
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
      return Math.floor(Math.random() * (range.max - range.min) + range.min);
    }
  }
  
  return ranges[0].min;
};

const formatTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const LiveActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalWithdrawn: 0,
    activeUsers: 0,
    countries: 0,
  });
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

  const generateActivity = (): ActivityItem => {
    const user = getUniqueUser();
    const amount = getRandomAmount();
    const isWithdrawal = Math.random() > 0.65;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      country: user.country,
      flag: user.flag,
      amount: formatAmount(amount),
      type: isWithdrawal ? 'withdrawal' : 'investment',
      timestamp: new Date(),
    };
  };

  // Initialize with some activities
  useEffect(() => {
    const initialActivities: ActivityItem[] = [];
    for (let i = 0; i < 15; i++) {
      const activity = generateActivity();
      activity.timestamp = new Date(Date.now() - i * 45000); // Space them out
      initialActivities.push(activity);
    }
    setActivities(initialActivities);

    // Update stats
    const uniqueCountries = new Set(initialActivities.map(a => a.country)).size;
    setStats({
      totalInvested: initialActivities.filter(a => a.type === 'investment').length * 50000,
      totalWithdrawn: initialActivities.filter(a => a.type === 'withdrawal').length * 25000,
      activeUsers: initialActivities.length,
      countries: uniqueCountries,
    });
  }, []);

  // Add new activities periodically
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 49)]; // Keep max 50 activities
        return updated;
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalInvested: newActivity.type === 'investment' 
          ? prev.totalInvested + parseInt(newActivity.amount.replace(/[^0-9]/g, ''))
          : prev.totalInvested,
        totalWithdrawn: newActivity.type === 'withdrawal'
          ? prev.totalWithdrawn + parseInt(newActivity.amount.replace(/[^0-9]/g, ''))
          : prev.totalWithdrawn,
        activeUsers: prev.activeUsers + 1,
      }));
    }, 4000); // New activity every 4 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update timestamps
  useEffect(() => {
    const timestampInterval = setInterval(() => {
      setActivities(prev => [...prev]);
    }, 10000);

    return () => clearInterval(timestampInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        {/* Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Live Activity Feed</h1>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-muted-foreground">Real-time investments and withdrawals from around the world</p>
            </div>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Total Invested</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                ${(stats.totalInvested / 1000000).toFixed(1)}M+
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">Total Withdrawn</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                ${(stats.totalWithdrawn / 1000000).toFixed(1)}M+
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-muted-foreground">Active Users</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.activeUsers.toLocaleString()}+
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 sm:p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Globe className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-muted-foreground">Countries</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.countries}+
              </p>
            </motion.div>
          </div>

          {/* World Map Visualization */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Global Activity Map</h2>
            </div>
            <WorldMapVisualization />
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
            
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="p-4 sm:px-6 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Flag */}
                      <div className="flex-shrink-0 text-2xl sm:text-3xl">
                        {activity.flag}
                      </div>
                      
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        activity.type === 'withdrawal' 
                          ? 'bg-emerald-500/10' 
                          : 'bg-green-500/10'
                      }`}>
                        {activity.type === 'withdrawal' ? (
                          <TrendingDown className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          <span className="font-semibold">{activity.name}</span>
                          <span className="text-muted-foreground"> from </span>
                          <span>{activity.country}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.type === 'withdrawal' ? 'Withdrew' : 'Invested'}{' '}
                          <span className={activity.type === 'withdrawal' ? 'text-emerald-500' : 'text-green-500'}>
                            {activity.amount}
                          </span>
                        </p>
                      </div>
                      
                      {/* Time */}
                      <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LiveActivity;
