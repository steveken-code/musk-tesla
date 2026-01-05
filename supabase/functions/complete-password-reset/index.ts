import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP, rateLimitResponse } from "../_shared/rate-limiter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

// Rate limit configuration
const RATE_LIMIT_IP_MAX = 5;       // 5 requests per IP
const RATE_LIMIT_IP_WINDOW = 900;  // 15 minutes

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

interface CompleteResetRequest {
  token: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const clientIP = getClientIP(req);
    const ipLimit = checkRateLimit(`complete-reset:ip:${clientIP}`, RATE_LIMIT_IP_MAX, RATE_LIMIT_IP_WINDOW);
    
    if (!ipLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP} on complete-password-reset`);
      return rateLimitResponse(ipLimit.retryAfter, corsHeaders);
    }

    const { token, newPassword }: CompleteResetRequest = await req.json();
    
    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: "Token and new password are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Updated to 8 character minimum per NIST guidelines
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ success: false, error: "Password must be at least 8 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Completing password reset`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find and validate the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      console.log("Token not found or already used");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ success: false, error: "Token has expired" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // SECURITY FIX: Mark token as used FIRST (atomic operation) to prevent race conditions
    const { data: updateResult, error: tokenUpdateError } = await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenData.id)
      .eq('used', false) // Ensure it wasn't already used
      .select();

    if (tokenUpdateError || !updateResult || updateResult.length === 0) {
      console.log("Token already used or race condition detected");
      return new Response(
        JSON.stringify({ success: false, error: "Token has already been used" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Now update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Failed to update password:", updateError);
      // Don't expose internal error details to client
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update password. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Password reset completed successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in complete-password-reset function:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred while processing your request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
