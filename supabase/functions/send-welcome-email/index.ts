import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tesla Stock <noreply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Tesla logo URL for email
const TESLA_LOGO_URL = "https://ndvwqmoahasggeobwwld.supabase.co/storage/v1/object/public/assets/new_tesla-removebg-preview.png";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  userId: string;
}

const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

async function sendWelcomeEmailTask(email: string, name: string, userId: string) {
  console.log(`Sending welcome email to ${email} for user ${name}`);

  // Create admin client with service role key
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Generate verification token (kept for backwards compatibility)
  const verificationToken = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this user
  await supabaseAdmin
    .from('email_verification_tokens')
    .delete()
    .eq('user_id', userId);

  // Insert new verification token
  const { error: insertError } = await supabaseAdmin
    .from('email_verification_tokens')
    .insert({
      user_id: userId,
      email: email.toLowerCase(),
      token: verificationToken,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    console.error("Failed to create verification token:", insertError);
  }

  const dashboardLink = `https://msktesla.net/dashboard`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: "🚗 Welcome to Tesla Stock - Your Investment Journey Begins!",
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
                        <img src="${TESLA_LOGO_URL}" alt="Tesla Stock" style="width: 120px; height: 120px; margin-bottom: 20px; border-radius: 16px;" />
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                          TESLA STOCK
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
                          Your account is now active and ready to start investing!
                        </p>
                        
                        <!-- Dashboard CTA -->
                        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 2px solid #e31937; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
                          <div style="display: inline-block; background: #e3193720; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin-bottom: 15px;">
                            <span style="font-size: 28px;">🚀</span>
                          </div>
                          <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 20px; font-weight: 700;">
                            Start Investing Today
                          </h3>
                          <p style="margin: 0 0 20px; color: #a3a3a3; font-size: 14px;">
                            Access your dashboard to make your first investment
                          </p>
                          <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #e31937 0%, #cc0000 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 10px 30px -10px rgba(227, 25, 55, 0.5);">
                            Go to Dashboard →
                          </a>
                        </div>
                        
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
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Access Your Dashboard</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Log in to your account anytime</div>
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
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Make Your First Investment</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Start with as little as $100 and grow from there</div>
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
                                      <div style="color: #ffffff; font-weight: 600; font-size: 15px;">Send Payment & Submit</div>
                                      <div style="color: #737373; font-size: 13px; margin-top: 4px;">Complete your investment via WhatsApp confirmation</div>
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
                        
                        <!-- WhatsApp Support -->
                        <div style="text-align: center; margin: 30px 0;">
                          <p style="color: #a3a3a3; font-size: 14px; margin-bottom: 15px;">Need help? Contact us on WhatsApp</p>
                          <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                            💬 WhatsApp Support
                          </a>
                        </div>
                        
                        <!-- Quote -->
                        <div style="border-left: 4px solid #e31937; padding-left: 20px; margin: 30px 0;">
                          <p style="color: #d4d4d4; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">
                            "The future of energy is bright, and so is your investment potential."
                          </p>
                          <p style="color: #737373; font-size: 14px; margin: 10px 0 0; font-weight: 600;">
                            — Tesla Stock Team
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
                          © ${new Date().getFullYear()} Tesla Stock. All rights reserved.
                        </p>
                        <p style="margin: 0 0 15px; color: #404040; font-size: 12px;">
                          This email was sent to ${email}
                        </p>
                        <p style="margin: 0; color: #404040; font-size: 11px;">
                          Tesla Stock | Smart Investing in Clean Energy
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
    return { success: false, error: errorData };
  }

  const data = await res.json();
  console.log("Welcome email sent successfully:", data);
  return { success: true, data };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, userId }: WelcomeEmailRequest = await req.json();

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: "Email and userId are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use background task for faster response
    EdgeRuntime.waitUntil(sendWelcomeEmailTask(email, name, userId));

    return new Response(
      JSON.stringify({ success: true, message: "Welcome email queued" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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
