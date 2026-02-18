import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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

interface InvestmentConfirmationRequest {
  email: string;
  name: string;
  amount: number;
  investmentId: string;
  investmentDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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

    const transactionId = investmentId.substring(0, 8).toUpperCase();

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
                    <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); page-break-inside: avoid; min-width: 100%;">

                      <!-- Header - Tesla Red -->
                      <tr>
                        <td style="padding: 50px 50px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                            <tr><td align="center" style="color: #ffffff; font-size: 18px; font-weight: 600; padding-top: 10px;"><span style="color: #ffffff;">Investment Confirmation</span></td></tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Greeting -->
                      <tr>
                        <td style="padding: 40px 50px 15px;">
                          <p style="margin: 0; color: #374151; font-size: 22px; font-weight: 700;">
                            Hello ${name || 'Investor'},
                          </p>
                        </td>
                      </tr>

                      <!-- Success Badge -->
                      <tr>
                        <td style="padding: 15px 50px 25px;">
                          <div style="text-align: center; margin: 25px 0;">
                            <span style="background: #dcfce7; color: #166534; padding: 14px 35px; border-radius: 50px; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                              ✅ INVESTMENT ACTIVE
                            </span>
                          </div>
                          <p style="margin: 25px 0 0; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                            Your investment has been successfully processed and is now active in your portfolio.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Investment Details Card -->
                      <tr>
                        <td style="padding: 0 50px 35px;">
                          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 35px; margin: 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr><td style="color: #3b82f6; font-size: 17px; font-weight: 700; padding-bottom: 20px;"><span style="color: #3b82f6;">📋 Investment Details</span></td></tr>
                            </table>
                            
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
                                      <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Amount</td>
                                      <td style="color: #059669; font-size: 22px; text-align: right; font-weight: 800;">${formattedAmount}</td>
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
                                <td style="padding: 15px 0;">
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Status</td>
                                      <td style="text-align: right;">
                                        <span style="background: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">✅ ACTIVE</span>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>

                      <!-- Dashboard CTA - Tesla Red -->
                      <tr>
                        <td style="padding: 0 50px 35px; text-align: center;">
                          <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                            View Dashboard →
                          </a>
                        </td>
                      </tr>

                      <!-- Need Assistance? -->
                      <tr>
                        <td style="padding: 0 50px 24px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;">
                            <tr><td style="padding: 20px; text-align: center;">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr><td align="center" style="color: #111827; font-size: 15px; font-weight: 600; padding-bottom: 6px;">Need Assistance?</td></tr>
                                <tr><td align="center" style="color: #6b7280; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                                <tr><td align="center"><a href="https://wa.me/12186500840" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
                                <tr><td align="center" style="color: #9ca3af; font-size: 11px; padding-top: 12px;">Available 24/7 &nbsp;&#8226;&nbsp; Secure &amp; Confidential</td></tr>
                              </table>
                            </td></tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 16px 50px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 12px 12px;">
                          <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.6;">This is a system-generated notification from Tesla Stock Platform.</p>
                          <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved. &nbsp;&#8226;&nbsp; Confidential communication.</p>
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
        console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: investment_confirmation | Error: ${errorData}`);
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const result = await res.json();
      console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: investment_confirmation | Resend_ID: ${result.id} | Time: ${sendTime}`);
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
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
