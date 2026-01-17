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

interface Verify2FARequest {
  email: string;
  code: string;
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

    const { email, code, password }: Verify2FARequest = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                      req.headers.get("cf-connecting-ip") || 
                      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    console.log(`2FA verification attempt for email: ${email}`);

    if (!email || !code || !password) {
      return new Response(
        JSON.stringify({ error: "Email, code, and password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the 2FA code
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from("admin_2fa_codes")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (codeError || !codeData) {
      console.log(`Invalid or expired 2FA code for ${email}`);
      
      // Log failed 2FA attempt
      await supabaseAdmin.from("admin_login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        success: false,
        user_agent: userAgent + " [2FA Failed]"
      });

      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark code as used with atomic single-use enforcement
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from("admin_2fa_codes")
      .update({ used: true })
      .eq("id", codeData.id)
      .eq("used", false) // CRITICAL: Atomic single-use enforcement prevents race conditions
      .select();

    if (updateError || !updateResult || updateResult.length === 0) {
      console.log(`2FA code already used or race condition detected for ${email}`);
      
      // Log failed attempt due to already used code
      await supabaseAdmin.from("admin_login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: ipAddress,
        success: false,
        user_agent: userAgent + " [2FA Already Used]"
      });

      return new Response(
        JSON.stringify({ error: "Verification code has already been used" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sign in the user again to get a fresh session
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.session) {
      console.error("Failed to create session after 2FA:", authError);
      return new Response(
        JSON.stringify({ error: "Failed to complete authentication" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log successful login
    await supabaseAdmin.from("admin_login_attempts").insert({
      email: email.toLowerCase(),
      ip_address: ipAddress,
      success: true,
      user_agent: userAgent
    });

    // Clean up old codes for this user
    await supabaseAdmin
      .from("admin_2fa_codes")
      .delete()
      .eq("email", email.toLowerCase());

    console.log(`2FA verification successful for ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        session: authData.session,
        user: authData.user
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("2FA verification error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
