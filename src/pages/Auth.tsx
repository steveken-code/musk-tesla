import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Loader2, User, Eye, EyeOff, Gift } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
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
        const { error } = await signUp(email, password, fullName, referralCode);
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

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
      <div className="absolute top-10 sm:top-20 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 sm:bottom-20 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <Link 
        to="/" 
        className="absolute top-4 sm:top-6 left-3 sm:left-6 flex items-center gap-1.5 sm:gap-2 text-slate-600 hover:text-slate-900 transition-colors z-20 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden xs:inline">{t('home')}</span>
      </Link>

      <div className="relative z-10 w-full max-w-[calc(100%-1rem)] sm:max-w-md animate-fade-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-6 sm:mb-8 md:mb-10">
            <img src={teslaLogo} alt="Tesla" className="h-20 sm:h-24 md:h-32 w-auto brightness-150 drop-shadow-lg" />
          </div>

          {/* Title */}
          <div className="text-center mb-5 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm px-2">
              {isLogin ? t('signInSubtitle') : t('createAccountSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 sm:space-y-2 animate-fade-in">
                <Label htmlFor="fullName" className="text-slate-300 text-xs sm:text-sm font-medium">
                  {t('fullName')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 text-input-icon opacity-100" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('enterFullName')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-11 sm:pl-14 h-12 sm:h-14 bg-white border-slate-300 rounded-lg sm:rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2 [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-xs sm:text-sm font-medium">
                {t('email')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 text-input-icon opacity-100" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 sm:pl-14 h-12 sm:h-14 bg-white border-slate-300 rounded-lg sm:rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2 [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password" className="text-slate-300 text-xs sm:text-sm font-medium">
                {t('password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 text-input-icon opacity-100" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('enterPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 sm:pl-14 pr-11 sm:pr-14 h-12 sm:h-14 bg-white border-slate-300 rounded-lg sm:rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2 [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-input-icon opacity-100 hover:text-input-icon-hover transition-colors p-1 rounded-md hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Eye className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {!isLogin && password.length > 0 && (
                <div className="space-y-1.5 sm:space-y-2 animate-fade-in">
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
                          className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            isActive ? colors[strength.level as keyof typeof colors] : 'bg-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p className={`text-[10px] sm:text-xs transition-colors duration-300 ${
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

            {/* Referral Code Field - Only show on signup */}
            {!isLogin && (
              <div className="space-y-1.5 sm:space-y-2 mt-2 animate-fade-in">
                <Label htmlFor="referralCode" className="text-slate-300 text-xs sm:text-sm font-medium">
                  {t('referralCode') || 'Referral Code'} <span className="text-slate-500">({t('optional') || 'optional'})</span>
                </Label>
                <div className="relative">
                  <Gift className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 text-input-icon opacity-100" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder={t('enterReferralCode') || 'Enter Referral Code'}
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="pl-11 sm:pl-14 h-12 sm:h-14 bg-white border-slate-300 rounded-lg sm:rounded-xl focus:border-sky-400 focus:ring-sky-400/20 focus:ring-2 [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <Link
                to="/forgot-password"
                className="text-[11px] sm:text-xs text-slate-400 hover:text-electric-blue hover:underline transition-colors font-medium block"
              >
                {t('forgotPassword')}
              </Link>
            )}

            <Button
              type="submit"
              className="w-full h-12 sm:h-14 bg-tesla-red hover:bg-tesla-red/90 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25 disabled:opacity-80 text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5">
                    <div className="absolute inset-0 rounded-full border-2 border-white/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin"></div>
                  </div>
                  <span className="animate-pulse text-sm sm:text-base">{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                isLogin ? t('signIn') : t('createAccount')
              )}
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 md:mt-8 text-center">
            <span className="text-slate-500 text-xs sm:text-sm">
              {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
            </span>{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-tesla-red hover:text-tesla-red/80 transition-colors text-xs sm:text-sm font-medium"
            >
              {isLogin ? t('signUp') : t('signIn')}
            </button>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-slate-700 text-[10px] sm:text-xs mt-4 sm:mt-6 px-4">
          {t('termsAgreement')}
        </p>
      </div>
    </div>
  );
};

export default Auth;