import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import teslaLogo from '@/assets/tesla-logo-new.png';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false);
        setError('No verification token provided');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-email', {
          body: { token }
        });

        if (error) {
          console.error('Verification error:', error);
          setError('Failed to verify email. Please try again.');
        } else if (data?.success) {
          setVerified(true);
          setEmail(data.email || '');
          toast.success('Email verified successfully!');
        } else {
          setError(data?.error || 'Invalid or expired verification link');
        }
      } catch (err) {
        console.error('Error verifying email:', err);
        setError('An unexpected error occurred');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  // Loading state
  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-tesla-red mx-auto mb-4" />
          <p className="text-slate-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !verified) {
    return (
      <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tesla-red/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-tesla-red/5 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50 text-center">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-slate-400 mb-8">
              {error}
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl"
              >
                Go to Dashboard
              </Button>
              <Link 
                to="/auth" 
                className="block text-slate-400 hover:text-white transition-colors text-sm"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent" />
      <div className="absolute top-20 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-green-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-10 shadow-2xl shadow-black/50 text-center">
          <div className="flex justify-center mb-6">
            <img src={teslaLogo} alt="Tesla" className="h-16 w-auto brightness-125" />
          </div>
          
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
          
          <p className="text-slate-400 mb-2">
            Your email has been successfully verified.
          </p>
          {email && (
            <p className="text-green-400 font-medium mb-8">
              {email}
            </p>
          )}
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Account Activated</p>
                <p className="text-slate-500 text-xs">You now have full access to all features</p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 bg-tesla-red hover:bg-tesla-red/90 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-tesla-red/25"
          >
            Continue to Dashboard →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
