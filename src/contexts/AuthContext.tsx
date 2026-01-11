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

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    // Validate referral code before signup if provided
    if (referralCode && referralCode.trim()) {
      try {
        const { data: settingsData } = await supabase
          .from('admin_settings')
          .select('setting_value')
          .eq('setting_key', 'referral_settings')
          .maybeSingle();

        if (settingsData?.setting_value) {
          const referralSettings = settingsData.setting_value as { referralCode: string; referralEmail: string };
          // Check if the entered code matches the configured code
          if (referralCode.trim().toUpperCase() !== referralSettings.referralCode?.toUpperCase()) {
            return { error: { message: 'Invalid referral code. Please check and try again.' } };
          }
        }
      } catch (err) {
        console.error('Error validating referral code:', err);
      }
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, referral_code: referralCode || null }
      }
    });
    
    // Send welcome email with verification link (no auth required)
    if (!error && data?.user) {
      setTimeout(() => {
        sendWelcomeEmail(data.user!.id, email, fullName);
      }, 0);

      // If referral code is provided and valid, save to profile and send notification
      if (referralCode && referralCode.trim()) {
        setTimeout(async () => {
          try {
            // Update profile with referral code
            await supabase
              .from('profiles')
              .update({ referral_code: referralCode.trim().toUpperCase() })
              .eq('user_id', data.user!.id);

            // Get referral settings to find the notification email
            const { data: settingsData } = await supabase
              .from('admin_settings')
              .select('setting_value')
              .eq('setting_key', 'referral_settings')
              .maybeSingle();

            if (settingsData?.setting_value) {
              const referralSettings = settingsData.setting_value as { referralCode: string; referralEmail: string };
              // Send notification email (code is already validated)
              await supabase.functions.invoke('send-referral-notification', {
                body: {
                  referralEmail: referralSettings.referralEmail,
                  referredUserName: fullName,
                  referredUserEmail: email,
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