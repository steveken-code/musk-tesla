import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Use verified domain email or fallback to resend.dev for testing
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "TeslaInvest <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to ${email} for user ${name}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Welcome to TeslaInvest - Your Investment Journey Begins!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: -0.5px;">
                          ⚡ TeslaInvest
                        </h1>
                        <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                          Smart Investing, Electrifying Returns
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 600;">
                          Welcome, ${name}! 🎉
                        </h2>
                        
                        <p style="margin: 0 0 20px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                          Thank you for joining TeslaInvest! You've taken the first step towards building your investment portfolio with one of the most innovative companies in the world.
                        </p>
                        
                        <div style="background-color: #334155; border-radius: 12px; padding: 24px; margin: 30px 0;">
                          <h3 style="margin: 0 0 16px; color: #ffffff; font-size: 18px; font-weight: 600;">
                            🚀 What's Next?
                          </h3>
                          <ul style="margin: 0; padding: 0; list-style: none; color: #94a3b8; font-size: 15px; line-height: 1.8;">
                            <li style="padding: 8px 0; border-bottom: 1px solid #475569;">
                              ✅ Complete your profile information
                            </li>
                            <li style="padding: 8px 0; border-bottom: 1px solid #475569;">
                              📊 Explore investment opportunities
                            </li>
                            <li style="padding: 8px 0; border-bottom: 1px solid #475569;">
                              💰 Make your first investment
                            </li>
                            <li style="padding: 8px 0;">
                              📈 Track your portfolio growth
                            </li>
                          </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 10px 30px -5px rgba(220, 38, 38, 0.4);">
                            Go to Dashboard →
                          </a>
                        </div>
                        
                        <p style="margin: 30px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                          If you have any questions, our support team is here to help. Simply reply to this email and we'll get back to you as soon as possible.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0f172a; padding: 30px 40px; text-align: center; border-top: 1px solid #334155;">
                        <p style="margin: 0 0 10px; color: #64748b; font-size: 13px;">
                          © ${new Date().getFullYear()} TeslaInvest. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #475569; font-size: 12px;">
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

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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