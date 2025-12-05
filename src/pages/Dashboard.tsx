import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  LogOut, TrendingUp, DollarSign, Clock, 
  CheckCircle, XCircle, Loader2, Shield
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import teslaLogo from '@/assets/tesla-logo.png';

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  email: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const checkAdmin = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user!.id)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [investmentsRes, profileRes] = await Promise.all([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', user!.id)
          .maybeSingle()
      ]);

      if (investmentsRes.data) setInvestments(investmentsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(investAmount);
    
    if (isNaN(amount) || amount < 100) {
      toast.error('Minimum investment is $100');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('investments')
        .insert({ user_id: user!.id, amount, status: 'pending' });

      if (error) throw error;
      
      toast.success('Investment request submitted! Our team will contact you shortly.');
      setInvestAmount('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit investment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const totalInvested = investments
    .filter(i => i.status === 'active' || i.status === 'completed')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingAmount = investments
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalProfit = investments.reduce((sum, i) => sum + Number(i.profit_amount || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-electric-blue" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={teslaLogo} alt="Tesla" className="h-8 w-auto" />
            <span className="text-xl font-bold bg-gradient-to-r from-tesla-red to-electric-blue bg-clip-text text-transparent">
              Invest
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden sm:block">
              {profile?.full_name || user?.email}
            </span>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-tesla-red" />
              <span className="text-muted-foreground">Total Invested</span>
            </div>
            <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-muted-foreground">Total Profit</span>
            </div>
            <p className="text-3xl font-bold text-green-500">${totalProfit.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-muted-foreground">Pending</span>
            </div>
            <p className="text-3xl font-bold">${pendingAmount.toLocaleString()}</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-electric-blue" />
              <span className="text-muted-foreground">Active</span>
            </div>
            <p className="text-3xl font-bold">
              {investments.filter(i => i.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Investment Form */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-tesla-red" />
              Make New Investment
            </h2>
            <form onSubmit={handleInvest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Investment Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (min $100)"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="bg-background/50 border-border"
                  min="100"
                  step="1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Investment Request'
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Our team will contact you via WhatsApp to complete the investment
              </p>
            </form>
          </div>

          {/* Investment History */}
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Investment History</h2>
            {investments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No investments yet. Start your journey today!
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {investments.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-semibold">${Number(inv.amount).toLocaleString()}</p>
                      {inv.profit_amount > 0 && (
                        <p className="text-sm text-green-500">
                          +${Number(inv.profit_amount).toLocaleString()} profit
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inv.status)}
                      <span className="capitalize text-sm">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default Dashboard;
