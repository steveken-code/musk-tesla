import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import teslaLogo from '@/assets/tesla-logo-new.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in as admin on mount
  useEffect(() => {
    const checkExistingAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData) {
          navigate('/admin');
        }
      }
    };

    checkExistingAdmin();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in directly with Supabase - no dependency on AuthContext
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Provide clearer error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Incorrect email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before logging in.');
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData) {
          toast.success('Welcome back, Administrator!');
          navigate('/admin');
        } else {
          // Sign out if not admin
          await supabase.auth.signOut();
          toast.error('Access denied. Your account does not have administrator privileges. Please contact support if you believe this is an error.');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/10 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Home
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-10 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img src={teslaLogo} alt="Tesla" className="h-24 w-auto brightness-150 drop-shadow-lg mb-4" />
            <div className="flex items-center gap-2 px-4 py-2 bg-tesla-red/10 border border-tesla-red/30 rounded-full">
              <Shield className="w-5 h-5 text-tesla-red" />
              <span className="text-sm font-semibold text-tesla-red">Admin Portal</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Administrator Access</h2>
            <p className="text-slate-400 text-sm">
              Sign in with your admin credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-tesla-red to-red-700 hover:from-red-700 hover:to-tesla-red text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Access Admin Panel
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-tesla-red hover:underline text-sm"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-500 text-sm">
              Not an administrator?{' '}
              <Link to="/auth" className="text-electric-blue hover:underline">
                User Login
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Authorized personnel only. All access attempts are logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
