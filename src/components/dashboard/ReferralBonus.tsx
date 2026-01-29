import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Users, DollarSign, Share2, TrendingUp, Loader2, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferrals: number;
  paidReferrals: number;
  pendingReferrals: number;
  totalBonus: number;
  pendingBonus: number;
}

const ReferralBonus = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    paidReferrals: 0,
    pendingReferrals: 0,
    totalBonus: 0,
    pendingBonus: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasInvested, setHasInvested] = useState(false);

  // Generate unique referral link based on user ID - always use production domain
  const PRODUCTION_DOMAIN = 'https://msktesla.net';
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'TESLA500';
  const referralLink = `${PRODUCTION_DOMAIN}/auth?ref=${referralCode}`;
  const displayLink = `msktesla.net/auth?ref=${referralCode}`;

  // Fetch referral stats and investment status from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch referrals and investments in parallel
        const [referralsResult, investmentsResult] = await Promise.all([
          supabase
            .from('referrals')
            .select('status, bonus_amount')
            .eq('referrer_user_id', user.id),
          supabase
            .from('investments')
            .select('id, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'completed'])
            .limit(1)
        ]);

        // Process referrals
        if (!referralsResult.error) {
          const referrals = referralsResult.data || [];
          const paidReferrals = referrals.filter(r => r.status === 'paid').length;
          const pendingReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'eligible').length;
          const paidBonus = referrals
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);
          const pendingBonus = referrals
            .filter(r => r.status === 'pending' || r.status === 'eligible')
            .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);

          setStats({
            totalReferrals: referrals.length,
            paidReferrals,
            pendingReferrals,
            totalBonus: paidBonus,
            pendingBonus,
          });
        }

        // Check investment status
        if (!investmentsResult.error) {
          setHasInvested(investmentsResult.data && investmentsResult.data.length > 0);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  // Calculate withdrawable amount
  const withdrawableBonus = hasInvested ? stats.totalBonus : 0;
  const totalEarnings = stats.totalBonus + stats.pendingBonus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-electric-blue/30 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 p-4 sm:p-6"
    >
      {/* Background glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-electric-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-electric-blue/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 sm:p-2.5 rounded-xl bg-electric-blue/20 ring-1 ring-electric-blue/30">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">Refer & Earn</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Invite friends, earn rewards</p>
          </div>
        </div>

        {/* Referral Stats Grid - Enhanced with withdrawal eligibility */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 text-electric-blue animate-spin" />
          </div>
        ) : stats.totalReferrals > 0 ? (
          <div className="mb-4 space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-electric-blue/5 border border-electric-blue/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-electric-blue" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-electric-blue">{stats.totalReferrals}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Referrals</p>
              </div>
              <div className="text-center border-x border-electric-blue/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-green-500">${totalEarnings.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Total Earned</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wallet className="w-3 h-3 text-amber-500" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-amber-500">${withdrawableBonus.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">Withdrawable</p>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="flex items-center justify-center gap-4 text-[10px] sm:text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {stats.paidReferrals} paid
              </span>
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-amber-500" />
                {stats.pendingReferrals} pending
              </span>
            </div>

            {/* Investment requirement warning */}
            {!hasInvested && totalEarnings > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-amber-500/90">
                  <span className="font-semibold">Invest to unlock withdrawal.</span> Your ${totalEarnings.toLocaleString()} bonus will be withdrawable after you make your first investment.
                </p>
              </motion.div>
            )}

            {/* Ready to withdraw indicator */}
            {hasInvested && withdrawableBonus > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/10 border border-green-500/30"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-[11px] sm:text-xs text-green-500/90">
                  <span className="font-semibold">${withdrawableBonus.toLocaleString()}</span> ready for withdrawal
                </p>
              </motion.div>
            )}
          </div>
        ) : (
          /* Bonus amount highlight - shown when no referrals yet */
          <div className="mb-4 p-3 sm:p-4 rounded-lg bg-electric-blue/10 border border-electric-blue/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">Earn per referral</p>
                <p className="text-2xl sm:text-3xl font-bold text-electric-blue">$500</p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="p-2 sm:p-3 rounded-full bg-electric-blue/20"
              >
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-electric-blue" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Benefits list - compact */}
        <div className="flex flex-wrap gap-2 mb-4 text-[10px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/30">
            <DollarSign className="w-3 h-3 text-electric-blue" />
            $500/referral
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/30">
            <Gift className="w-3 h-3 text-electric-blue" />
            Friend gets $100
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/30">
            <Users className="w-3 h-3 text-electric-blue" />
            Unlimited
          </span>
        </div>

        {/* Referral link section */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Your unique referral link</p>
          
          <div className="flex gap-2">
            <div className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-background/50 border border-border/50 overflow-hidden">
              <p className="text-xs sm:text-sm text-foreground truncate font-mono">{displayLink}</p>
            </div>
            
            <Button
              onClick={handleCopy}
              size="sm"
              className={`px-3 sm:px-4 transition-all duration-300 ${
                copied 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : 'bg-electric-blue hover:bg-electric-blue/90 ring-2 ring-electric-blue/30 hover:ring-electric-blue/50'
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Share button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 sm:h-10 border-electric-blue/30 hover:bg-electric-blue/10 hover:border-electric-blue/50 group"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Join Tesla Stock Platform',
                  text: 'Invest in Tesla stocks and earn weekly returns! Use my referral link to get a $100 bonus.',
                  url: referralLink,
                });
              } else {
                handleCopy();
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2 text-electric-blue group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm">Share with Friends</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralBonus;