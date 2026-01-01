import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "TeslaInvest <onboarding@resend.dev>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  name: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    const { name, email, resetLink }: PasswordResetRequest = await req.json();

    // Verify the email matches the authenticated user
    if (user.email !== email) {
      console.error("Email mismatch: requested email does not match authenticated user");
      return new Response(
        JSON.stringify({ error: "Forbidden - Email does not match authenticated user" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending password reset email to ${email} for user ${name}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "🔐 Reset Your TeslaInvest Password",
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
                          Password Reset Request
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Security Icon Banner -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 2px solid #e31937; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                          <span style="font-size: 36px;">🔒</span>
                        </div>
                        <h2 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700;">
                          Password Reset
                        </h2>
                        <div style="width: 60px; height: 4px; background: linear-gradient(90deg, #e31937, #ff4444); margin: 20px auto; border-radius: 2px;"></div>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 0 40px 40px;">
                        <p style="margin: 0 0 25px; color: #a3a3a3; font-size: 17px; line-height: 1.7; text-align: center;">
                          Hi ${name || 'Investor'},<br><br>
                          We received a request to reset the password for your TeslaInvest account. 
                          Click the button below to create a new password.
                        </p>
                        
                        <!-- Warning Box -->
                        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #e31937; border-radius: 12px; padding: 20px; margin: 30px 0; text-align: center;">
                          <p style="margin: 0; color: #fbbf24; font-size: 14px; font-weight: 600;">
                            ⚠️ This link expires in 1 hour
                          </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 40px 0;">
                          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #e31937 0%, #cc0000 50%, #990000 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 15px 40px -10px rgba(227, 25, 55, 0.5);">
                            Reset Password →
                          </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 12px; padding: 20px; margin: 30px 0;">
                          <p style="margin: 0 0 10px; color: #737373; font-size: 13px; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>
                          <p style="margin: 0; color: #e31937; font-size: 12px; word-break: break-all; text-align: center;">
                            ${resetLink}
                          </p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="border-left: 4px solid #fbbf24; padding-left: 20px; margin: 30px 0;">
                          <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                            <strong style="color: #fbbf24;">Security Notice:</strong> If you didn't request this password reset, 
                            please ignore this email. Your password will remain unchanged and your account is still secure.
                          </p>
                        </div>
                        
                        <!-- Tips Section -->
                        <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 25px; margin: 30px 0;">
                          <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 16px; font-weight: 700;">
                            🛡️ Password Security Tips
                          </h3>
                          <ul style="margin: 0; padding: 0 0 0 20px; color: #737373; font-size: 14px; line-height: 1.8;">
                            <li>Use at least 12 characters</li>
                            <li>Mix uppercase, lowercase, numbers & symbols</li>
                            <li>Avoid using personal information</li>
                            <li>Use a unique password for TeslaInvest</li>
                          </ul>
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
                                Need help? Contact our security team
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
    console.log("Password reset email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
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
