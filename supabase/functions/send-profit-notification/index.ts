import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.includes('lovableproject.com') || origin.includes('lovable.app'));
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

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
  const transactionId = investmentId.substring(0, 8).toUpperCase();
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `You earned $${profitAmount.toLocaleString()} profit`,
      headers: {
        "X-Mailer": "Tesla Stock Platform",
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e5e5e5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  
                  <!-- Header - Tesla Red -->
                  <tr>
                    <td style="padding: 50px 50px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                  <h1 style="margin: 0; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                        Tesla Stock Platform
                      </h1>
                      <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 600;">
                        Profit Notification 🎉
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 40px 50px 15px;">
                      <p style="margin: 0; color: #c4b5fd; font-size: 22px; font-weight: 700;">
                        Hello ${displayName},
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Profit Banner -->
                  <tr>
                    <td style="padding: 15px 50px 25px;">
                      <div style="text-align: center; margin: 25px 0;">
                        <span style="background: #dcfce7; color: #166534; padding: 14px 35px; border-radius: 50px; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                          💰 PROFIT EARNED
                        </span>
                      </div>
                      <p style="margin: 25px 0 0; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                        Congratulations! Your Tesla Stock investment is performing well.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Profit Amount Display -->
                  <tr>
                    <td style="padding: 0 50px 25px; text-align: center;">
                      <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Profit Added</p>
                      <p style="color: #16a34a; font-size: 52px; font-weight: 800; margin: 0;">+$${profitAmount.toLocaleString()}</p>
                    </td>
                  </tr>
                  
                  <!-- Stats Cards -->
                  <tr>
                    <td style="padding: 0 50px 35px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="48%" style="padding: 10px;">
                            <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 16px; padding: 25px; text-align: center;">
                              <div style="color: #166534; font-size: 28px; font-weight: 800;">$${totalProfit.toLocaleString()}</div>
                              <div style="color: #15803d; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Profit</div>
                            </div>
                          </td>
                          <td width="4%"></td>
                          <td width="48%" style="padding: 10px;">
                            <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 16px; padding: 25px; text-align: center;">
                              <div style="color: #1e40af; font-size: 28px; font-weight: 800;">+${profitPercentage}%</div>
                              <div style="color: #1d4ed8; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">ROI</div>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Investment Details Card -->
                  <tr>
                    <td style="padding: 0 50px 35px;">
                      <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 35px; margin: 0;">
                        <h3 style="margin: 0 0 25px; color: #c4b5fd; font-size: 20px; font-weight: 700;">
                          📊 Investment Summary
                        </h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Transaction ID</td>
                                  <td style="color: #111827; font-size: 15px; text-align: right; font-weight: 700; font-family: monospace;">#${transactionId}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Description</td>
                                  <td style="color: #111827; font-size: 15px; text-align: right;">Profit Distribution</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Date</td>
                                  <td style="color: #111827; font-size: 15px; text-align: right;">${formattedDate}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Initial Investment</td>
                                  <td style="color: #111827; font-size: 15px; text-align: right; font-weight: 600;">$${investmentAmount.toLocaleString()}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">This Profit</td>
                                  <td style="color: #059669; font-size: 18px; text-align: right; font-weight: 800;">+$${profitAmount.toLocaleString()}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 15px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Total Profit</td>
                                  <td style="color: #059669; font-size: 22px; text-align: right; font-weight: 800;">$${totalProfit.toLocaleString()}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Pro Tip -->
                  <tr>
                    <td style="padding: 0 50px 35px;">
                      <div style="border-left: 5px solid #c4b5fd; padding-left: 25px;">
                        <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
                          <strong style="color: #c4b5fd;">Pro Tip:</strong> Your profits are available for withdrawal anytime from your dashboard. Keep growing your portfolio!
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Dashboard CTA - Tesla Red -->
                  <tr>
                    <td style="padding: 0 50px 35px; text-align: center;">
                      <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                        View Dashboard →
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Support -->
                  <tr>
                    <td style="padding: 0 50px 35px;">
                      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; text-align: center;">
                        <p style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: 600;">
                          Questions about your profits?
                        </p>
                        <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-size: 15px; font-weight: 700;">
                          💬 Contact Support on WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: #f9fafb; padding: 35px 50px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600;">
                        © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        This is an automated message. Please do not reply directly to this email.
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

  const sendTime = Date.now();
  if (!res.ok) {
    const errorData = await res.text();
    console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: profit_notification | Error: ${errorData}`);
    return { success: false, error: errorData };
  }

  const data = await res.json();
  console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: profit_notification | Resend_ID: ${data.id} | Time: ${sendTime}`);
  return { success: true, data };
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);