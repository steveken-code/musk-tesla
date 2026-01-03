import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tesla Stock <noreply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Tesla logo URL for email
const TESLA_LOGO_URL = "https://ndvwqmoahasggeobwwld.supabase.co/storage/v1/object/public/assets/new_tesla-removebg-preview.png";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProfitNotificationRequest {
  userId: string;
  investmentId: string;
  profitAmount: number;
  totalProfit: number;
  investmentAmount: number;
}

async function sendProfitEmail(request: ProfitNotificationRequest) {
  const { userId, investmentId, profitAmount, totalProfit, investmentAmount } = request;
  
  console.log(`Sending profit notification for user ${userId}, profit: $${profitAmount}`);

  // Create admin client with service role key
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('email, full_name')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError || !profile?.email) {
    console.error("Failed to get user profile:", profileError);
    return { success: false, error: "User profile not found" };
  }

  const { email, full_name: name } = profile;
  const displayName = name || email.split('@')[0];
  const dashboardLink = `https://msktesla.net/dashboard`;
  const profitPercentage = ((totalProfit / investmentAmount) * 100).toFixed(1);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `💰 You just earned $${profitAmount.toLocaleString()} profit! - Tesla Stock`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #171717 0%, #0a0a0a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
                  
                  <!-- Header with Tesla Logo -->
                  <tr>
                    <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);">
                      <img src="${TESLA_LOGO_URL}" alt="Tesla Stock" style="width: 120px; height: 120px; margin-bottom: 20px; border-radius: 16px;" />
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                        TESLA STOCK
                      </h1>
                      <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500; letter-spacing: 1px;">
                        Profit Alert! 🎉
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Profit Banner -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center;">
                      <h2 style="margin: 0; color: #22c55e; font-size: 48px; font-weight: 800;">
                        +$${profitAmount.toLocaleString()}
                      </h2>
                      <p style="margin: 10px 0 0; color: #a3a3a3; font-size: 16px;">
                        Profit Added to Your Account
                      </p>
                      <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #22c55e, #16a34a); margin: 20px auto; border-radius: 2px;"></div>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <p style="margin: 0 0 25px; color: #a3a3a3; font-size: 17px; line-height: 1.7; text-align: center;">
                        Congratulations, ${displayName}! Your Tesla Stock investment is performing well.
                      </p>
                      
                      <!-- Stats Cards -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td width="50%" style="padding: 10px;">
                            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center;">
                              <div style="color: #22c55e; font-size: 28px; font-weight: 800;">$${totalProfit.toLocaleString()}</div>
                              <div style="color: #737373; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total Profit</div>
                            </div>
                          </td>
                          <td width="50%" style="padding: 10px;">
                            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center;">
                              <div style="color: #3b82f6; font-size: 28px; font-weight: 800;">+${profitPercentage}%</div>
                              <div style="color: #737373; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">ROI</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Investment Summary -->
                      <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 25px; margin: 30px 0;">
                        <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 18px; font-weight: 700;">
                          📊 Investment Summary
                        </h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #262626;">
                              <span style="color: #737373;">Initial Investment</span>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #262626; text-align: right;">
                              <span style="color: #ffffff; font-weight: 600;">$${investmentAmount.toLocaleString()}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #262626;">
                              <span style="color: #737373;">This Profit</span>
                            </td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #262626; text-align: right;">
                              <span style="color: #22c55e; font-weight: 600;">+$${profitAmount.toLocaleString()}</span>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 0;">
                              <span style="color: #737373;">Total Profit</span>
                            </td>
                            <td style="padding: 10px 0; text-align: right;">
                              <span style="color: #22c55e; font-weight: 700; font-size: 18px;">$${totalProfit.toLocaleString()}</span>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- Dashboard CTA -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 10px 30px -10px rgba(34, 197, 94, 0.5);">
                          View Dashboard →
                        </a>
                      </div>
                      
                      <!-- Tip -->
                      <div style="border-left: 4px solid #22c55e; padding-left: 20px; margin: 30px 0;">
                        <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6; margin: 0;">
                          <strong style="color: #22c55e;">Pro Tip:</strong> Your profits are available for withdrawal anytime from your dashboard. Keep growing your portfolio!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #000000; padding: 30px 40px; text-align: center; border-top: 1px solid #1a1a1a;">
                      <p style="margin: 0 0 10px; color: #525252; font-size: 13px; font-weight: 500;">
                        © ${new Date().getFullYear()} Tesla Stock. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #404040; font-size: 11px;">
                        Tesla Stock | Smart Investing in Clean Energy
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Resend API error:", errorData);
    return { success: false, error: errorData };
  }

  const data = await res.json();
  console.log("Profit notification email sent successfully:", data);
  return { success: true, data };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ProfitNotificationRequest = await req.json();

    if (!request.userId || !request.investmentId) {
      return new Response(
        JSON.stringify({ error: "userId and investmentId are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use background task for faster response
    EdgeRuntime.waitUntil(sendProfitEmail(request));

    return new Response(
      JSON.stringify({ success: true, message: "Profit notification queued" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-profit-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
