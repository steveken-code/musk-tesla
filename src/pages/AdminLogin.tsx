import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Loader2, Shield, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import teslaLogo from '@/assets/tesla-logo-new.png';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaiting2FA, setAwaiting2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          toast.error(data.error || 'Account temporarily locked. Too many failed attempts.');
        } else if (response.status === 403) {
          toast.error(data.error || 'Access denied. Admin privileges required.');
        } else if (response.status === 401) {
          const remainingAttempts = data.remainingAttempts;
          if (remainingAttempts !== undefined && remainingAttempts > 0) {
            toast.error(`Invalid email or password. ${remainingAttempts} attempts remaining.`);
          } else if (remainingAttempts === 0) {
            toast.error('Invalid credentials. Your account will be locked after the next failed attempt.');
          } else {
            toast.error('Invalid email or password.');
          }
        } else {
          toast.error(data.error || 'An error occurred during login.');
        }
        setLoading(false);
        return;
      }

      if (data.requires2FA) {
        toast.success('Verification code sent to your email.');
        setAwaiting2FA(true);
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFactorCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }

    setVerifying2FA(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-admin-2fa`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, code: twoFactorCode, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Invalid or expired verification code.');
        setVerifying2FA(false);
        return;
      }

      if (data.session) {
        // Set the session in Supabase client
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        toast.success('Welcome back, Administrator!');
        navigate('/admin');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok && data.requires2FA) {
        toast.success('New verification code sent to your email.');
        setTwoFactorCode('');
      } else {
        toast.error(data.error || 'Failed to resend code. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setAwaiting2FA(false);
    setTwoFactorCode('');
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

          {!awaiting2FA ? (
            <>
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
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 z-10" style={{ color: '#1a1a1a', opacity: 0.9 }} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white border-slate-300 rounded-xl hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-[border] duration-300 ease-in-out [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 z-10" style={{ color: '#1a1a1a', opacity: 0.9 }} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 bg-white border-slate-300 rounded-xl hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-[border] duration-300 ease-in-out [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10 hover:opacity-100"
                      style={{ color: '#1a1a1a', opacity: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Eye className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
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
                  to="/admin-forgot-password"
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
            </>
          ) : (
            <>
              {/* 2FA Verification Screen */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-tesla-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-tesla-red" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h2>
                <p className="text-slate-400 text-sm">
                  Enter the 6-digit code sent to<br />
                  <span className="text-white font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(value) => setTwoFactorCode(value)}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-14 text-xl font-bold bg-slate-700/50 border-slate-600 text-white rounded-lg focus:border-tesla-red focus:ring-tesla-red/20"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-tesla-red to-red-700 hover:from-red-700 hover:to-tesla-red text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
                  disabled={verifying2FA || twoFactorCode.length !== 6}
                >
                  {verifying2FA ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-tesla-red hover:underline text-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : "Didn't receive code? Resend"}
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </div>
            </>
          )}
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
