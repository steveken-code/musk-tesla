import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const fromEmail = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

const PRODUCTION_URL = "https://msktesla.net";
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://msktesla.net",
  "https://www.msktesla.net"
];

// Lockout settings
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.includes('lovableproject.com') || origin.includes('lovable.app')
  ) ? origin : PRODUCTION_URL;
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface AdminLoginRequest {
  email: string;
  password: string;
}

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { email, password }: AdminLoginRequest = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    console.log(`Admin login attempt for email: ${email} from IP: ${ipAddress}`);

    // Check for lockout - count failed attempts in last 15 minutes
    const lockoutTime = new Date(Date.now() - LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: attemptsError } = await supabaseAdmin
      .from("admin_login_attempts")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("success", false)
      .gte("created_at", lockoutTime);

    if (attemptsError) {
      console.error("Error checking login attempts:", attemptsError);
    }

    const failedCount = recentAttempts?.length || 0;

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      console.log(`Account locked for ${email}: ${failedCount} failed attempts`);
      
      // Log the blocked attempt
      await supabaseAdmin.from("admin_login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        success: false,
        user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ 
          error: `Account temporarily locked. Too many failed attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
          locked: true,
          remainingMinutes: LOCKOUT_DURATION_MINUTES
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Attempt to sign in
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      console.log(`Authentication failed for ${email}: ${authError?.message}`);
      
      // Log failed attempt
      await supabaseAdmin.from("admin_login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        success: false,
        user_agent: userAgent
      });

      const remainingAttempts = MAX_FAILED_ATTEMPTS - failedCount - 1;

      return new Response(
        JSON.stringify({ 
          error: "Invalid email or password",
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.log(`User ${email} is not an admin`);
      
      // Sign out the non-admin user
      await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      
      // Log failed attempt (not admin)
      await supabaseAdmin.from("admin_login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        success: false,
        user_agent: userAgent
      });

      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 2FA code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Delete any existing unused codes for this user
    await supabaseAdmin
      .from("admin_2fa_codes")
      .delete()
      .eq("email", email.toLowerCase())
      .eq("used", false);

    // Insert new 2FA code
    const { error: codeError } = await supabaseAdmin
      .from("admin_2fa_codes")
      .insert({
        user_id: authData.user.id,
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt
      });

    if (codeError) {
      console.error("Error creating 2FA code:", codeError);
      return new Response(
        JSON.stringify({ error: "Failed to generate 2FA code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", authData.user.id)
      .single();

    const userName = profile?.full_name || "Admin";

    // Send 2FA code via email
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      try {
        const result = await resend.emails.send({
          from: `Tesla Investment <${fromEmail}>`,
          to: [email],
          subject: "Your Admin Login Verification Code",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(239, 68, 68, 0.2);">
                          <h1 style="margin: 0; color: #ef4444; font-size: 28px; font-weight: 700;">🔐 Admin Verification</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px; color: #e2e8f0; font-size: 16px; line-height: 1.6;">
                            Hello ${userName},
                          </p>
                          <p style="margin: 0 0 30px; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                            Your two-factor authentication code for admin login is:
                          </p>
                          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px;">
                            <span style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
                          </div>
                          <p style="margin: 0 0 20px; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                            ⏰ This code expires in <strong style="color: #ef4444;">5 minutes</strong>.
                          </p>
                          <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                            If you didn't request this code, please ignore this email and ensure your account is secure.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 40px 30px; text-align: center; border-top: 1px solid rgba(239, 68, 68, 0.2);">
                          <p style="margin: 0; color: #475569; font-size: 12px;">
                            © 2024 Tesla Investment Platform. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        console.log("2FA email sent successfully:", result);
      } catch (error) {
        console.error("Failed to send 2FA email:", error);
      }
    } else {
      console.log("RESEND_API_KEY not configured, 2FA code:", code);
    }

    // Sign out the user - they need to complete 2FA first
    await supabaseAdmin.auth.admin.signOut(authData.session.access_token);

    console.log(`2FA code sent to ${email}, awaiting verification`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Verification code sent to your email",
        requires2FA: true
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Admin login error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
