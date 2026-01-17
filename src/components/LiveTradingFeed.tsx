import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Shield, BarChart3, Activity, Zap, Target, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TradingActivity {
  id: string;
  type: 'trade_open' | 'trade_close' | 'profit_secured' | 'rebalance' | 'analysis' | 'target_reached';
  message: string;
  details?: string;
  profit?: number;
  timestamp: Date;
}

const activityTemplates = [
  { type: 'trade_open', messages: [
    'Expert trader opened TSLA long position',
    'New strategic position initiated',
    'Market opportunity identified - position opened',
    'Bullish signal confirmed - trade executed',
  ]},
  { type: 'trade_close', messages: [
    'Trade closed successfully',
    'Position closed at target price',
    'Strategic exit executed',
    'Trade completed with profit target',
  ]},
  { type: 'profit_secured', messages: [
    'Profit secured from TSLA movement',
    'Gains locked in - funds protected',
    'Profit target achieved',
    'Returns captured successfully',
  ]},
  { type: 'rebalance', messages: [
    'Portfolio rebalanced for optimal returns',
    'Risk-adjusted allocation updated',
    'Portfolio optimization completed',
    'Asset allocation refined',
  ]},
  { type: 'analysis', messages: [
    'Real-time market analysis completed',
    'Technical indicators analyzed',
    'Market conditions assessed - favorable',
    'Risk assessment completed - stable',
  ]},
  { type: 'target_reached', messages: [
    'Price target reached',
    'Profit milestone achieved',
    'Performance benchmark exceeded',
    'Trading goal accomplished',
  ]},
] as const;

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'trade_open': return TrendingUp;
    case 'trade_close': return TrendingDown;
    case 'profit_secured': return Target;
    case 'rebalance': return RefreshCw;
    case 'analysis': return BarChart3;
    case 'target_reached': return Zap;
    default: return Activity;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'trade_open': return 'text-green-400 bg-green-500/20';
    case 'trade_close': return 'text-blue-400 bg-blue-500/20';
    case 'profit_secured': return 'text-emerald-400 bg-emerald-500/20';
    case 'rebalance': return 'text-amber-400 bg-amber-500/20';
    case 'analysis': return 'text-purple-400 bg-purple-500/20';
    case 'target_reached': return 'text-cyan-400 bg-cyan-500/20';
    default: return 'text-muted-foreground bg-muted/20';
  }
};

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 30) return 'Just now';
  if (seconds < 60) return '30s ago';
  if (seconds < 90) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
};

const generateActivity = (): TradingActivity => {
  const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
  const message = template.messages[Math.floor(Math.random() * template.messages.length)];
  
  const activity: TradingActivity = {
    id: crypto.randomUUID(),
    type: template.type as TradingActivity['type'],
    message,
    timestamp: new Date(),
  };

  if (template.type === 'profit_secured' || template.type === 'trade_close') {
    activity.profit = Math.floor(Math.random() * 2500) + 150;
    activity.details = `+$${activity.profit.toLocaleString()}`;
  }

  if (template.type === 'target_reached') {
    const percentage = (Math.random() * 3 + 0.5).toFixed(1);
    activity.details = `+${percentage}%`;
  }

  return activity;
};

const LiveTradingFeed = () => {
  const [activities, setActivities] = useState<TradingActivity[]>(() => {
    // Generate initial activities with staggered timestamps
    const initial: TradingActivity[] = [];
    for (let i = 0; i < 5; i++) {
      const activity = generateActivity();
      activity.timestamp = new Date(Date.now() - (i * 45000 + Math.random() * 30000));
      initial.push(activity);
    }
    return initial.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  });
  
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Add new activity every 8-15 seconds
    const addActivity = () => {
      if (!isLive) return;
      
      const newActivity = generateActivity();
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 8);
        return updated;
      });
    };

    intervalRef.current = setInterval(addActivity, 8000 + Math.random() * 7000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive]);

  // Update timestamps every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActivities(prev => [...prev]);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-4 sm:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base">Expert Trading Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-medium text-green-400">LIVE</span>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/70">
        <AnimatePresence mode="popLayout">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-background/40 border border-border/30 hover:border-border/50 transition-colors"
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight truncate">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    {activity.details && (
                      <span className="text-xs font-semibold text-green-400">
                        {activity.details}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Managed by certified experts
          </span>
          <span>24/7 Active Trading</span>
        </div>
      </div>
    </div>
  );
};

export default LiveTradingFeed;
