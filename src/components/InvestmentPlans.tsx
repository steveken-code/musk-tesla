import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Crown, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface TierPlan {
  name: string;
  minAmount: number;
  maxAmount: number;
  profitMin: number;
  profitMax: number;
  features: string[];
}

const DEFAULT_TIERS: TierPlan[] = [
  { name: 'Starter Plan', minAmount: 500, maxAmount: 6999, profitMin: 5, profitMax: 10, features: ['Basic portfolio tracking', 'Weekly profit reports', 'Email support', 'Standard processing'] },
  { name: 'Regular Plan', minAmount: 7000, maxAmount: 14999, profitMin: 10, profitMax: 15, features: ['Advanced analytics', 'Daily profit reports', 'Priority support', 'Fast processing'] },
  { name: 'Gold Plan', minAmount: 15000, maxAmount: 999999, profitMin: 15, profitMax: 25, features: ['VIP analytics suite', 'Real-time profit tracking', 'Dedicated account manager', 'Instant processing'] },
];

const TIER_ICONS = [Award, Shield, Crown];
const TIER_COLORS = [
  { gradient: 'from-slate-600 to-slate-800', badge: 'bg-slate-500/20 text-slate-300', border: 'border-slate-600/50', glow: '' },
  { gradient: 'from-blue-700 to-blue-900', badge: 'bg-blue-500/20 text-blue-300', border: 'border-blue-500/40', glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]' },
  { gradient: 'from-amber-700 to-amber-900', badge: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/40', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]' },
];

interface InvestmentPlansProps {
  variant?: 'homepage' | 'dashboard';
  onSelectTier?: (amount: number) => void;
  selectedAmount?: number;
}

export const useTierPlans = () => {
  const [tiers, setTiers] = useState<TierPlan[]>(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'tier_plans_settings')
          .maybeSingle();

        if (!error && data?.setting_value) {
          const val = data.setting_value as any;
          if (val.tiers && Array.isArray(val.tiers)) {
            setTiers(val.tiers);
          }
        }
      } catch (err) {
        console.error('Error fetching tier plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTiers();
  }, []);

  return { tiers, loading };
};

export const getTierForAmount = (amount: number, tiers: TierPlan[]): TierPlan | null => {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (amount >= tiers[i].minAmount) return tiers[i];
  }
  return null;
};

const InvestmentPlans = ({ variant = 'homepage', onSelectTier, selectedAmount }: InvestmentPlansProps) => {
  const { tiers, loading } = useTierPlans();
  const navigate = useNavigate();
  const activeTier = selectedAmount ? getTierForAmount(selectedAmount, tiers) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className={variant === 'homepage' ? 'py-16 sm:py-24 bg-background relative' : ''}>
      {variant === 'homepage' && (
        <div className="container mx-auto px-4 mb-10 sm:mb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Investment Plans
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Choose Your Investment Tier
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Start investing from $500. The more you invest, the higher your potential returns.
            </p>
          </motion.div>
        </div>
      )}

      <div className={`${variant === 'homepage' ? 'container mx-auto px-4' : ''}`}>
        <div className={`grid grid-cols-1 ${variant === 'dashboard' ? 'sm:grid-cols-3 gap-3' : 'md:grid-cols-3 gap-5 sm:gap-6'}`}>
          {tiers.map((tier, index) => {
            const Icon = TIER_ICONS[index] || Award;
            const colors = TIER_COLORS[index] || TIER_COLORS[0];
            const isActive = activeTier?.name === tier.name;
            const isDashboard = variant === 'dashboard';

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => onSelectTier?.(tier.minAmount)}
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${colors.gradient} border ${colors.border} ${colors.glow} transition-all duration-300 ${
                  isDashboard ? 'cursor-pointer hover:scale-[1.02]' : ''
                } ${isActive ? 'ring-2 ring-electric-blue scale-[1.02]' : ''}`}
              >
                {/* Popular badge for middle tier */}
                {index === 1 && !isDashboard && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-electric-blue text-white text-xs font-bold rounded-bl-lg">
                    POPULAR
                  </div>
                )}

                <div className={isDashboard ? 'p-3' : 'p-5 sm:p-6'}>
                  {/* Icon + Name */}
                  <div className={`flex items-center gap-2.5 ${isDashboard ? 'mb-2' : 'mb-4'}`}>
                    <div className={`${isDashboard ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg ${colors.badge} flex items-center justify-center`}>
                      <Icon className={isDashboard ? 'w-4 h-4' : 'w-5 h-5'} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-white ${isDashboard ? 'text-sm' : 'text-lg'}`}>{tier.name}</h3>
                      {isActive && isDashboard && (
                        <span className="text-[10px] text-electric-blue font-semibold">Selected</span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className={isDashboard ? 'mb-2' : 'mb-4'}>
                    <p className={`font-bold text-white ${isDashboard ? 'text-lg' : 'text-2xl sm:text-3xl'}`}>
                      ${tier.minAmount.toLocaleString()}
                      <span className={`font-normal text-white/50 ${isDashboard ? 'text-xs' : 'text-sm'}`}> min</span>
                    </p>
                    <p className={`text-white/60 ${isDashboard ? 'text-[10px]' : 'text-xs'}`}>
                      {tier.profitMin}% – {tier.profitMax}% expected returns
                    </p>
                  </div>

                  {/* Features */}
                  {!isDashboard && (
                    <ul className="space-y-2 mb-5">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-white/80 text-sm">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  {variant === 'homepage' && (
                    <Button
                      onClick={(e) => { e.stopPropagation(); navigate('/signup'); }}
                      className={`w-full ${index === 1 ? 'bg-electric-blue hover:bg-electric-blue/90' : 'bg-white/10 hover:bg-white/20 border border-white/20'} text-white`}
                    >
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
