import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Zap, ArrowLeft, Mail, Lock, Loader2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
        </div>
        
        <button 
          onClick={() => {
            setIsForgotPassword(false);
            setResetEmailSent(false);
            setResetEmail('');
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToLogin')}
        </button>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Lock className="w-8 h-8 text-tesla-red" />
              <span className="text-2xl font-bold font-display">
                <span className="text-tesla-red">Reset</span>
                <span className="text-slate-400">Password</span>
              </span>
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
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <p className="text-slate-400 text-center mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4" />
                    {t('email')}
                  </Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('home')}
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl hover:shadow-tesla-red/10 transition-shadow duration-500">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="w-8 h-8 text-tesla-red animate-pulse" />
            <span className="text-2xl font-bold font-display tracking-tight">
              <span className="text-tesla-red">Tesla</span>
              <span className="text-slate-400">Invest</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-white">
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </h2>
          <p className="text-slate-400 text-center mb-6">
            {isLogin ? t('signIn') : t('signUp')}
          </p>

          {/* Google Sign-in Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full mb-6 bg-white hover:bg-gray-100 text-gray-800 border-gray-300 font-medium flex items-center justify-center gap-3 py-5"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/80 text-slate-400">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-300">
                  <User className="w-4 h-4" />
                  {t('fullName')}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 hover:border-tesla-red/50 transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4" />
                {t('email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 hover:border-tesla-red/50 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4" />
                {t('password')}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 hover:border-tesla-red/50 transition-colors"
                required
                minLength={6}
              />
            </div>

            {isLogin && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-electric-blue hover:underline block"
              >
                {t('forgotPassword')}
              </button>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70 hover:scale-[1.02] transition-all duration-300"
              disabled={loading}
            >
              {loading ? t('processingText') : isLogin ? t('signIn') : t('createAccount')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-electric-blue hover:underline transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;