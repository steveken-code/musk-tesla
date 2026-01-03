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

interface InvestmentActivationRequest {
  userEmail: string;
  userName: string;
  amount: number;
  investmentId: string;
  investmentDate: string;
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

    const { userEmail, userName, amount, investmentId, investmentDate } = await req.json() as InvestmentActivationRequest;

    console.log(`Sending investment activation email to ${userEmail} for $${amount}`);

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    const formattedDate = new Date(investmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Activated</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px; text-align: center;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✓</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">INVESTMENT ACTIVATED</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your funds are now working for you</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px;">
            <p style="color: #e2e8f0; font-size: 16px; margin: 0 0 30px 0;">
              Dear <strong style="color: white;">${userName}</strong>,
            </p>

            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
              Great news! Your investment has been verified and is now <strong style="color: #22c55e;">ACTIVE</strong>. 
              Your capital is now being actively managed in our Tesla growth portfolio.
            </p>

            <!-- Amount Display -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Investment Amount</p>
              <p style="color: #22c55e; font-size: 42px; font-weight: 800; margin: 0;">${formattedAmount}</p>
            </div>

            <!-- Investment Details -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 30px 0;">
              <h3 style="color: white; margin: 0 0 16px 0; font-size: 16px;">📋 Investment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #94a3b8; padding: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">Transaction ID</td>
                  <td style="color: white; padding: 10px 0; font-size: 14px; text-align: right; font-family: monospace; border-bottom: 1px solid rgba(255,255,255,0.08);">${investmentId.slice(0, 8)}...</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 10px 0; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">Date Submitted</td>
                  <td style="color: white; padding: 10px 0; font-size: 14px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #94a3b8; padding: 10px 0; font-size: 14px;">Status</td>
                  <td style="padding: 10px 0; text-align: right;">
                    <span style="background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">ACTIVE</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Growth Potential -->
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Expected Returns</p>
              <p style="color: #22c55e; font-size: 24px; font-weight: 700; margin: 0;">📈 Up to 847% Growth Potential</p>
              <p style="color: #475569; font-size: 12px; margin: 8px 0 0 0;">Based on Tesla's 5-year historical performance</p>
            </div>

            <!-- What's Next -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 30px 0;">
              <h3 style="color: white; margin: 0 0 15px 0; font-size: 16px;">🚀 What Happens Next?</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; color: #94a3b8; font-size: 14px; line-height: 2;">
                <li>Your investment is now actively managed</li>
                <li>Track real-time performance on your dashboard</li>
                <li>Receive profit updates as your investment grows</li>
                <li>Withdraw profits anytime from your dashboard</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #e82127 0%, #dc2626 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                View Your Portfolio →
              </a>
            </div>

            <!-- Support -->
            <div style="background: linear-gradient(135deg, rgba(232,33,39,0.1) 0%, rgba(220,38,38,0.1) 100%); border: 1px solid rgba(232,33,39,0.3); border-radius: 12px; padding: 20px; text-align: center;">
              <p style="color: #e2e8f0; margin: 0 0 12px 0; font-size: 14px;">Questions about your investment?</p>
              <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Contact Support on WhatsApp
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: rgba(0,0,0,0.3); padding: 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} TeslaInvest | msktesla.net
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
        subject: `✅ Investment Activated - ${formattedAmount} | TeslaInvest`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Investment activation email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-investment-activation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
