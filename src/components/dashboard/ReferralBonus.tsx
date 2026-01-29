import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Users, DollarSign, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ReferralBonus = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate unique referral link based on user ID
  const referralCode = user?.id?.slice(0, 8).toUpperCase() || 'TESLA500';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

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

  const benefits = [
    { icon: DollarSign, text: '$500 bonus per referral' },
    { icon: Users, text: 'No limit on referrals' },
    { icon: Gift, text: 'Friend gets $100 bonus' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-xl border border-electric-blue/30 bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950/90 p-6"
    >
      {/* Background glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-electric-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-electric-blue/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-electric-blue/20 ring-1 ring-electric-blue/30">
            <Gift className="w-5 h-5 text-electric-blue" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Refer & Earn</h3>
            <p className="text-sm text-muted-foreground">Invite friends, earn rewards</p>
          </div>
        </div>

        {/* Bonus amount highlight */}
        <div className="mb-5 p-4 rounded-lg bg-electric-blue/10 border border-electric-blue/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Earn per referral</p>
              <p className="text-3xl font-bold text-electric-blue">$500</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-3 rounded-full bg-electric-blue/20"
            >
              <DollarSign className="w-8 h-8 text-electric-blue" />
            </motion.div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="space-y-2 mb-5">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-sm"
            >
              <div className="p-1 rounded-md bg-electric-blue/10">
                <benefit.icon className="w-3.5 h-3.5 text-electric-blue" />
              </div>
              <span className="text-muted-foreground">{benefit.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Referral link section */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Your unique referral link</p>
          
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-lg bg-background/50 border border-border/50 overflow-hidden">
              <p className="text-sm text-foreground truncate font-mono">{referralLink}</p>
            </div>
            
            <Button
              onClick={handleCopy}
              className={`px-4 transition-all duration-300 ${
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
            className="w-full border-electric-blue/30 hover:bg-electric-blue/10 hover:border-electric-blue/50 group"
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
            <span>Share with Friends</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReferralBonus;
