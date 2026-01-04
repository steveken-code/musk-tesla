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

interface WithdrawalConfirmationRequest {
  email: string;
  name: string;
  amount: number;
  withdrawalId: string;
  withdrawalDate: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed';
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

    const { name, email, amount, withdrawalId, withdrawalDate, paymentMethod, status }: WithdrawalConfirmationRequest = await req.json();

    // Verify the email matches the authenticated user
    if (user.email !== email) {
      console.error("Email mismatch: requested email does not match authenticated user");
      return new Response(
        JSON.stringify({ error: "Forbidden - Email does not match authenticated user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the withdrawal belongs to the authenticated user
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('user_id', user.id)
      .single();

    if (withdrawalError || !withdrawal) {
      console.error("Withdrawal verification failed:", withdrawalError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Withdrawal does not belong to user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending withdrawal confirmation to ${email} for $${amount}`);

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    const formattedDate = new Date(withdrawalDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const statusColors = {
      pending: { bg: '#fbbf24', text: 'PENDING' },
      processing: { bg: '#3b82f6', text: 'PROCESSING' },
      completed: { bg: '#22c55e', text: 'COMPLETED' },
    };

    const statusConfig = statusColors[status] || statusColors.pending;

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
          subject: `Withdrawal ${statusConfig.text} - ${formattedAmount}`,
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
                        <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);">
                          <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                            <span style="color: #3b82f6; font-size: 40px; font-weight: bold;">💸</span>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                            WITHDRAWAL REQUEST
                          </h1>
                          <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500; letter-spacing: 1px;">
                            Your funds are on the way
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Amount Display -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                          <p style="margin: 0 0 10px; color: #737373; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Withdrawal Amount</p>
                          <h2 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 800;">
                            ${formattedAmount}
                          </h2>
                          <div style="margin-top: 20px;">
                            <span style="background: ${statusConfig.bg}; color: #000000; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 700; text-transform: uppercase;">${statusConfig.text}</span>
                          </div>
                          <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #3b82f6, #60a5fa); margin: 25px auto 0; border-radius: 2px;"></div>
                        </td>
                      </tr>
                      
                      <!-- Withdrawal Details -->
                      <tr>
                        <td style="padding: 0 40px 40px;">
                          <p style="margin: 0 0 25px; color: #a3a3a3; font-size: 17px; line-height: 1.7; text-align: center;">
                            Hi ${name || 'Investor'}, your withdrawal request has been received and is being processed. Here are the details:
                          </p>
                          
                          <!-- Details Card -->
                          <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 30px; margin: 30px 0;">
                            <h3 style="margin: 0 0 20px; color: #ffffff; font-size: 18px; font-weight: 700; text-align: center;">
                              📋 Withdrawal Details
                            </h3>
                            
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Reference ID</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right; font-family: monospace;">${withdrawalId}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Amount</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right; font-weight: 700;">${formattedAmount}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Request Date</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right;">${formattedDate}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #737373; font-size: 14px;">Payment Method</td>
                                      <td style="color: #ffffff; font-size: 14px; text-align: right;">${paymentMethod}</td>
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
                                        <span style="background: ${statusConfig.bg}; color: #000000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${statusConfig.text}</span>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>

                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 40px 0 30px;">
                            <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #e31937 0%, #cc0000 50%, #990000 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 15px 40px -10px rgba(227, 25, 55, 0.5);">
                              Track Withdrawal →
                            </a>
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

      const sendTime = Date.now();
      if (!res.ok) {
        const errorData = await res.text();
        console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: withdrawal_confirmation | Error: ${errorData}`);
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const result = await res.json();
      console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: withdrawal_confirmation | Resend_ID: ${result.id} | Time: ${sendTime}`);
      return result;
    };

    // Send in background for faster response
    EdgeRuntime.waitUntil(sendTask());

    return new Response(JSON.stringify({ success: true, message: "Withdrawal confirmation queued" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-withdrawal-confirmation function:", error);
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
