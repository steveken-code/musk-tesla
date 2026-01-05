import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Loader2, Shield, CheckCircle } from 'lucide-react';
import teslaLogo from '@/assets/tesla-logo-new.png';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('request-admin-password-reset', {
        body: { email }
      });

      if (error) {
        toast.error('An error occurred. Please try again.');
      } else if (data?.error) {
        // Show the error message from the edge function (e.g., "Invalid email. Admin access denied.")
        toast.error(data.error);
      } else if (data?.success) {
        setEmailSent(true);
        toast.success('Password reset link sent to your admin email.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/10 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-green-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-10 shadow-2xl shadow-black/50 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-slate-400 mb-8">
              If an admin account exists with that email, we've sent a password reset link. Please check your inbox.
            </p>
            <Link to="/admin-login">
              <Button className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl">
                Back to Admin Login
              </Button>
            </Link>
          </div>
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
        to="/admin-login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Admin Login
      </Link>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-800/90 backdrop-blur-2xl border border-slate-700 rounded-3xl p-10 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <img src={teslaLogo} alt="Tesla" className="h-24 w-auto brightness-150 drop-shadow-lg mb-4" />
            <div className="flex items-center gap-2 px-4 py-2 bg-tesla-red/10 border border-tesla-red/30 rounded-full">
              <Shield className="w-5 h-5 text-tesla-red" />
              <span className="text-sm font-semibold text-tesla-red">Admin Password Recovery</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Reset Admin Password</h2>
            <p className="text-slate-400 text-sm">
              Enter your admin email to receive a password reset link
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
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-300 rounded-xl hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:border-slate-400 transition-[border] duration-300 ease-in-out [color:#1a1a1a_!important] [font-size:16px_!important] [font-weight:500_!important] [opacity:1_!important] [-webkit-text-fill-color:#1a1a1a_!important] [caret-color:#1a1a1a] placeholder:[color:#888888_!important] placeholder:[opacity:1_!important] placeholder:[-webkit-text-fill-color:#888888_!important]"
                  required
                />
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
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Remember your password?{' '}
              <Link to="/admin-login" className="text-tesla-red hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Only registered administrators can reset their password.
        </p>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
