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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
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
        toast.error(error.message);
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
          toast.error('Access denied. This portal is for administrators only.');
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('request-password-reset', {
        body: { email: resetEmail }
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.success) {
        setResetEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      } else {
        // Still show success to prevent email enumeration
        setResetEmailSent(true);
        toast.success('If an account exists, a reset link has been sent.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setResetLoading(false);
    }
  };

  // Forgot Password View
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
        
        <button 
          onClick={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
            setResetEmail('');
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Admin Login
        </button>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-10 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center justify-center mb-8">
              <img src={teslaLogo} alt="Tesla" className="h-20 w-auto brightness-150 drop-shadow-lg mb-4" />
              <div className="flex items-center gap-2 px-4 py-2 bg-tesla-red/10 border border-tesla-red/30 rounded-full">
                <Shield className="w-5 h-5 text-tesla-red" />
                <span className="text-sm font-semibold text-tesla-red">Admin Portal</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-slate-400 text-sm">
                Enter your admin email to receive a reset link
              </p>
            </div>

            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Check your email</h3>
                <p className="text-slate-400">
                  We've sent a password reset link to <span className="text-white font-medium">{resetEmail}</span>
                </p>
                <p className="text-slate-500 text-sm">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => {
                    setResetEmailSent(false);
                    setResetEmail('');
                  }}
                  variant="outline"
                  className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-slate-300 text-sm font-medium">
                    Admin Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your admin email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-12 bg-gradient-to-r from-tesla-red to-red-700 hover:from-red-700 hover:to-tesla-red text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </div>
          
          <p className="text-center text-slate-600 text-xs mt-6">
            Remember your password?{' '}
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetEmailSent(false);
                setResetEmail('');
              }}
              className="text-tesla-red hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    );
  }

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
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-tesla-red hover:underline text-sm"
            >
              Forgot Password?
            </button>
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
