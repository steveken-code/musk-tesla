import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyTokenRequest {
  token: string;
  withdrawal_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, withdrawal_id }: VerifyTokenRequest = await req.json();

    if (!token || !withdrawal_id) {
      return new Response(
        JSON.stringify({ error: "Missing token or withdrawal_id" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find KYC record by token (using service role to bypass RLS)
    const { data, error: fetchError } = await supabaseAdmin
      .from("kyc_verifications")
      .select("id, user_id, user_name, bank_country, withdrawal_id, status")
      .eq("kyc_token", token)
      .eq("withdrawal_id", withdrawal_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching KYC record:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to verify token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification link", valid: false }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Return KYC data for valid token
    return new Response(
      JSON.stringify({ 
        valid: true, 
        kycData: data,
        status: data.status
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in verify-kyc-token:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
