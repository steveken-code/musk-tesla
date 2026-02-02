import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";

const ALLOWED_ORIGINS = [
  "https://msktesla.net",
  "https://www.msktesla.net",
  "https://lovable.dev",
  "https://preview--ndvwqmoahasggeobwwld.lovable.app",
  "https://ndvwqmoahasggeobwwld.lovable.app"
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovable.dev')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

interface ReferralNotificationRequest {
  referralEmail: string;
  referredUserName: string;
  referredUserEmail: string;
  type: 'signup' | 'investment_active' | 'welcome_referred';
  referrerName?: string;
  investmentAmount?: number;
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return new Response(
      JSON.stringify({ error: "Email service not configured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { referralEmail, referredUserName, referredUserEmail, type, investmentAmount }: ReferralNotificationRequest = await req.json();

    if (!referralEmail || !referredUserName || !referredUserEmail || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject = '';
    let htmlContent = '';

    if (type === 'signup') {
      subject = '🎉 New Referral Signup - Tesla Investment Platform';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                  <tr>
                    <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">New Referral!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #22c55e; margin: 0 0 20px; font-size: 24px;">🎉 Great News!</h2>
                      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        A new user has signed up using your referral code!
                      </p>
                      <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #334155;">
                        <p style="color: #94a3b8; margin: 0 0 10px; font-size: 14px;">Referred User Details:</p>
                        <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold;">${referredUserName}</p>
                      </div>
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        You will receive your referral bonus once this user's investment is confirmed and activated.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <p style="color: #64748b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Tesla Investment Platform. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else if (type === 'investment_active') {
      subject = '💰 Referral Bonus - Investment Activated!';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                  <tr>
                    <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">💰 Referral Bonus!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #22c55e; margin: 0 0 20px; font-size: 24px;">Congratulations!</h2>
                      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Your referred user's investment has been activated! You are now eligible for your referral bonus.
                      </p>
                      <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #334155;">
                        <p style="color: #94a3b8; margin: 0 0 10px; font-size: 14px;">Investment Details:</p>
                        <p style="color: #ffffff; margin: 0 0 8px; font-size: 18px; font-weight: bold;">User: ${referredUserName}</p>
                        ${investmentAmount ? `<p style="color: #22c55e; margin: 0; font-size: 24px; font-weight: bold;">Investment: $${investmentAmount.toLocaleString()}</p>` : ''}
                      </div>
                      <p style="color: #22c55e; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0;">
                        🎉 Your referral bonus will be processed shortly!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <p style="color: #64748b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Tesla Investment Platform. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    } else if (type === 'welcome_referred') {
      // Email sent to the NEW user who signed up with a referral code
      subject = '🎁 Welcome! You\'ve Earned a $100 Referral Bonus';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
                  <tr>
                    <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎁 Welcome Bonus!</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #3b82f6; margin: 0 0 20px; font-size: 24px;">Welcome to Tesla Investment Platform!</h2>
                      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        Hi ${referredUserName}! 🎉 You've signed up using a referral link and earned a special welcome bonus!
                      </p>
                      <div style="background: linear-gradient(135deg, #22c55e20 0%, #16a34a20 100%); border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #22c55e50; text-align: center;">
                        <p style="color: #94a3b8; margin: 0 0 10px; font-size: 14px;">Your Welcome Bonus</p>
                        <p style="color: #22c55e; margin: 0; font-size: 48px; font-weight: bold;">$100</p>
                      </div>
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        <strong style="color: #e2e8f0;">How to claim your bonus:</strong><br>
                        Make your first investment to activate your account. Your $100 bonus will be credited once your investment is confirmed.
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">Start Investing Now</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px 40px; text-align: center;">
                      <p style="color: #64748b; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Tesla Investment Platform. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    }

    // Determine the recipient based on email type
    const recipientEmail = type === 'welcome_referred' ? referredUserEmail : referralEmail;

    // Send email immediately using fetch
    const sendTask = async () => {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [recipientEmail],
            subject,
            html: htmlContent,
          }),
        });
        const result = await response.json();
        console.log(`Referral ${type} email sent to ${recipientEmail}:`, result);
      } catch (error) {
        console.error("Error sending referral notification email:", error);
      }
    };

    // Use waitUntil to send email immediately without blocking response
    (globalThis as any).EdgeRuntime?.waitUntil?.(sendTask()) || await sendTask();

    return new Response(
      JSON.stringify({ success: true, message: "Referral notification queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-referral-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
