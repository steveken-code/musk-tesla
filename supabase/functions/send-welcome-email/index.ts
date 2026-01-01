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
        subject: "🚗 Welcome to TeslaInvest - Your Journey to Electric Returns Starts Now!",
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
                    
                    <!-- Header with Tesla Logo -->
                    <tr>
                      <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #e31937 0%, #cc0000 50%, #990000 100%);">
                        <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                          <span style="color: #e31937; font-size: 40px; font-weight: bold;">T</span>
                        </div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                          TESLAINVEST
                        </h1>
                        <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500; letter-spacing: 1px;">
                          Accelerating Your Financial Future
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Welcome Banner -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          Welcome Aboard, ${name}! ⚡
                        </h2>
                        <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #e31937, #ff4444); margin: 20px auto; border-radius: 2px;"></div>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <p style="margin: 0 0 25px; color: #a3a3a3; font-size: 17px; line-height: 1.7; text-align: center;">
                          You've just joined an exclusive community of forward-thinking investors. 
                          Your journey to building wealth with Tesla and revolutionary clean energy begins now.
                        </p>
                        
                        <!-- Stats Cards -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td width="33%" style="padding: 10px;">
                              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center;">
                                <div style="color: #e31937; font-size: 28px; font-weight: 800;">847%</div>
                                <div style="color: #737373; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">5Y Growth</div>
                              </div>
                            </td>
                            <td width="33%" style="padding: 10px;">
                              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center;">
                                <div style="color: #22c55e; font-size: 28px; font-weight: 800;">$1T+</div>
                                <div style="color: #737373; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Market Cap</div>
                              </div>
                            </td>
                            <td width="33%" style="padding: 10px;">
                              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center;">
                                <div style="color: #3b82f6; font-size: 28px; font-weight: 800;">24/7</div>
                                <div style="color: #737373; font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Support</div>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Getting Started Section -->
                        <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 30px; margin: 30px 0;">
                          <h3 style="margin: 0 0 20px; color: #ffffff; font-size: 20px; font-weight: 700; text-align: center;">
                            🚀 Your Roadmap to Success
                          </h3>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50" style="vertical-align: top;">
                                      <div style="background: linear-gradient(135deg, #e31937, #cc0000); color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">1</div>
                                    </td>
                                    <td>
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Complete Your Profile</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Secure your account with full verification</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50" style="vertical-align: top;">
                                      <div style="background: linear-gradient(135deg, #e31937, #cc0000); color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">2</div>
                                    </td>
                                    <td>
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Explore Investment Plans</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Choose from our curated Tesla investment packages</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 15px 0; border-bottom: 1px solid #262626;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50" style="vertical-align: top;">
                                      <div style="background: linear-gradient(135deg, #e31937, #cc0000); color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">3</div>
                                    </td>
                                    <td>
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Make Your First Investment</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Start with as little as $250 and grow from there</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 15px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td width="50" style="vertical-align: top;">
                                      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">✓</div>
                                    </td>
                                    <td>
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Watch Your Portfolio Grow</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Track real-time performance on your dashboard</div>
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
                            Access Your Dashboard →
                          </a>
                        </div>
                        
                        <!-- Quote -->
                        <div style="border-left: 4px solid #e31937; padding-left: 20px; margin: 30px 0;">
                          <p style="color: #d4d4d4; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">
                            "The future of energy is bright, and so is your investment potential."
                          </p>
                          <p style="color: #737373; font-size: 14px; margin: 10px 0 0; font-weight: 600;">
                            — TeslaInvest Team
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                      <td style="padding: 30px 40px; background: #0a0a0a; border-top: 1px solid #262626;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0 0 15px; color: #a3a3a3; font-size: 15px;">
                                Questions? Our team is here to help 24/7
                              </p>
                              <a href="mailto:support@msktesla.net" style="color: #e31937; text-decoration: none; font-weight: 600; font-size: 15px;">
                                support@msktesla.net
                              </a>
                            </td>
                          </tr>
                        </table>
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
                        <p style="margin: 0; color: #404040; font-size: 11px;">
                          TeslaInvest | Smart Investing in Clean Energy
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