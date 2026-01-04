import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Loader2, User, Eye, EyeOff } from 'lucide-react';
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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
          navigate('/dashboard');
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
      // Use custom password reset edge function
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

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
        
        {/* Remove language selector from Auth page - only on Index and Admin */}
        
        <button 
          onClick={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
            setResetEmail('');
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToLogin')}
        </button>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
            <div className="flex flex-col items-center justify-center mb-10">
              <img src={teslaLogo} alt="Tesla" className="h-20 w-auto mb-4 brightness-125" />
              <h2 className="text-xl font-semibold text-slate-300">Reset Password</h2>
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
                  className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <p className="text-slate-400 text-center mb-6 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-slate-300 text-sm font-medium">
                    {t('email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2 shadow-sm"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      {/* Remove language selector from Auth page - only on Index and Admin */}
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('home')}
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
          {/* Logo - Larger, centered, and brighter */}
          <div className="flex flex-col items-center justify-center mb-10">
            <img src={teslaLogo} alt="Tesla" className="h-32 w-auto brightness-150 drop-shadow-lg" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="text-slate-400 text-sm">
              {isLogin ? t('signInSubtitle') : t('createAccountSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="text-slate-300 text-sm font-medium">
                  {t('fullName')}
                </Label>
              <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('enterFullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-14 h-14 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-14 h-14 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                {t('password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 pr-14 h-14 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors p-1 rounded-md hover:bg-slate-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator - Only show on signup */}
              {!isLogin && password.length > 0 && (
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
                            isActive ? colors[strength.level as keyof typeof colors] : 'bg-slate-700'
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

            {isLogin && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-xs text-slate-400 hover:text-electric-blue hover:underline transition-colors font-medium"
              >
                {t('forgotPassword')}
              </button>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-tesla-red hover:bg-tesla-red/90 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25 disabled:opacity-80"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                  </div>
                  <span className="animate-pulse">{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                isLogin ? t('signIn') : t('createAccount')
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-slate-500 text-sm">
              {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
            </span>{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-tesla-red hover:text-tesla-red/80 transition-colors text-sm font-medium"
            >
              {isLogin ? t('signUp') : t('signIn')}
            </button>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-slate-700 text-xs mt-6">
          {t('termsAgreement')}
        </p>
      </div>
    </div>
  );
};

export default Auth;