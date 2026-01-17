import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, TrendingUp } from 'lucide-react';

type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed';

interface MarketInfo {
  session: MarketSession;
  label: string;
  nextEvent: string;
  timeRemaining: string;
  isActive: boolean;
}

const getMarketInfo = (): MarketInfo => {
  const now = new Date();
  
  // Convert to EST
  const estOffset = -5;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const est = new Date(utc + 3600000 * estOffset);
  
  const day = est.getDay();
  const hours = est.getHours();
  const minutes = est.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  // Weekend - market closed
  if (day === 0 || day === 6) {
    const daysUntilMonday = day === 0 ? 1 : 2;
    return {
      session: 'closed',
      label: 'Market Closed',
      nextEvent: 'Opens Monday 9:30 AM EST',
      timeRemaining: `${daysUntilMonday}d until open`,
      isActive: false,
    };
  }

  // Pre-market: 4:00 AM - 9:30 AM EST
  if (currentMinutes >= 240 && currentMinutes < 570) {
    const remainingMinutes = 570 - currentMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    return {
      session: 'pre-market',
      label: 'Pre-Market',
      nextEvent: 'Regular session at 9:30 AM',
      timeRemaining: `${remainingHours}h ${remainingMins}m`,
      isActive: true,
    };
  }

  // Regular session: 9:30 AM - 4:00 PM EST
  if (currentMinutes >= 570 && currentMinutes < 960) {
    const remainingMinutes = 960 - currentMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    return {
      session: 'regular',
      label: 'Market Open',
      nextEvent: 'Closes at 4:00 PM EST',
      timeRemaining: `${remainingHours}h ${remainingMins}m remaining`,
      isActive: true,
    };
  }

  // After-hours: 4:00 PM - 8:00 PM EST
  if (currentMinutes >= 960 && currentMinutes < 1200) {
    const remainingMinutes = 1200 - currentMinutes;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMins = remainingMinutes % 60;
    return {
      session: 'after-hours',
      label: 'After Hours',
      nextEvent: 'Extended trading ends 8:00 PM',
      timeRemaining: `${remainingHours}h ${remainingMins}m`,
      isActive: true,
    };
  }

  // Market closed (overnight)
  const isFriday = day === 5;
  if (isFriday && currentMinutes >= 1200) {
    return {
      session: 'closed',
      label: 'Market Closed',
      nextEvent: 'Opens Monday 9:30 AM EST',
      timeRemaining: '2d until open',
      isActive: false,
    };
  }

  // Overnight - calculate time until pre-market at 4 AM
  let minutesUntilPremarket: number;
  if (currentMinutes < 240) {
    minutesUntilPremarket = 240 - currentMinutes;
  } else {
    minutesUntilPremarket = (24 * 60 - currentMinutes) + 240;
  }
  const hoursUntil = Math.floor(minutesUntilPremarket / 60);
  const minsUntil = minutesUntilPremarket % 60;

  return {
    session: 'closed',
    label: 'Market Closed',
    nextEvent: 'Pre-market opens 4:00 AM EST',
    timeRemaining: `${hoursUntil}h ${minsUntil}m`,
    isActive: false,
  };
};

const getSessionStyles = (session: MarketSession) => {
  switch (session) {
    case 'regular':
      return {
        gradient: 'from-green-500/20 to-emerald-500/20',
        border: 'border-green-500/30',
        dot: 'bg-green-500',
        text: 'text-green-400',
        icon: TrendingUp,
      };
    case 'pre-market':
      return {
        gradient: 'from-amber-500/20 to-orange-500/20',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
        text: 'text-amber-400',
        icon: Sun,
      };
    case 'after-hours':
      return {
        gradient: 'from-blue-500/20 to-indigo-500/20',
        border: 'border-blue-500/30',
        dot: 'bg-blue-500',
        text: 'text-blue-400',
        icon: Moon,
      };
    case 'closed':
    default:
      return {
        gradient: 'from-gray-500/20 to-slate-500/20',
        border: 'border-gray-500/30',
        dot: 'bg-gray-500',
        text: 'text-gray-400',
        icon: Clock,
      };
  }
};

const MarketStatusWidget = () => {
  const [marketInfo, setMarketInfo] = useState<MarketInfo>(getMarketInfo);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketInfo(getMarketInfo());
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const styles = getSessionStyles(marketInfo.session);
  const Icon = styles.icon;

  // Format current time in EST
  const formatEstTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className={`bg-gradient-to-br ${styles.gradient} backdrop-blur-xl border ${styles.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${styles.gradient} border ${styles.border}`}>
            <Icon className={`w-4 h-4 ${styles.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{marketInfo.label}</span>
              {marketInfo.isActive && (
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.dot} opacity-75`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">NYSE • NASDAQ</span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-mono font-semibold ${styles.text}`}>{formatEstTime()}</p>
          <p className="text-xs text-muted-foreground">EST</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{marketInfo.nextEvent}</span>
          <span className={`font-medium ${styles.text}`}>{marketInfo.timeRemaining}</span>
        </div>
        
        {/* Progress bar for regular session */}
        {marketInfo.session === 'regular' && (
          <div className="h-1.5 bg-background/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ 
                width: `${Math.min(100, (1 - parseInt(marketInfo.timeRemaining) / 390) * 100)}%` 
              }}
            />
          </div>
        )}
      </div>

      {/* Trading status message */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground">
          {marketInfo.isActive 
            ? '✓ Your investments are being actively managed' 
            : '• Trading resumes when market opens'}
        </p>
      </div>
    </div>
  );
};

export default MarketStatusWidget;
