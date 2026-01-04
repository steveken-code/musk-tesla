import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Msk Tesla <support@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  const whatsappLink = `https://wa.me/12186500840`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [email],
      subject: `Welcome to Tesla Stock Platform`,
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
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 50px 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                      <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                        Tesla Stock Platform
                      </h1>
                      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500;">
                        Welcome to Your Investment Journey
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Welcome Message -->
                  <tr>
                    <td style="padding: 40px 50px 20px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 16px;">Welcome aboard,</p>
                      <h2 style="margin: 10px 0 0; color: #1e40af; font-size: 26px; font-weight: 700;">
                        ${name}! 🎉
                      </h2>
                      <div style="width: 80px; height: 4px; background: linear-gradient(90deg, #dc2626, #ef4444); margin: 25px auto; border-radius: 2px;"></div>
                    </td>
                  </tr>
                  
                  <!-- Main Content Card -->
                  <tr>
                    <td style="padding: 0 50px 40px;">
                      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 35px; margin-bottom: 25px;">
                        <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                          You've successfully created your account on Tesla Stock Platform. 
                          Your investment journey with us begins now!
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${dashboardLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 8px 25px -8px rgba(220, 38, 38, 0.5);">
                            Access Your Dashboard →
                          </a>
                        </div>
                      </div>
                      
                      <!-- Getting Started Steps -->
                      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 30px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 20px; color: #dc2626; font-size: 18px; font-weight: 700; text-align: center;">
                          🚀 Get Started in 3 Easy Steps
                        </h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="45" style="vertical-align: top;">
                                    <div style="background: #dc2626; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px;">1</div>
                                  </td>
                                  <td>
                                    <div style="color: #1f2937; font-weight: 600; font-size: 15px;">Log into your Dashboard</div>
                                    <div style="color: #6b7280; font-size: 13px; margin-top: 3px;">Access your personalized investment portal</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #fecaca;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="45" style="vertical-align: top;">
                                    <div style="background: #dc2626; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px;">2</div>
                                  </td>
                                  <td>
                                    <div style="color: #1f2937; font-weight: 600; font-size: 15px;">Make Your First Investment</div>
                                    <div style="color: #6b7280; font-size: 13px; margin-top: 3px;">Start with as little as $100</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 12px 0;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td width="45" style="vertical-align: top;">
                                    <div style="background: #16a34a; color: white; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; font-size: 14px;">✓</div>
                                  </td>
                                  <td>
                                    <div style="color: #1f2937; font-weight: 600; font-size: 15px;">Watch Your Portfolio Grow</div>
                                    <div style="color: #6b7280; font-size: 13px; margin-top: 3px;">Track real-time performance and profits</div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <!-- WhatsApp Support -->
                      <div style="text-align: center; padding: 25px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                        <p style="color: #166534; font-size: 15px; margin: 0 0 15px; font-weight: 600;">Need Help? Contact Our Support Team</p>
                        <a href="${whatsappLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 35px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                          💬 WhatsApp: +1 (218) 650-0840
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 50px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                        © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
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
