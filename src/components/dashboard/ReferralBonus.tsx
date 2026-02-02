import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Users, DollarSign, Share2, TrendingUp, Loader2, AlertTriangle, CheckCircle2, Wallet, Clock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferrals: number;
  paidReferrals: number;
  pendingReferrals: number;
  activeReferrals: number;
  totalBonus: number;
  pendingBonus: number;
}

interface ReferredBonusInfo {
  id: string;
  referred_bonus: number;
  status: string;
  referrer_user_id: string;
}

interface ReferrerInfo {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface ReferralRecord {
  id: string;
  referred_user_id: string;
  status: string;
  bonus_amount: number;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const ReferralBonus = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    paidReferrals: 0,
    pendingReferrals: 0,
    activeReferrals: 0,
    totalBonus: 0,
    pendingBonus: 0,
  });
  const [referralRecords, setReferralRecords] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasInvested, setHasInvested] = useState(false);
  const [wasReferred, setWasReferred] = useState<ReferredBonusInfo | null>(null);
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null);

  // Generate unique referral link based on user ID - always use production domain
  const PRODUCTION_DOMAIN = 'https://msktesla.net';
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'TESLA500';
  const referralLink = `${PRODUCTION_DOMAIN}/signup?ref=${referralCode}`;
  const displayLink = `msktesla.net/signup?ref=${referralCode}`;

  // Fetch referral stats and investment status from database
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch referrals, investments, and check if user was referred in parallel
        const [referralsResult, investmentsResult, wasReferredResult] = await Promise.all([
          supabase
            .from('referrals')
            .select('id, referred_user_id, status, bonus_amount, created_at')
            .eq('referrer_user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('investments')
            .select('id, status')
            .eq('user_id', user.id)
            .in('status', ['active', 'completed'])
            .limit(1),
          // Check if current user was referred by someone (to show their $100 bonus)
          supabase
            .from('referrals')
            .select('id, referred_bonus, status, referrer_user_id')
            .eq('referred_user_id', user.id)
            .maybeSingle()
        ]);

        // Process referrals
        if (!referralsResult.error && referralsResult.data) {
          const referrals = referralsResult.data;
          
          // Get profiles for referred users
          const referredUserIds = referrals.map(r => r.referred_user_id);
          let profileMap = new Map<string, { full_name: string | null; email: string | null; avatar_url: string | null }>();
          
          if (referredUserIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('user_id, full_name, email, avatar_url')
              .in('user_id', referredUserIds);
            
            if (profiles) {
              profiles.forEach(p => {
                profileMap.set(p.user_id, { full_name: p.full_name, email: p.email, avatar_url: p.avatar_url });
              });
            }
          }
          
          // Enrich referral records with profile data
          const enrichedRecords: ReferralRecord[] = referrals.map(r => ({
            ...r,
            profile: profileMap.get(r.referred_user_id),
          }));
          
          setReferralRecords(enrichedRecords);
          
          const paidReferrals = referrals.filter(r => r.status === 'paid').length;
          const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
          const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'eligible').length;
          const paidBonus = referrals
            .filter(r => r.status === 'paid')
            .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);
          const pendingBonus = referrals
            .filter(r => r.status === 'pending' || r.status === 'active' || r.status === 'eligible')
            .reduce((sum, r) => sum + (r.bonus_amount || 500), 0);

          setStats({
            totalReferrals: referrals.length,
            paidReferrals,
            pendingReferrals,
            activeReferrals,
            totalBonus: paidBonus,
            pendingBonus,
          });
        }

        // Check investment status
        if (!investmentsResult.error) {
          setHasInvested(investmentsResult.data && investmentsResult.data.length > 0);
        }
        
        // Check if user was referred (received a signup bonus)
        if (!wasReferredResult.error && wasReferredResult.data) {
          setWasReferred(wasReferredResult.data);
          
          // Fetch referrer's profile to show who referred this user
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('user_id', wasReferredResult.data.referrer_user_id)
            .maybeSingle();
          
          if (referrerProfile) {
            setReferrerInfo(referrerProfile);
          }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Paid</span>;
      case 'active':
      case 'eligible':
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-electric-blue/20 text-electric-blue border border-electric-blue/30">Active</span>;
      case 'pending':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Pending</span>;
    }
  };

  const getUserDisplay = (record: ReferralRecord) => {
    if (record.profile?.full_name) return record.profile.full_name;
    if (record.profile?.email) return record.profile.email.split('@')[0];
    return `User ${record.referred_user_id.slice(0, 6)}...`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-lg sm:rounded-xl border border-electric-blue/30 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 p-3 sm:p-4 md:p-6"
    >
      {/* Background glow effect */}
      <div className="absolute -top-16 sm:-top-20 -right-16 sm:-right-20 w-32 sm:w-40 h-32 sm:h-40 bg-electric-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-8 sm:-bottom-10 -left-8 sm:-left-10 w-24 sm:w-32 h-24 sm:h-32 bg-electric-blue/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Show welcome bonus if user was referred */}
        {wasReferred && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-500/20 shrink-0">
                <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-green-400">
                  Welcome Bonus: ${wasReferred.referred_bonus || 100}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {wasReferred.status === 'active' || wasReferred.status === 'paid' 
                    ? '✓ Ready to withdraw' 
                    : hasInvested 
                      ? 'Bonus unlocked! Processing...'
                      : 'Invest to unlock this bonus'}
                </p>
                {/* Show who referred this user */}
                {referrerInfo && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {referrerInfo.avatar_url ? (
                      <img 
                        src={referrerInfo.avatar_url} 
                        alt={referrerInfo.full_name || 'Referrer'} 
                        className="w-4 h-4 rounded-full object-cover ring-1 ring-green-500/30"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center text-[8px] font-medium text-green-400">
                        {(referrerInfo.full_name || referrerInfo.email || 'F').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[10px] text-green-400/80">
                      Referred by {referrerInfo.full_name || referrerInfo.email?.split('@')[0] || 'Friend'}
                    </span>
                  </div>
                )}
              </div>
              {(wasReferred.status === 'active' || wasReferred.status === 'paid') && (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
              )}
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl bg-electric-blue/20 ring-1 ring-electric-blue/30 shrink-0">
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-electric-blue" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">Refer & Earn</h3>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">Invite friends, earn rewards</p>
          </div>
        </div>

        {/* Referral Stats Grid - Enhanced with withdrawal eligibility */}
        {loading ? (
          <div className="flex items-center justify-center py-3 sm:py-4">
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue animate-spin" />
          </div>
        ) : stats.totalReferrals > 0 ? (
          <div className="mb-3 sm:mb-4 space-y-2 sm:space-y-3">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg bg-electric-blue/5 border border-electric-blue/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-electric-blue" />
                </div>
                <p className="text-base sm:text-lg md:text-xl font-bold text-electric-blue">{stats.totalReferrals}</p>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground">Referrals</p>
              </div>
              <div className="text-center border-x border-electric-blue/20">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                </div>
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-500">${totalEarnings.toLocaleString()}</p>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground">Earned</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                  <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                </div>
                <p className="text-base sm:text-lg md:text-xl font-bold text-amber-500">${withdrawableBonus.toLocaleString()}</p>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground">Withdrawable</p>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-0.5 sm:gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                {stats.paidReferrals} paid
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-electric-blue" />
                {stats.activeReferrals} active
              </span>
              <span className="flex items-center gap-0.5 sm:gap-1">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500" />
                {stats.pendingReferrals} pending
              </span>
            </div>

            {/* Referral Tracking Table */}
            {referralRecords.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="w-4 h-4 text-electric-blue" />
                  <h4 className="text-xs font-semibold text-foreground">Your Referrals</h4>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {referralRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 border border-slate-600/30">
                      <div className="flex items-center gap-2">
                        {record.profile?.avatar_url ? (
                          <img 
                            src={record.profile.avatar_url} 
                            alt={getUserDisplay(record)}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-electric-blue/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-600/50 flex items-center justify-center text-xs font-medium text-foreground">
                            {getUserDisplay(record).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground truncate max-w-[100px] sm:max-w-[150px]">
                            {getUserDisplay(record)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-400">${record.bonus_amount || 500}</span>
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                  ))}
                </div>
                {referralRecords.length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    +{referralRecords.length - 5} more referrals
                  </p>
                )}
              </div>
            )}

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
