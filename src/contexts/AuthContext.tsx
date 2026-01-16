import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendWelcomeEmail = async (userId: string, email: string, name: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: {
          userId,
          email,
          name
        }
      });
      if (error) {
        console.error('Failed to send welcome email:', error);
      }
    } catch (err) {
      console.error('Error sending welcome email:', err);
    }
  };

  // Normalize referral code: remove all non-alphanumeric characters and uppercase
  const normalizeReferralCode = (code: string): string => {
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  // Built-in valid referral code that always works (normalized form)
  const ALWAYS_VALID_REFERRAL_CODE = 'TATY8492';
  // Canonical format for storing in profile
  const CANONICAL_REFERRAL_CODE = 'TATY-8492';

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    // Determine the canonical referral code to save (if valid)
    let canonicalReferralCode: string | null = null;
    
    // Validate referral code before signup if provided
    if (referralCode && referralCode.trim()) {
      const enteredCode = normalizeReferralCode(referralCode);
      
      // Check if it matches the always-valid code (TATY-8492)
      if (enteredCode === ALWAYS_VALID_REFERRAL_CODE) {
        console.log('Referral code TATY-8492 validated successfully (built-in)');
        canonicalReferralCode = CANONICAL_REFERRAL_CODE;
      } else {
        // Check against database configured code
        try {
          const { data: settingsData, error: settingsError } = await supabase
            .from('admin_settings')
            .select('setting_value')
            .eq('setting_key', 'referral_settings')
            .maybeSingle();

          if (settingsError) {
            console.error('Error fetching referral settings:', settingsError);
            return { error: { message: 'Invalid referral code. Please check and try again.' } };
          }

          // Parse setting_value - handle both object and string formats
          let referralSettings: { referralCode?: string; referralEmail?: string } | null = null;
          
          if (settingsData?.setting_value) {
            if (typeof settingsData.setting_value === 'string') {
              try {
                referralSettings = JSON.parse(settingsData.setting_value);
              } catch {
                referralSettings = null;
              }
            } else if (typeof settingsData.setting_value === 'object') {
              referralSettings = settingsData.setting_value as { referralCode?: string; referralEmail?: string };
            }
          }

          if (referralSettings && referralSettings.referralCode) {
            const storedCode = normalizeReferralCode(referralSettings.referralCode);
            
            // Check if the entered code matches the configured code OR the always-valid code
            if (enteredCode === storedCode || enteredCode === ALWAYS_VALID_REFERRAL_CODE) {
              console.log('Referral code validated successfully');
              // Store the original configured format or the canonical format
              canonicalReferralCode = enteredCode === ALWAYS_VALID_REFERRAL_CODE 
                ? CANONICAL_REFERRAL_CODE 
                : referralSettings.referralCode.trim().toUpperCase();
            } else {
              console.log('Referral code mismatch:', { entered: enteredCode, stored: storedCode });
              return { error: { message: 'Invalid referral code. Please check and try again.' } };
            }
          } else {
            // No referral settings configured - only accept the always-valid code
            if (enteredCode === ALWAYS_VALID_REFERRAL_CODE) {
              canonicalReferralCode = CANONICAL_REFERRAL_CODE;
            } else {
              console.log('No referral code configured and code is not the default');
              return { error: { message: 'Invalid referral code. Please check and try again.' } };
            }
          }
        } catch (err) {
          console.error('Error validating referral code:', err);
          return { error: { message: 'Invalid referral code. Please check and try again.' } };
        }
      }
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, referral_code: canonicalReferralCode || null }
      }
    });
    
    // Send welcome email with verification link (no auth required)
    if (!error && data?.user) {
      setTimeout(() => {
        sendWelcomeEmail(data.user!.id, email, fullName);
      }, 0);

      // If referral code is provided and valid, save to profile and send notification
      if (canonicalReferralCode) {
        setTimeout(async () => {
          try {
            // Update profile with the canonical referral code format
            await supabase
              .from('profiles')
              .update({ referral_code: canonicalReferralCode })
              .eq('user_id', data.user!.id);

            // Get referral settings to find the notification email
            const { data: settingsData } = await supabase
              .from('admin_settings')
              .select('setting_value')
              .eq('setting_key', 'referral_settings')
              .maybeSingle();

            // Parse settings robustly
            let referralEmail: string | null = null;
            if (settingsData?.setting_value) {
              if (typeof settingsData.setting_value === 'string') {
                try {
                  const parsed = JSON.parse(settingsData.setting_value);
                  referralEmail = parsed.referralEmail;
                } catch {
                  referralEmail = null;
                }
              } else if (typeof settingsData.setting_value === 'object') {
                referralEmail = (settingsData.setting_value as { referralEmail?: string }).referralEmail || null;
              }
            }

            // Send notification email if we have a valid email
            if (referralEmail) {
              await supabase.functions.invoke('send-referral-notification', {
                body: {
                  referralEmail,
                  referredUserName: fullName,
                  referredUserEmail: email,
                  referralCode: canonicalReferralCode,
                  type: 'signup'
                }
              });
            }
          } catch (err) {
            console.error('Error processing referral:', err);
          }
        }, 500);
      }
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // No email sent on login - only on signup
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};