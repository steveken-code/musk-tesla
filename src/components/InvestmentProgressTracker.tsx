import { useMemo } from 'react';
import { Check, Clock, TrendingUp, Wallet, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
}

interface InvestmentProgressTrackerProps {
  investments: Investment[];
}

interface ProgressStep {
  id: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'current' | 'upcoming';
}

const InvestmentProgressTracker = ({ investments }: InvestmentProgressTrackerProps) => {
  const progressData = useMemo(() => {
    const hasInvestments = investments.length > 0;
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const completedInvestments = investments.filter(inv => inv.status === 'completed');
    const hasActiveInvestment = activeInvestments.length > 0;
    const hasCompletedInvestment = completedInvestments.length > 0;
    const totalProfit = investments.reduce((sum, inv) => sum + (inv.profit_amount || 0), 0);
    const hasProfits = totalProfit > 0;
    const totalAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const canWithdraw = totalProfit >= 50; // Minimum withdrawal

    // Determine current trading state - prioritize active over completed
    const isCurrentlyTrading = hasActiveInvestment;
    const hasEverCompleted = hasCompletedInvestment;
    const completedCount = completedInvestments.length;

    const steps: ProgressStep[] = [
      {
        id: 1,
        label: 'Funds Deposited',
        description: hasInvestments 
          ? `$${totalAmount.toLocaleString()} total invested` 
          : 'Awaiting deposit',
        icon: DollarSign,
        status: hasInvestments ? 'completed' : 'current',
      },
      {
        id: 2,
        label: 'Investment Active',
        description: isCurrentlyTrading 
          ? `${activeInvestments.length} active position${activeInvestments.length > 1 ? 's' : ''}` 
          : hasEverCompleted 
          ? `${completedCount} trade${completedCount > 1 ? 's' : ''} completed`
          : 'Pending activation',
        icon: Clock,
        status: (isCurrentlyTrading || hasEverCompleted) ? 'completed' : hasInvestments ? 'current' : 'upcoming',
      },
      {
        id: 3,
        label: isCurrentlyTrading ? 'Trading in Progress' : (hasEverCompleted ? 'Trade Closed' : 'Trading'),
        description: isCurrentlyTrading 
          ? 'Experts managing portfolio' 
          : hasEverCompleted 
          ? `${completedCount} trade${completedCount > 1 ? 's' : ''} completed successfully`
          : 'Will start upon activation',
        icon: isCurrentlyTrading ? TrendingUp : (hasEverCompleted ? Check : TrendingUp),
        status: isCurrentlyTrading ? 'current' : (hasEverCompleted ? 'completed' : 'upcoming'),
      },
      {
        id: 4,
        label: 'Profits Generated',
        description: hasProfits 
          ? `+$${totalProfit.toLocaleString()} total earned` 
          : isCurrentlyTrading 
          ? 'Accumulating returns...'
          : 'After trading completes',
        icon: DollarSign,
        status: hasProfits ? 'completed' : (isCurrentlyTrading ? 'current' : 'upcoming'),
      },
      {
        id: 5,
        label: 'Ready for Withdrawal',
        description: canWithdraw 
          ? 'Funds available to withdraw' 
          : hasProfits ? 'Min. $50 required' : 'After profits accumulate',
        icon: Wallet,
        status: canWithdraw ? 'completed' : 'upcoming',
      },
    ];

    return { steps, totalProfit, hasActiveInvestment, hasCompletedInvestment };
  }, [investments]);

  const getStepStyles = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 border-green-500',
          icon: 'text-white',
          line: 'bg-green-500',
          label: 'text-foreground',
          description: 'text-green-400',
        };
      case 'current':
        return {
          circle: 'bg-amber-500/20 border-amber-500 animate-pulse',
          icon: 'text-amber-400',
          line: 'bg-gradient-to-b from-green-500 to-border',
          label: 'text-foreground font-semibold',
          description: 'text-amber-400',
        };
      case 'upcoming':
      default:
        return {
          circle: 'bg-muted/30 border-border',
          icon: 'text-muted-foreground',
          line: 'bg-border',
          label: 'text-muted-foreground',
          description: 'text-muted-foreground/70',
        };
    }
  };

  return (
    <div className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-xl p-4 sm:p-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">Investment Progress</h3>
        </div>
        {progressData.hasActiveInvestment && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
            Active
          </span>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex-1 space-y-0 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full">
        {progressData.steps.map((step, index) => {
          const styles = getStepStyles(step.status);
          const Icon = step.icon;
          const isLast = index === progressData.steps.length - 1;

          return (
            <div key={step.id} className="flex gap-3">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${styles.circle}`}
                >
                  {step.status === 'completed' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className={`w-4 h-4 ${styles.icon}`} />
                  )}
                </motion.div>
                {!isLast && (
                  <div className={`w-0.5 h-8 ${styles.line}`} />
                )}
              </div>

              {/* Step content */}
              <div className="pb-6">
                <p className={`text-sm ${styles.label}`}>{step.label}</p>
                <p className={`text-xs mt-0.5 ${styles.description}`}>{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {progressData.totalProfit > 0 && (
        <div className="mt-2 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Earnings</span>
            <span className="text-sm font-bold text-green-400">
              +${progressData.totalProfit.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentProgressTracker;
