import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIP, rateLimitResponse } from "../_shared/rate-limiter.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

// Rate limit configuration
const RATE_LIMIT_IP_MAX = 20;     // 20 requests per IP
const RATE_LIMIT_IP_WINDOW = 60;  // 1 minute

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

interface VerifyTokenRequest {
  token: string;
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
    const ipLimit = checkRateLimit(`verify-reset-token:ip:${clientIP}`, RATE_LIMIT_IP_MAX, RATE_LIMIT_IP_WINDOW);
    
    if (!ipLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP} on verify-reset-token`);
      return rateLimitResponse(ipLimit.retryAfter, corsHeaders);
    }

    const { token }: VerifyTokenRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Verifying reset token`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !tokenData) {
      console.log("Token not found or already used");
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid or expired token" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ valid: false, error: "Token has expired" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Token is valid");

    return new Response(
      JSON.stringify({ valid: true, email: tokenData.email }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-reset-token function:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ valid: false, error: "An error occurred while verifying the token. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
