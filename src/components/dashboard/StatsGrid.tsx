import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Clock, CheckCircle, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'primary' | 'green' | 'yellow' | 'blue';
  index: number;
}

const colorVariants = {
  primary: {
    bg: 'bg-primary/10',
    iconColor: 'text-primary',
    hoverBorder: 'hover:border-primary/40',
    glowColor: 'group-hover:shadow-primary/10',
  },
  green: {
    bg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    hoverBorder: 'hover:border-green-500/40',
    glowColor: 'group-hover:shadow-green-500/10',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    iconColor: 'text-yellow-500',
    hoverBorder: 'hover:border-yellow-500/40',
    glowColor: 'group-hover:shadow-yellow-500/10',
  },
  blue: {
    bg: 'bg-electric-blue/10',
    iconColor: 'text-electric-blue',
    hoverBorder: 'hover:border-electric-blue/40',
    glowColor: 'group-hover:shadow-electric-blue/10',
  },
};

const StatCard = ({ icon: Icon, label, value, subValue, color, index }: StatCardProps) => {
  const colors = colorVariants[color];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`group relative bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3.5 sm:p-4 transition-all duration-300 cursor-default ${colors.hoverBorder} hover:shadow-xl ${colors.glowColor}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-transparent via-transparent to-${color === 'primary' ? 'primary' : color === 'green' ? 'green-500' : color === 'yellow' ? 'yellow-500' : 'electric-blue'}/5 pointer-events-none`} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2.5">
          <div className={`p-2 rounded-lg ${colors.bg} ring-1 ring-inset ring-white/5`}>
            <Icon className={`w-4 h-4 ${colors.iconColor}`} />
          </div>
          <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">{label}</span>
        </div>
        <p className={`text-lg sm:text-xl md:text-2xl font-bold ${color === 'green' ? 'text-green-500' : 'text-foreground'}`}>
          {value}
        </p>
        {subValue && (
          <p className="text-[10px] text-green-400 mt-0.5 font-medium">{subValue}</p>
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
      color: 'primary' as const,
    },
    {
      icon: TrendingUp,
      label: t('totalProfit'),
      value: `$${formatValue(totalProfit)}`,
      subValue: totalInvested > 0 ? `↑ ${((totalProfit / totalInvested) * 100).toFixed(1)}%` : undefined,
      color: 'green' as const,
    },
    {
      icon: Clock,
      label: t('pending'),
      value: `$${formatValue(pendingAmount)}`,
      color: 'yellow' as const,
    },
    {
      icon: CheckCircle,
      label: t('active'),
      value: activeCount,
      color: 'blue' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  );
};

export default StatsGrid;
