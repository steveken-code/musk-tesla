import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// No logo in header - matches platform standard

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

interface WithdrawalRequestEmail {
  email: string;
  name: string;
  amount: number;
  country: string;
  paymentMethod: string;
  paymentDetails: string;
  withdrawalId: string;
  supportPhone?: string;
  supportType?: string;
}

async function sendWithdrawalRequestEmail(data: WithdrawalRequestEmail) {
  const { email, name, amount, country, paymentMethod, paymentDetails, withdrawalId, supportPhone, supportType } = data;
  
  console.log(`Sending withdrawal request email to ${email} for $${amount}`);

  const formattedAmount = `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const whatsappNumber = supportPhone || "12186500840";
  const supportLink = supportType === 'telegram' 
    ? `https://t.me/${whatsappNumber.replace(/[^0-9]/g, '')}`
    : `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  const supportLabel = supportType === 'telegram' ? 'Telegram' : 'WhatsApp';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              
              <!-- Header - Tesla Red -->
              <tr>
                <td style="padding: 40px 50px 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                    <tr><td align="center" style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 10px;"><span style="color: #ffffff;">Withdrawal Status Update</span></td></tr>
                  </table>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 50px 10px;">
                  <p style="margin: 0; color: #374151; font-size: 18px; font-weight: 600;">
                    Hello ${name || (email ? email.split('@')[0] : 'there')},
                  </p>
                </td>
              </tr>
              
              <!-- Status Message -->
              <tr>
                <td style="padding: 10px 50px 25px;">
                  <p style="margin: 0; color: #374151; font-size: 16px; line-height: 1.7;">
                    Your withdrawal request has been received and is currently being processed.
                  </p>
                </td>
              </tr>
              
              <!-- Withdrawal Details Card -->
              <tr>
                <td style="padding: 0 50px 30px;">
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr><td style="color: #3b82f6; font-size: 17px; font-weight: 700; padding-bottom: 18px;"><span style="color: #3b82f6;">📋 Withdrawal Details</span></td></tr>
                    </table>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Reference ID</td>
                              <td style="color: #111827; font-size: 14px; text-align: right; font-family: monospace; font-weight: 600;">${withdrawalId.slice(0, 8)}...</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</td>
                              <td style="color: #059669; font-size: 18px; text-align: right; font-weight: 800;">${formattedAmount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Request Date</td>
                              <td style="color: #111827; font-size: 14px; text-align: right;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Country</td>
                              <td style="color: #111827; font-size: 14px; text-align: right;">${country}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Payment Method</td>
                              <td style="color: #111827; font-size: 14px; text-align: right; text-transform: capitalize;">${paymentMethod}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                              <td style="text-align: right;">
                                <span style="background: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">PROCESSING</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
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
                        <tr><td align="center"><a href="${supportLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
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
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `Withdrawal Request Received - ${formattedAmount}`,
      headers: {
        "X-Mailer": "Tesla Stock Platform",
      },
      html: emailHtml,
    }),
  });

  const sendTime = Date.now();
  if (!res.ok) {
    const errorData = await res.text();
    console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: withdrawal_request | Error: ${errorData}`);
    return { success: false, error: errorData };
  }

  const result = await res.json();
  console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: withdrawal_request | Resend_ID: ${result.id} | Time: ${sendTime}`);
  return { success: true, data: result };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestData: WithdrawalRequestEmail = await req.json();

    // Verify email matches authenticated user
    if (user.email !== requestData.email) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use background task for faster response
    EdgeRuntime.waitUntil(sendWithdrawalRequestEmail(requestData));

    return new Response(
      JSON.stringify({ success: true, message: "Withdrawal request email queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-withdrawal-request:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});