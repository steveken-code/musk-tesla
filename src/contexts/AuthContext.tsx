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

  // Ensure profile exists for the user (creates if missing, updates if name/email is null)
  const ensureProfileExists = async (user: User) => {
    if (!user) return;
    
    try {
      // First try to get existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      const fullName = user.user_metadata?.full_name || null;
      const email = user.email || null;

      if (!existingProfile) {
        // Profile doesn't exist - create it
        await supabase.from('profiles').insert({
          user_id: user.id,
          email,
          full_name: fullName,
        });
        console.log('Profile created for user:', user.id);
      } else {
        // Profile exists but may have missing fields - update only if needed
        const needsUpdate = 
          (!existingProfile.full_name && fullName) ||
          (!existingProfile.email && email);
        
        if (needsUpdate) {
          const updateData: { full_name?: string; email?: string } = {};
          if (!existingProfile.full_name && fullName) updateData.full_name = fullName;
          if (!existingProfile.email && email) updateData.email = email;
          
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('user_id', user.id);
          console.log('Profile updated with missing fields for user:', user.id);
        }
      }
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Ensure profile exists when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => {
            ensureProfileExists(session.user);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Also ensure profile exists on initial load if user is logged in
      if (session?.user) {
        setTimeout(() => {
          ensureProfileExists(session.user);
        }, 0);
      }
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
      // Uses explicit UUID::text cast since user_id is UUID type in PostgreSQL
      try {
        console.log('Validating referral code:', { 
          original: referralCode, 
          normalized: normalizedCode
        });
        
        // Use RPC function for server-side UUID-to-text validation
        const { data: referrerId, error: rpcError } = await supabase
          .rpc('validate_referral_code', { p_code: normalizedCode });
        
        if (rpcError) {
          console.error('Referral code query error:', rpcError);
          return { error: { message: 'Error validating referral code. Please try again.' } };
        }
        
        if (!referrerId) {
          console.log('Referral code not found:', normalizedCode);
          return { error: { message: 'Invalid referral code. The code may have expired or was entered incorrectly.' } };
        }
        
        validReferrerUserId = referrerId;
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