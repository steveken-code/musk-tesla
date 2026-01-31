import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, CheckCircle, LucideIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Animated counter component with eased animation
interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedCounter = ({ end, duration = 1500, prefix = "", suffix = "", decimals = 0 }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Eased progress (ease-out-cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      countRef.current = easedProgress * end;
      setCount(countRef.current);
      
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [end, duration]);

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <span>
      {prefix}{formattedValue}{suffix}
    </span>
  );
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  numericValue?: number;
  subValue?: string;
  color: 'primary' | 'green' | 'yellow' | 'blue';
  index: number;
  isMonetary?: boolean;
}

const colorVariants = {
  primary: {
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary/50',
    glowColor: 'group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]',
    gradientFrom: 'from-primary/20',
    gradientTo: 'to-transparent',
  },
  green: {
    bg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    hoverBorder: 'hover:border-green-500/50',
    glowColor: 'group-hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-transparent',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    hoverBorder: 'hover:border-yellow-500/50',
    glowColor: 'group-hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
    gradientFrom: 'from-yellow-500/20',
    gradientTo: 'to-transparent',
  },
  blue: {
    bg: 'bg-electric-blue/10',
    iconColor: 'text-electric-blue',
    hoverBorder: 'hover:border-electric-blue/50',
    glowColor: 'group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    gradientFrom: 'from-electric-blue/20',
    gradientTo: 'to-transparent',
  },
};

const StatCard = ({ icon: Icon, label, value, numericValue, subValue, color, index, isMonetary = false }: StatCardProps) => {
  const colors = colorVariants[color];
  const shouldAnimate = typeof numericValue === 'number' && numericValue > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group relative bg-card/80 backdrop-blur-sm border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-default ${colors.hoverBorder} hover:shadow-xl ${colors.glowColor}`}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo} pointer-events-none`} />
      
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          <motion.div 
            className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${colors.bg} ring-1 ring-inset ring-white/5`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${colors.iconColor}`} />
          </motion.div>
          <span className="text-muted-foreground text-[9px] sm:text-[10px] md:text-xs font-medium truncate">{label}</span>
        </div>
        <p className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate ${color === 'green' ? 'text-green-500' : 'text-foreground'}`}>
          {shouldAnimate ? (
            <AnimatedCounter 
              end={numericValue} 
              prefix={isMonetary ? "$" : ""} 
              duration={1800 + (index * 200)}
            />
          ) : (
            value
          )}
        </p>
        {subValue && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
            className="text-[9px] sm:text-[10px] text-green-400 mt-0.5 font-medium"
          >
            {subValue}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

interface StatsGridProps {
  totalInvested: number;
  totalProfit: number;
  pendingAmount: number;
  activeCount: number;
  formatValue: (value: number) => string;
  t: (key: string) => string;
}

const StatsGrid = ({ 
  totalInvested, 
  totalProfit, 
  pendingAmount, 
  activeCount,
  formatValue,
  t 
}: StatsGridProps) => {
  const stats = [
    {
      icon: DollarSign,
      label: t('totalInvested'),
      value: `$${formatValue(totalInvested)}`,
      numericValue: totalInvested,
      color: 'primary' as const,
      isMonetary: true,
    },
    {
      icon: TrendingUp,
      label: t('totalProfit'),
      value: `$${formatValue(totalProfit)}`,
      numericValue: totalProfit,
      subValue: totalInvested > 0 ? `↑ ${((totalProfit / totalInvested) * 100).toFixed(1)}%` : undefined,
      color: 'green' as const,
      isMonetary: true,
    },
    {
      icon: Clock,
      label: t('pending'),
      value: `$${formatValue(pendingAmount)}`,
      numericValue: pendingAmount,
      color: 'yellow' as const,
      isMonetary: true,
    },
    {
      icon: CheckCircle,
      label: t('active'),
      value: activeCount,
      numericValue: activeCount,
      color: 'blue' as const,
      isMonetary: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-2.5 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  );
};

export default StatsGrid;
