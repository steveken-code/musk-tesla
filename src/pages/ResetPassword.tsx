import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import teslaLogo from '@/assets/tesla-logo-new.png';

// Password strength calculator
const getPasswordStrength = (password: string): { level: number; label: string } => {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return { level: 1, label: 'Weak - Add more characters' };
  if (score === 2) return { level: 2, label: 'Fair - Add numbers or symbols' };
  if (score === 3) return { level: 3, label: 'Good - Almost there!' };
  return { level: 4, label: 'Strong - Great password!' };
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-reset-token', {
          body: { token }
        });

        if (error) {
          console.error('Token verification error:', error);
          setTokenValid(false);
        } else if (data?.valid) {
          setTokenValid(true);
          setEmail(data.email);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('complete-password-reset', {
        body: { token, newPassword: password }
      });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
      } else if (data?.success) {
        setResetComplete(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(data?.error || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-tesla-red mx-auto mb-4" />
          <p className="text-slate-400">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid && !resetComplete) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
        
        <Link 
          to="/auth" 
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </Link>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50 text-center">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Invalid or Expired Link</h2>
            <p className="text-slate-400 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset complete
  if (resetComplete) {
    return (
      <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-green-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Complete!</h2>
            <p className="text-slate-400 mb-8">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigate('/auth')}
              className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-[hsl(222,47%,7%)] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <Link 
        to="/auth" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Login
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center justify-center mb-10">
            <img src={teslaLogo} alt="Tesla Stock" className="h-20 w-auto mb-4" />
            <h2 className="text-xl font-semibold text-white">Create New Password</h2>
            {email && (
              <p className="text-slate-400 text-sm mt-2 font-medium">for {email}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 z-10" style={{ color: '#1a1a1a', opacity: 0.9 }} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white border-slate-300 rounded-xl hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-[border] duration-300 ease-in-out [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  required
                  minLength={8}
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
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = getPasswordStrength(password);
                      const isActive = level <= strength.level;
                      const colors = {
                        1: 'bg-red-500',
                        2: 'bg-orange-500',
                        3: 'bg-yellow-500',
                        4: 'bg-green-500'
                      };
                      return (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            isActive ? colors[strength.level as keyof typeof colors] : 'bg-slate-600'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className={`text-xs transition-colors duration-300 ${
                    getPasswordStrength(password).level === 1 ? 'text-red-400' :
                    getPasswordStrength(password).level === 2 ? 'text-orange-400' :
                    getPasswordStrength(password).level === 3 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {getPasswordStrength(password).label}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300 text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 z-10" style={{ color: '#1a1a1a', opacity: 0.9 }} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white border-slate-300 rounded-xl hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-[border] duration-300 ease-in-out [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors z-10 hover:opacity-100"
                  style={{ color: '#1a1a1a', opacity: 0.9 }}
                >
                  {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Eye className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
                </button>
              </div>
              
              {/* Password match indicator */}
              {confirmPassword.length > 0 && (
                <p className={`text-xs ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 8}
              className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
