import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

const DashboardSectionHeader = ({ title, subtitle, icon: Icon, action }: DashboardSectionHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between mb-4 sm:mb-5"
    >
      <div className="flex items-center gap-3">
        {/* Decorative gradient line */}
        <div className="hidden sm:block w-1 h-8 rounded-full bg-gradient-to-b from-primary via-electric-blue to-transparent" />
        <div>
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-electric-blue/10">
                <Icon className="w-4 h-4 text-primary" />
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
