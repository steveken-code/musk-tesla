import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

interface VerifyEmailRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyEmailRequest = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Token is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Verifying email token`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('verified', false)
      .single();

    if (tokenError || !tokenData) {
      console.log("Token not found or already verified");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired verification link" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ success: false, error: "Verification link has expired. Please request a new one." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark token as verified
    await supabaseAdmin
      .from('email_verification_tokens')
      .update({ verified: true })
      .eq('id', tokenData.id);

    // Update profile to mark email as verified
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ email_verified: true })
      .eq('user_id', tokenData.user_id);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
    }

    // Also update Supabase auth user metadata
    await supabaseAdmin.auth.admin.updateUserById(tokenData.user_id, {
      user_metadata: { email_verified: true }
    });

    console.log("Email verified successfully for user:", tokenData.user_id);

    return new Response(
      JSON.stringify({ success: true, email: tokenData.email }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred while verifying your email. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
