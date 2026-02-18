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

const HEADER_GRADIENT = "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

interface ReferralNotificationRequest {
  referralEmail: string;
  referredUserName: string;
  referredUserEmail: string;
  type: 'signup' | 'investment_active' | 'welcome_referred';
  referrerName?: string;
  investmentAmount?: number;
  referralCode?: string;
}

const footer = `
  <tr>
    <td style="padding: 16px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 16px 16px;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.6;">This is a system-generated notification from Tesla Stock Platform.</p>
      <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved. &nbsp;&#8226;&nbsp; Confidential communication.</p>
    </td>
  </tr>
`;

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
      subject = '🎉 New Referral Signup - Tesla Stock Platform';
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); page-break-inside: avoid; min-width: 100%;">
          <!-- Header - Tesla Red -->
          <tr>
            <td style="padding: 40px 50px 30px; text-align: center; background: ${HEADER_GRADIENT};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                <tr><td align="center" style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 10px;"><span style="color: #ffffff;">🎉 New Referral Signup!</span></td></tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px 20px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.7;">
                A new user has signed up using your referral code!
              </p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Referred User</p>
                <p style="color: #111827; margin: 0; font-size: 18px; font-weight: 700;">${referredUserName}</p>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 20px 0 0;">
                You will receive your <strong style="color: #374151;">referral bonus</strong> once this user's investment is confirmed and activated.
              </p>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 50px 35px; text-align: center;">
              <a href="https://msktesla.net/dashboard" style="display: inline-block; background: ${HEADER_GRADIENT}; color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
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
                    <tr><td align="center" style="color: #111827; font-size: 15px; font-weight: 600; padding-bottom: 6px;"><span style="color: #111827;">Need Assistance?</span></td></tr>
                    <tr><td align="center" style="color: #6b7280; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                    <tr><td align="center"><a href="https://wa.me/12186500840" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
                    <tr><td align="center" style="color: #9ca3af; font-size: 11px; padding-top: 12px;">Available 24/7 &nbsp;&#8226;&nbsp; Secure &amp; Confidential</td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          ${footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    } else if (type === 'investment_active') {
      subject = '💰 Referral Bonus - Investment Activated!';
      const formattedInvestment = investmentAmount 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(investmentAmount) 
        : null;
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); page-break-inside: avoid; min-width: 100%;">
          <!-- Header - Tesla Red -->
          <tr>
            <td style="padding: 40px 50px 30px; text-align: center; background: ${HEADER_GRADIENT};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                <tr><td align="center" style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 10px;"><span style="color: #ffffff;">💰 Referral Bonus Earned!</span></td></tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px 20px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 22px; font-weight: 700;">Congratulations! 🎉</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.7;">
                Your referred user's investment has been <strong style="color: #16a34a;">activated</strong>! You are now eligible for your referral bonus.
              </p>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Investment Details</p>
                <p style="color: #111827; margin: 0 0 6px; font-size: 17px; font-weight: 700;">User: ${referredUserName}</p>
                ${formattedInvestment ? `<p style="color: #059669; margin: 0; font-size: 22px; font-weight: 800;">Amount: ${formattedInvestment}</p>` : ''}
              </div>
              <div style="background: #dcfce7; border: 1px solid #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="color: #166534; font-size: 16px; font-weight: 700; margin: 0;">🎉 Your referral bonus will be processed shortly!</p>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 50px 35px; text-align: center;">
              <a href="https://msktesla.net/dashboard" style="display: inline-block; background: ${HEADER_GRADIENT}; color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
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
                    <tr><td align="center" style="color: #111827; font-size: 15px; font-weight: 600; padding-bottom: 6px;"><span style="color: #111827;">Need Assistance?</span></td></tr>
                    <tr><td align="center" style="color: #6b7280; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                    <tr><td align="center"><a href="https://wa.me/12186500840" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
                    <tr><td align="center" style="color: #9ca3af; font-size: 11px; padding-top: 12px;">Available 24/7 &nbsp;&#8226;&nbsp; Secure &amp; Confidential</td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          ${footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    } else if (type === 'welcome_referred') {
      subject = '🎁 Welcome! You\'ve Earned a $100 Referral Bonus';
      htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); page-break-inside: avoid; min-width: 100%;">
          <!-- Header - Tesla Red -->
          <tr>
            <td style="padding: 40px 50px 30px; text-align: center; background: ${HEADER_GRADIENT};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr><td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">Tesla Stock Platform</span></td></tr>
                <tr><td align="center" style="color: #ffffff; font-size: 16px; font-weight: 500; padding-top: 10px;"><span style="color: #ffffff;">🎁 Welcome Bonus Inside!</span></td></tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px 20px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 22px; font-weight: 700;">Welcome to Tesla Stock Platform!</p>
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.7;">
                Hi <span style="color: #3b82f6; font-weight: 700;">${referredUserName}</span>! 🎉 You've signed up using a referral link and earned a special welcome bonus!
              </p>
              <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Your Welcome Bonus</p>
                <p style="color: #16a34a; margin: 0; font-size: 52px; font-weight: 800;">$100</p>
              </div>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 20px 0;">
                <p style="color: #111827; font-size: 15px; font-weight: 700; margin: 0 0 10px 0;">How to claim your bonus:</p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.7; margin: 0;">
                  Make your first investment to activate your account. Your <strong style="color: #374151;">$100 bonus</strong> will be credited once your investment is confirmed.
                </p>
              </div>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 50px 35px; text-align: center;">
              <a href="https://msktesla.net/dashboard" style="display: inline-block; background: ${HEADER_GRADIENT}; color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                Start Investing Now →
              </a>
            </td>
          </tr>
          <!-- Need Assistance? -->
          <tr>
            <td style="padding: 0 50px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px;">
                <tr><td style="padding: 20px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: #111827; font-size: 15px; font-weight: 600; padding-bottom: 6px;"><span style="color: #111827;">Need Assistance?</span></td></tr>
                    <tr><td align="center" style="color: #6b7280; font-size: 12px; padding-bottom: 16px;">Our dedicated support team is ready to help you.</td></tr>
                    <tr><td align="center"><a href="https://wa.me/12186500840" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 12px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">Contact Support</a></td></tr>
                    <tr><td align="center" style="color: #9ca3af; font-size: 11px; padding-top: 12px;">Available 24/7 &nbsp;&#8226;&nbsp; Secure &amp; Confidential</td></tr>
                  </table>
                </td></tr>
              </table>
            </td>
          </tr>
          ${footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    // Determine the recipient based on email type
    const recipientEmail = type === 'welcome_referred' ? referredUserEmail : referralEmail;

    // Send email
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
