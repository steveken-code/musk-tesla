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

interface TradeClosedRequest {
  userEmail: string;
  userName: string;
  amount: number;
  profitAmount: number;
  investmentId: string;
  investmentDate: string;
}

async function sendTradeClosedEmail(data: TradeClosedRequest) {
  const { userEmail, userName, amount, profitAmount, investmentId, investmentDate } = data;

  console.log(`Sending trade closed email to ${userEmail} - Investment: $${amount}, Profit: $${profitAmount}`);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedProfit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(profitAmount);

  const totalValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount + profitAmount);

  const profitPercentage = ((profitAmount / amount) * 100).toFixed(1);

  const formattedDate = new Date(investmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const closedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const transactionId = investmentId.substring(0, 8).toUpperCase();

  // Fetch support settings
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let supportSettings = {
    whatsappEnabled: true,
    whatsappPhone: '+12186500840',
    telegramEnabled: false,
    telegramUsername: '',
  };

  try {
    const { data: settingsData } = await supabaseAdmin
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'support_settings')
      .maybeSingle();

    if (settingsData?.setting_value) {
      const value = settingsData.setting_value as any;
      supportSettings = {
        whatsappEnabled: value.whatsappEnabled ?? true,
        whatsappPhone: value.whatsappPhone || '+12186500840',
        telegramEnabled: value.telegramEnabled ?? false,
        telegramUsername: value.telegramUsername || '',
      };
    }
  } catch (e) {
    console.log('Using default support settings');
  }

  const whatsappUrl = `https://wa.me/${supportSettings.whatsappPhone.replace('+', '')}`;
  const telegramUrl = supportSettings.telegramUsername.startsWith('@') 
    ? `https://t.me/${supportSettings.telegramUsername.replace('@', '')}`
    : `https://t.me/${supportSettings.telegramUsername.replace('+', '')}`;

  let supportButtonsHtml = '';
  if (supportSettings.whatsappEnabled || supportSettings.telegramEnabled) {
    supportButtonsHtml = `
      <tr>
        <td style="padding: 0 50px 35px;">
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; text-align: center;">
            <p style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: 600;">
              Questions about your withdrawal?
            </p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
              ${supportSettings.whatsappEnabled ? `
                <a href="${whatsappUrl}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 25px; border-radius: 50px; font-size: 15px; font-weight: 700;">
                  💬 WhatsApp
                </a>
              ` : ''}
              ${supportSettings.telegramEnabled && supportSettings.telegramUsername ? `
                <a href="${telegramUrl}" style="display: inline-block; background: #0088cc; color: #ffffff; text-decoration: none; padding: 14px 25px; border-radius: 50px; font-size: 15px; font-weight: 700;">
                  ✈️ Telegram
                </a>
              ` : ''}
            </div>
          </div>
        </td>
      </tr>
    `;
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header - Tesla Red -->
              <tr>
                <td style="padding: 50px 50px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                    <tr><td align="center" style="color: #ffffff; font-size: 18px; font-weight: 600; padding-top: 10px;"><span style="color: #ffffff;">🎉 Trade Successfully Closed</span></td></tr>
                  </table>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 50px 15px;">
                  <p style="margin: 0; color: #374151; font-size: 22px; font-weight: 700;">
                    Hello ${userName || (userEmail ? userEmail.split('@')[0] : 'there')},
                  </p>
                </td>
              </tr>
              
              <!-- Status Badge -->
              <tr>
                <td style="padding: 15px 50px 25px;">
                  <div style="text-align: center; margin: 25px 0;">
                    <span style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); color: #166534; padding: 14px 35px; border-radius: 50px; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border: 2px solid #22c55e;">
                      ✅ TRADE COMPLETED
                    </span>
                  </div>
                  <p style="margin: 25px 0 0; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                    Great news! Your investment trade has been <strong style="color: #16a34a;">successfully completed</strong>. 
                    Your funds including profits are now ready for withdrawal.
                  </p>
                </td>
              </tr>
              
              <!-- Total Value Display -->
              <tr>
                <td style="padding: 0 50px 25px; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Total Portfolio Value</p>
                  <p style="color: #059669; font-size: 52px; font-weight: 800; margin: 0;">${totalValue}</p>
                  <p style="color: #16a34a; font-size: 18px; font-weight: 700; margin: 10px 0 0 0;">📈 +${profitPercentage}% Return</p>
                </td>
              </tr>
              
              <!-- Stats Cards -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="48%" style="padding: 10px;">
                        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 16px; padding: 25px; text-align: center;">
                          <div style="color: #166534; font-size: 28px; font-weight: 800;">${formattedAmount}</div>
                          <div style="color: #15803d; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Initial Investment</div>
                        </div>
                      </td>
                      <td width="4%"></td>
                      <td width="48%" style="padding: 10px;">
                        <div style="background: #dcfce7; border: 2px solid #16a34a; border-radius: 16px; padding: 25px; text-align: center;">
                          <div style="color: #166534; font-size: 28px; font-weight: 800;">+${formattedProfit}</div>
                          <div style="color: #15803d; font-size: 13px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total Profit</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Trade Details Card -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 35px; margin: 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr><td style="color: #3b82f6; font-size: 17px; font-weight: 700; padding-bottom: 20px;"><span style="color: #3b82f6;">📋 Trade Summary</span></td></tr>
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
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Trade Opened</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Trade Closed</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">${closedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Investment Amount</td>
                              <td style="color: #111827; font-size: 15px; text-align: right; font-weight: 600;">${formattedAmount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Total Profit</td>
                              <td style="color: #059669; font-size: 18px; text-align: right; font-weight: 800;">+${formattedProfit}</td>
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
                                <span style="background: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">✅ COMPLETED</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Withdrawal Notice -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #10b981; border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="color: #065f46; font-size: 18px; font-weight: 700; margin: 0 0 10px 0;">💰 Funds Ready for Withdrawal</p>
                    <p style="color: #047857; font-size: 15px; margin: 0;">Your ${totalValue} is now available to withdraw from your dashboard.</p>
                  </div>
                </td>
              </tr>
              
              <!-- Dashboard CTA - Tesla Red -->
              <tr>
                <td style="padding: 0 50px 35px; text-align: center;">
                  <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                    Withdraw Now →
                  </a>
                </td>
              </tr>
              
              <!-- Support -->
              ${supportButtonsHtml}
              
              <!-- Need Assistance? -->
              <tr>
                <td style="padding: 0 50px 24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <tr><td style="padding: 20px; text-align: center;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td align="center" style="color: #111827; font-size: 15px; font-weight: 600; padding-bottom: 6px;">Need Assistance?</td></tr>
                        <tr><td align="center" style="color: #6b7280; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                        <tr><td align="center"><a href="${whatsappUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
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
      to: [userEmail],
      subject: `🎉 Trade Completed - ${totalValue} Ready for Withdrawal`,
      headers: {
        "X-Mailer": "Tesla Stock Platform",
        "X-Priority": "1",
        "X-Entity-Ref-ID": transactionId,
        "Precedence": "bulk",
      },
      tags: [
        { name: "category", value: "trade_notification" },
        { name: "transaction_id", value: transactionId }
      ],
      html: emailHtml,
    }),
  });

  const sendTime = Date.now();
  if (!res.ok) {
    const errorData = await res.text();
    console.error(`[EMAIL_MONITOR] FAILED | To: ${userEmail} | Type: trade_closed | Error: ${errorData}`);
    return { success: false, error: errorData };
  }

  const result = await res.json();
  console.log(`[EMAIL_MONITOR] SENT | To: ${userEmail} | Type: trade_closed | Resend_ID: ${result.id} | Time: ${sendTime}`);
  return { success: true, data: result };
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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

    const requestData = await req.json() as TradeClosedRequest;

    // Use background task for email + SMS
    EdgeRuntime.waitUntil((async () => {
      await sendTradeClosedEmail(requestData);
      // Send SMS for trade closed
      try {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('phone')
          .eq('email', requestData.userEmail)
          .maybeSingle();
        if (profile?.phone) {
          const smsUrl = `${SUPABASE_URL}/functions/v1/send-sms`;
          await fetch(smsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: profile.phone,
              type: 'trade_closed',
              data: { userName: requestData.userName, profitAmount: requestData.profitAmount }
            })
          });
        }
      } catch (smsErr) {
        console.error('Trade closed SMS failed (non-blocking):', smsErr);
      }
    })());

    return new Response(
      JSON.stringify({ success: true, message: "Trade closed email queued" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-trade-closed:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
