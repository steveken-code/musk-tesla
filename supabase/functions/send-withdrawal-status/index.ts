import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "TeslaInvest <noreply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalStatusRequest {
  userEmail: string;
  userName: string;
  amount: number;
  status: string;
  holdMessage?: string;
  paymentDetails: string;
  country: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for admin verification
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userEmail, userName, amount, status, holdMessage, paymentDetails, country } = await req.json() as WithdrawalStatusRequest;

    let subject = "";
    let statusMessage = "";
    let statusColor = "";
    let additionalInfo = "";

    switch (status) {
      case "completed":
        subject = "✅ Withdrawal Completed - Tesla Investment Platform";
        statusMessage = "Your withdrawal has been successfully processed!";
        statusColor = "#22c55e";
        additionalInfo = `
          <p style="color: #16a34a; font-weight: 600;">The funds have been transferred to your account.</p>
          <p>Please allow 1-3 business days for the funds to reflect in your account depending on your financial institution.</p>
        `;
        break;
      case "on_hold":
        subject = "⚠️ Withdrawal On Hold - Action Required";
        statusMessage = "Your withdrawal request has been placed on hold.";
        statusColor = "#f97316";
        additionalInfo = `
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #ea580c; font-weight: 600; margin: 0 0 8px 0;">Hold Reason:</p>
            <p style="color: #9a3412; margin: 0;">${holdMessage || "Additional verification required. Please contact support for assistance."}</p>
          </div>
          <p>Please contact our support team via WhatsApp for immediate assistance.</p>
        `;
        break;
      case "pending":
        subject = "🕐 Withdrawal Request Received - Tesla Investment Platform";
        statusMessage = "Your withdrawal request is being processed.";
        statusColor = "#eab308";
        additionalInfo = `
          <p>Our team is reviewing your withdrawal request. You will receive another email once the status is updated.</p>
          <p>Processing typically takes 1-2 business days.</p>
        `;
        break;
      default:
        subject = "Withdrawal Status Update - Tesla Investment Platform";
        statusMessage = `Your withdrawal status has been updated to: ${status}`;
        statusColor = "#6b7280";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e82127 0%, #dc2626 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Tesla Investment Platform</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Withdrawal Status Update</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 24px 0;">
              Hello <strong style="color: white;">${userName || "Valued Investor"}</strong>,
            </p>

            <!-- Status Badge -->
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
              <div style="display: inline-block; background: ${statusColor}20; border: 2px solid ${statusColor}; border-radius: 50px; padding: 12px 24px;">
                <span style="color: ${statusColor}; font-weight: 700; font-size: 18px; text-transform: uppercase;">${status.replace('_', ' ')}</span>
              </div>
              <p style="color: #e2e8f0; font-size: 16px; margin: 16px 0 0 0;">${statusMessage}</p>
            </div>

            <!-- Withdrawal Details -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: white; margin: 0 0 16px 0; font-size: 16px;">Withdrawal Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Amount:</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right; font-weight: 600;">$${amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Country:</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right;">${country}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 8px 0; font-size: 14px;">Payment Details:</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right; word-break: break-all;">${paymentDetails}</td>
                </tr>
              </table>
            </div>

            <!-- Additional Info -->
            <div style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
              ${additionalInfo}
            </div>

            <!-- Support CTA -->
            <div style="background: linear-gradient(135deg, rgba(232,33,39,0.1) 0%, rgba(220,38,38,0.1) 100%); border: 1px solid rgba(232,33,39,0.3); border-radius: 12px; padding: 20px; margin-top: 24px; text-align: center;">
              <p style="color: #e2e8f0; margin: 0 0 12px 0; font-size: 14px;">Need assistance?</p>
              <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Contact Support on WhatsApp
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: rgba(0,0,0,0.3); padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Tesla Investment Platform. All rights reserved.
            </p>
            <p style="color: #475569; font-size: 11px; margin: 8px 0 0 0;">
              This is an automated message. Please do not reply directly to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [userEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Withdrawal status email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-withdrawal-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
