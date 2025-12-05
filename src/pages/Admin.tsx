import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LogOut, Loader2, CheckCircle, XCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import teslaLogo from '@/assets/tesla-logo.png';

interface Investment {
  id: string;
  amount: number;
  profit_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const Admin = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminAndFetch();
    }
  }, [user]);

  const checkAdminAndFetch = async () => {
    try {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchInvestments();
    } catch (error) {
      console.error('Error checking admin:', error);
      navigate('/dashboard');
    }
  };

  const fetchInvestments = async () => {
    try {
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (investmentsData) {
        const userIds = [...new Set(investmentsData.map(i => i.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const enriched: Investment[] = investmentsData.map(inv => ({
          ...inv,
          profiles: profileMap.get(inv.user_id) || undefined
        }));
        setInvestments(enriched);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateInvestment = async (id: string, status: string, profitAmount?: number) => {
    setUpdating(id);
    try {
      const updateData: any = { status };
      if (profitAmount !== undefined) {
        updateData.profit_amount = profitAmount;
      }

      const { error } = await supabase
        .from('investments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Investment ${status === 'active' ? 'approved' : 'updated'} successfully`);
      fetchInvestments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update investment');
    } finally {
      setUpdating(null);
    }
  };

  const handleProfitChange = (id: string, profit: string) => {
    setInvestments(prev => prev.map(inv => 
      inv.id === id ? { ...inv, profit_amount: parseFloat(profit) || 0 } : inv
    ));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return styles[status] || styles.pending;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tesla-red" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-30" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={teslaLogo} alt="Tesla" className="h-8 w-auto" />
            <span className="text-xl font-bold text-tesla-red">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-tesla-red" />
          Investment Management
        </h1>

        {investments.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No investments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(inv.status)}`}>
                        {inv.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(inv.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-medium">
                      {inv.profiles?.full_name || inv.profiles?.email || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">{inv.profiles?.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-tesla-red" />
                        <span className="font-bold">${Number(inv.amount).toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">invested</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-green-500">
                          ${Number(inv.profit_amount).toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">profit</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Profit:</span>
                      <Input
                        type="number"
                        value={inv.profit_amount}
                        onChange={(e) => handleProfitChange(inv.id, e.target.value)}
                        className="w-28 bg-background/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      {inv.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateInvestment(inv.id, 'active', inv.profit_amount)}
                          disabled={updating === inv.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updating === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      )}
                      
                      {inv.status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => updateInvestment(inv.id, 'active', inv.profit_amount)}
                          disabled={updating === inv.id}
                          variant="outline"
                        >
                          {updating === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Update Profit'
                          )}
                        </Button>
                      )}

                      {(inv.status === 'pending' || inv.status === 'active') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInvestment(inv.id, 'cancelled')}
                          disabled={updating === inv.id}
                          className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;