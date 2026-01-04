import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Loader2, CheckCircle, Send, ShieldCheck } from 'lucide-react';
import teslaLogo from '@/assets/tesla-logo-new.png';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email is too long" });

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value: string): boolean => {
    try {
      emailSchema.parse(value);
      setValidationError('');
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationError(err.errors[0]?.message || 'Invalid email');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('request-password-reset', {
        body: { email: email.trim().toLowerCase() }
      });

      // Always show success to prevent email enumeration
      // The backend already handles this, but we enforce it on frontend too
      setEmailSent(true);
      
      if (error) {
        console.error('Reset request error:', error);
      }
      
      // Generic success message - doesn't reveal if account exists
      toast.success('Check your email for a reset link');
    } catch (err) {
      // Even on error, show success to prevent enumeration
      setEmailSent(true);
      toast.success('Check your email for a reset link');
    } finally {
      setLoading(false);
    }
  };

  // Success state - email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />

        <Link 
          to="/auth" 
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors z-20"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </Link>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
            {/* Success Icon */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-scale-in">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-2">Check Your Email</h2>
              <p className="text-slate-400 text-center text-sm max-w-xs">
                If an account exists with this email, we've sent password reset instructions.
              </p>
            </div>

            {/* Email display */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-electric-blue/20 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Sent to</p>
                  <p className="text-white font-medium text-sm">{email}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-semibold text-slate-300">Next Steps:</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tesla-red/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-tesla-red">1</span>
                  </div>
                  <p className="text-slate-400 text-sm">Open your email inbox and look for a message from Msk Tesla</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tesla-red/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-tesla-red">2</span>
                  </div>
                  <p className="text-slate-400 text-sm">Click the "Reset Password" button in the email</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-tesla-red/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-tesla-red">3</span>
                  </div>
                  <p className="text-slate-400 text-sm">Create a new secure password</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 text-sm font-medium mb-1">Can't find the email?</p>
                  <p className="text-amber-200/70 text-xs">Check your spam or junk folder. The link expires in 1 hour.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full h-12 border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Try a Different Email
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl"
              >
                Return to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-electric-blue/5 rounded-full blur-3xl" />
      
      <Link 
        to="/auth" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Login
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img src={teslaLogo} alt="Tesla Stock" className="h-20 w-auto mb-4 brightness-125" />
            <h2 className="text-2xl font-bold text-white text-center mb-2">Forgot Password?</h2>
            <p className="text-slate-400 text-center text-sm max-w-xs">
              No worries! Enter your email and we'll send you a secure link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-field-light-icon" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) validateEmail(e.target.value);
                  }}
                  onBlur={() => email && validateEmail(email)}
                  className={`pl-12 h-12 bg-field-light border-field-light-border text-field-light-foreground placeholder:text-field-light-placeholder rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary autofill:shadow-[inset_0_0_0px_1000px_hsl(var(--field-light))] [&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--field-light-foreground))] ${
                    validationError ? 'border-red-500 focus-visible:border-red-500' : ''
                  }`}
                  required
                  autoComplete="email"
                />
              </div>
              {validationError && (
                <p className="text-red-400 text-xs mt-1 animate-fade-in">{validationError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Reset Link...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Reset Link
                </div>
              )}
            </Button>
          </form>

          {/* Security note */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-electric-blue flex-shrink-0 mt-0.5" />
              <p className="text-slate-400 text-xs">
                For your security, reset links expire after 1 hour. We'll never ask for your password via email.
              </p>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-slate-500 text-sm">
              Remember your password?{' '}
              <Link to="/auth" className="text-tesla-red hover:underline font-medium">
                Sign In
              </Link>
            </p>
            <p className="text-slate-600 text-xs">
              Need help?{' '}
              <a 
                href="https://wa.me/12186500840" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-electric-blue hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
