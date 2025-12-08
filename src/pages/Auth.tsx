import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Zap, ArrowLeft, Phone, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';

const VALID_PHONE = '08131166505';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
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

  const handlePhoneVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber === VALID_PHONE) {
      setPhoneVerified(true);
      toast.success('Phone verified! You can now set a new password.');
    } else {
      toast.error(t('invalidPhone'));
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success(t('passwordChanged'));
    setIsForgotPassword(false);
    setPhoneVerified(false);
    setPhoneNumber('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-hero opacity-50" />
        
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelector />
        </div>
        
        <button 
          onClick={() => {
            setIsForgotPassword(false);
            setPhoneVerified(false);
          }}
          className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToLogin')}
        </button>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-glow-red">
            <div className="flex items-center justify-center gap-2 mb-8">
              <Lock className="w-8 h-8 text-tesla-red" />
              <span className="text-2xl font-bold bg-gradient-to-r from-tesla-red to-electric-blue bg-clip-text text-transparent">
                {t('resetPassword')}
              </span>
            </div>

            {!phoneVerified ? (
              <form onSubmit={handlePhoneVerification} className="space-y-4">
                <p className="text-muted-foreground text-center mb-6">
                  {t('enterPhone')}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t('phoneNumber')}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08131166505"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-background/50 border-border"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                >
                  Verify Phone
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background/50 border-border"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-border"
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-tesla-red to-tesla-red/80 hover:from-tesla-red/90 hover:to-tesla-red/70"
                >
                  {t('resetPassword')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector />
      </div>
      
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        {t('home')}
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-glow-red hover:shadow-glow-combined transition-shadow duration-500">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="w-8 h-8 text-tesla-red animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-tesla-red to-electric-blue bg-clip-text text-transparent">
              Tesla Invest
            </span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {isLogin ? t('welcomeBack') : t('createAccount')}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {isLogin ? t('signIn') : t('signUp')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="fullName">{t('fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background/50 border-border hover:border-tesla-red/50 transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border hover:border-tesla-red/50 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border hover:border-tesla-red/50 transition-colors"
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
