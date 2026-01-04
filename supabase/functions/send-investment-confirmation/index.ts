import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Msk Tesla <support@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvestmentConfirmationRequest {
  email: string;
  name: string;
  amount: number;
  investmentId: string;
  investmentDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, email, amount, investmentId, investmentDate }: InvestmentConfirmationRequest = await req.json();

    // Verify the email matches the authenticated user
    if (user.email !== email) {
      console.error("Email mismatch: requested email does not match authenticated user");
      return new Response(
        JSON.stringify({ error: "Forbidden - Email does not match authenticated user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the investment belongs to the authenticated user
    const { data: investment, error: investmentError } = await supabaseClient
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .eq('user_id', user.id)
      .single();

    if (investmentError || !investment) {
      console.error("Investment verification failed:", investmentError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Investment does not belong to user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending investment confirmation to ${email} for $${amount}`);

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

    const sendTask = async () => {
      if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `Investment Confirmed - ${formattedAmount}`,
          headers: {
            "X-Priority": "1",
            "Importance": "high",
          },
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
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #166534 100%);">
                          <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                            <span style="color: #16a34a; font-size: 40px; font-weight: bold;">✓</span>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                            INVESTMENT CONFIRMED
                          </h1>
                          <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500; letter-spacing: 1px;">
                            Your funds are now working for you
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Amount Display -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #737373; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Investment Amount</p>
                          <h2 style="margin: 0; color: #22c55e; font-size: 48px; font-weight: 800;">
                            ${formattedAmount}
                          </h2>
                          <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #22c55e, #16a34a); margin: 20px auto; border-radius: 2px;"></div>
                        </td>
                      </tr>
                      
                      <!-- Investment Details -->
                      <tr>
                        <td style="padding: 0 40px 40px;">
                          <p style="margin: 0 0 25px; color: #a3a3a3; font-size: 17px; line-height: 1.7; text-align: center;">
                            Congratulations ${name || 'Investor'}! Your investment has been successfully processed and is now active in your portfolio.
                          </p>
                          
                          <!-- Details Card -->
                          <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 30px; margin: 30px 0;">
                            <h3 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 700; text-align: center;">
                              📋 Investment Details
                            </h3>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Transaction ID</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right; font-family: monospace;">${investmentId}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Amount</td>
                                      <td style="color: #22c55e; font-size: 14px; text-align: right; font-weight: 700;">${formattedAmount}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Date</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right;">${formattedDate}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Status</td>
                                      <td style="text-align: right;">
                                        <span style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">ACTIVE</span>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #000000; padding: 30px 40px; text-align: center; border-top: 1px solid #1a1a1a;">
                          <p style="margin: 0 0 10px; color: #525252; font-size: 13px; font-weight: 500;">
                            © ${new Date().getFullYear()} TeslaInvest. All rights reserved.
                          </p>
                          <p style="margin: 0 0 15px; color: #404040; font-size: 12px;">
                            This email was sent to ${email}
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
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const result = await res.json();
      console.log("Investment confirmation email sent successfully:", result);
      return result;
    };

    EdgeRuntime.waitUntil(sendTask());

    return new Response(JSON.stringify({ success: true, message: "Investment confirmation queued" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-investment-confirmation function:", error);
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
