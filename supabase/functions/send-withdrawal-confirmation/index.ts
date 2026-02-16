import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { HEADER_GRADIENT, FONT_FAMILY, COLORS } from "../_shared/email-constants.ts";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

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
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { name, email, amount, withdrawalId, withdrawalDate, paymentMethod, status }: WithdrawalConfirmationRequest = await req.json();

    if (user.email !== email) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('user_id', user.id)
      .single();

    if (withdrawalError || !withdrawal) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending withdrawal confirmation to ${email} for $${amount}`);

    const formattedAmount = `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;

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

    const isCrypto = paymentMethod?.toLowerCase().includes('crypto') || paymentMethod?.toLowerCase().includes('usdt');
    const destinationLabel = isCrypto ? 'USDT Wallet Address' : 'Bank Account';

    const sendTask = async () => {
      if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

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
          html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="max-width: 650px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header - Tesla Red -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: ${HEADER_GRADIENT};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr><td align="center" style="color: #ffffff; font-size: 24px; font-weight: 700;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                <tr><td align="center" style="color: #ffffff; font-size: 14px; padding-top: 8px;"><span style="color: #ffffff;">Withdrawal Confirmation</span></td></tr>
              </table>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 40px 50px 15px;">
              <p style="margin: 0; color: ${COLORS.greetingText}; font-size: 22px; font-weight: 700;">
                Hello ${name || 'Investor'},
              </p>
            </td>
          </tr>

          <!-- Status Badge -->
          <tr>
            <td style="padding: 15px 50px 25px;">
              <div style="text-align: center; margin: 20px 0;">
                <span style="background: ${status === 'completed' ? '#dcfce7' : status === 'processing' ? '#dbeafe' : '#fef3c7'}; color: ${status === 'completed' ? '#166534' : status === 'processing' ? '#1e40af' : '#92400e'}; padding: 12px 30px; border-radius: 50px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                  ${statusConfig.text}
                </span>
              </div>
              <p style="margin: 20px 0 0; color: ${COLORS.bodyText}; font-size: 16px; line-height: 1.7; text-align: center;">
                Your withdrawal request has been received and is being processed. ${isCrypto ? 'Funds will be sent to your USDT wallet address.' : 'Funds will be transferred to your bank account.'}
              </p>
            </td>
          </tr>
          
          <!-- Withdrawal Details Card -->
          <tr>
            <td style="padding: 0 50px 35px;">
              <div style="background: ${COLORS.cardBackground}; border: 2px solid ${COLORS.cardBorder}; border-radius: 16px; padding: 35px;">
                <h3 style="margin: 0 0 25px; color: ${COLORS.sectionHeader}; font-size: 20px; font-weight: 700;">
                  📋 Withdrawal Details
                </h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.divider};">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: ${COLORS.secondaryText}; font-size: 15px; font-weight: 600;">Reference ID</td>
                          <td style="color: ${COLORS.darkText}; font-size: 15px; text-align: right; font-weight: 700; font-family: monospace;">${withdrawalId}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.divider};">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: ${COLORS.secondaryText}; font-size: 15px; font-weight: 600;">Amount</td>
                          <td style="color: ${COLORS.successAmount}; font-size: 22px; text-align: right; font-weight: 800;">${formattedAmount}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.divider};">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: ${COLORS.secondaryText}; font-size: 15px; font-weight: 600;">Request Date</td>
                          <td style="color: ${COLORS.darkText}; font-size: 15px; text-align: right;">${formattedDate}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0; border-bottom: 1px solid ${COLORS.divider};">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: ${COLORS.secondaryText}; font-size: 15px; font-weight: 600;">Destination</td>
                          <td style="color: ${COLORS.darkText}; font-size: 15px; text-align: right;">${destinationLabel}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 15px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="color: ${COLORS.secondaryText}; font-size: 15px; font-weight: 600;">Status</td>
                          <td style="text-align: right;">
                            <span style="background: ${statusConfig.bg}; color: #000000; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">${statusConfig.text}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 50px 35px; text-align: center;">
              <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                Track Withdrawal →
              </a>
            </td>
          </tr>

          <!-- Need Assistance? -->
          <tr>
            <td style="padding: 0 50px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${COLORS.cardBackground}; border: 1px solid ${COLORS.cardBorder}; border-radius: 10px;">
                <tr><td style="padding: 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: ${COLORS.darkText}; font-size: 15px; font-weight: 600; padding-bottom: 6px;">Need Assistance?</td></tr>
                    <tr><td align="center" style="color: ${COLORS.secondaryText}; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                    <tr><td align="center"><a href="https://wa.me/12186500840" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
                    <tr><td align="center" style="color: ${COLORS.mutedText}; font-size: 11px; padding-top: 12px;">Available 24/7 &nbsp;&#8226;&nbsp; Secure &amp; Confidential</td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 50px; background-color: ${COLORS.footerBackground}; border-top: 1px solid ${COLORS.cardBorder}; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="color: ${COLORS.mutedText}; font-size: 11px; margin: 0; line-height: 1.6;">This is a system-generated notification from Tesla Stock Platform.</p>
              <p style="color: ${COLORS.mutedText}; font-size: 11px; margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved. &nbsp;&#8226;&nbsp; Confidential communication.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: withdrawal_confirmation | Error: ${errorData}`);
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const result = await res.json();
      console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: withdrawal_confirmation | Resend_ID: ${result.id}`);
      return result;
    };

    EdgeRuntime.waitUntil(sendTask());

    return new Response(JSON.stringify({ success: true, message: "Withdrawal confirmation queued" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-withdrawal-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
