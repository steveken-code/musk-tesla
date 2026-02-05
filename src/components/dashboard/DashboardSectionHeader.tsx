import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  color?: 'primary' | 'blue' | 'green';
}

const DashboardSectionHeader = ({ title, subtitle, icon: Icon, action, color = 'blue' }: DashboardSectionHeaderProps) => {
  const colorClasses = {
    primary: {
      gradient: 'from-primary/20 to-electric-blue/10',
      icon: 'text-primary',
      line: 'from-primary via-electric-blue to-transparent'
    },
    blue: {
      gradient: 'from-electric-blue/20 to-blue-500/10',
      icon: 'text-electric-blue',
      line: 'from-electric-blue via-blue-400 to-transparent'
    },
    green: {
      gradient: 'from-green-500/20 to-emerald-500/10',
      icon: 'text-green-500',
      line: 'from-green-500 via-emerald-400 to-transparent'
    }
  };
  
  const colors = colorClasses[color];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-4 sm:mb-5"
    >
      <div className="flex items-center gap-3">
        {/* Decorative gradient line */}
        <div className={`hidden sm:block w-1 h-8 rounded-full bg-gradient-to-b ${colors.line}`} />
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors.gradient}`}>
                <Icon className={`w-4 h-4 ${colors.icon}`} />
              </div>
            )}
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-foreground">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 ml-0 sm:ml-8">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </motion.div>
  );
};

export default DashboardSectionHeader;
