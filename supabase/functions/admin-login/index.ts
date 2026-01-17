import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    // Log successful login
    await supabaseAdmin.from("admin_login_attempts").insert({
      email: email.toLowerCase(),
      ip_address: ipAddress,
      success: true,
      user_agent: userAgent
    });

    console.log(`Admin login successful for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: authData.session,
        user: authData.user
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
