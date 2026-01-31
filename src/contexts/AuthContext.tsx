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

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    // Validate referral code by checking if a user with this ID prefix exists
    let validReferrerUserId: string | null = null;
    let canonicalReferralCode: string | null = null;
    
    if (referralCode && referralCode.trim()) {
      const normalizedCode = normalizeReferralCode(referralCode);
      
      // Query profiles to find a user whose user_id starts with this code (case-insensitive)
      try {
        const { data: matchingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id')
          .ilike('user_id', `${normalizedCode.toLowerCase()}%`)
          .limit(1)
          .maybeSingle();
        
        if (profileError || !matchingProfile) {
          console.log('Referral code validation failed:', { normalizedCode, error: profileError });
          return { error: { message: 'Invalid referral code. Please check the link and try again.' } };
        }
        
        validReferrerUserId = matchingProfile.user_id;
        canonicalReferralCode = normalizedCode;
        console.log('Referral code validated:', { code: normalizedCode, referrer: validReferrerUserId });
      } catch (err) {
        console.error('Error validating referral code:', err);
        return { error: { message: 'Invalid referral code. Please check the link and try again.' } };
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

      // Update profile with full name and referral code if provided
      // The database trigger (handle_referral_signup) will automatically create the referral record
      setTimeout(async () => {
        try {
          // Update profile with the full name and referral code
          // This ensures the name is available for display in admin panel
          const updateData: { full_name: string; referral_code?: string } = { 
            full_name: fullName 
          };
          
          if (canonicalReferralCode) {
            updateData.referral_code = canonicalReferralCode;
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', data.user!.id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          } else {
            console.log('Profile updated with name and referral code');
          }

          // Only send referral notifications if there's a referral code
          if (canonicalReferralCode) {
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

            // Send notification email to REFERRER if we have a valid email
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

            // Send welcome bonus email to the REFERRED USER (the new user)
            await supabase.functions.invoke('send-referral-notification', {
              body: {
                referralEmail: email, // Not used for welcome_referred, but required by interface
                referredUserName: fullName,
                referredUserEmail: email,
                referralCode: canonicalReferralCode,
                type: 'welcome_referred'
              }
            });
          }
        } catch (err) {
          console.error('Error processing signup:', err);
        }
      }, 500);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Track user login attempt
    if (data?.user) {
      try {
        await supabase.functions.invoke('track-user-login', {
          body: {
            userId: data.user.id,
            email: email,
            success: true
          }
        });
      } catch (trackError) {
        console.error('Failed to track login:', trackError);
      }
    } else if (error) {
      // Track failed login attempt - we don't have user ID for failed attempts
      // This is handled server-side via auth logs
      console.log('Login failed:', error.message);
    }
    
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