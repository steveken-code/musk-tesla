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
import LanguageSelector from '@/components/LanguageSelector';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setGoogleLoading(false);
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setResetEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
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
        
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
        </div>
        
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
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-12 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-tesla-red focus:ring-tesla-red/20"
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
      
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>
      
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
              {isLogin ? 'Sign in to access your account' : 'Create an account to get started'}
            </p>
          </div>

          {/* Google Sign-in Button - Subtle hover effect */}
          <Button
            type="button"
            variant="static"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-12 mb-6 bg-white text-gray-800 border border-gray-200 font-medium flex items-center justify-center gap-3 rounded-xl shadow-sm transition-all duration-200 hover:bg-gray-100 hover:shadow-md hover:border-gray-300"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? t('connecting') : t('continueWithGoogle')}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">{t('or')}</span>
            </div>
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
                    className="pl-14 h-14 bg-white border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
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
                  className="pl-14 h-14 bg-white border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
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
                  className="pl-14 pr-14 h-14 bg-white border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
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
                className="text-sm text-tesla-red hover:text-tesla-red/80 transition-colors"
              >
                {t('forgotPassword')}
              </button>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('processingText')}
                </>
              ) : (
                isLogin ? t('signIn') : t('createAccount')
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-slate-500 text-sm">
              {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
            </span>
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