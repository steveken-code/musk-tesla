import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Msk Tesla <noreply@msktesla.net>";
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
        subject: "🔐 Reset Your Tesla Stock Platform Password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #fef2f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(220, 38, 38, 0.15);">
                    
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 50px 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                        <h1 style="margin: 0 0 10px; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                          Tesla Stock Platform
                        </h1>
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">
                          Password Reset Request
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Security Icon -->
                    <tr>
                      <td style="padding: 40px 50px 20px; text-align: center;">
                        <div style="display: inline-block; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 3px solid #dc2626; border-radius: 50%; width: 90px; height: 90px; line-height: 90px; margin-bottom: 20px;">
                          <span style="font-size: 42px;">🔒</span>
                        </div>
                        <h2 style="margin: 0; color: #1f2937; font-size: 26px; font-weight: 700;">
                          Password Reset
                        </h2>
                        <div style="width: 80px; height: 4px; background: linear-gradient(90deg, #dc2626, #ef4444); margin: 20px auto; border-radius: 2px;"></div>
                      </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 0 50px 10px; text-align: center;">
                        <p style="margin: 0; color: #1e40af; font-size: 22px; font-weight: 700;">
                          Hi ${name || 'Valued Investor'},
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                      <td style="padding: 20px 50px 40px;">
                        <p style="margin: 0 0 25px; color: #4b5563; font-size: 16px; line-height: 1.8; text-align: center;">
                          We received a request to reset the password for your Tesla Stock Platform account. 
                          Click the button below to create a new secure password.
                        </p>
                        
                        <!-- Warning Box -->
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 18px 24px; margin: 25px 0; text-align: center;">
                          <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
                            ⚠️ This link expires in 1 hour for your security
                          </p>
                        </div>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 35px 0;">
                          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 17px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 10px 30px -8px rgba(220, 38, 38, 0.5);">
                            Reset Password →
                          </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin: 30px 0;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:
                          </p>
                          <p style="margin: 0; color: #dc2626; font-size: 12px; word-break: break-all; text-align: center; font-weight: 500;">
                            ${resetLink}
                          </p>
                        </div>
                        
                        <!-- Security Notice -->
                        <div style="border-left: 4px solid #f59e0b; background: #fffbeb; padding: 18px 20px; margin: 30px 0; border-radius: 0 12px 12px 0;">
                          <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0;">
                            <strong style="color: #92400e;">🛡️ Security Notice:</strong> If you didn't request this password reset, 
                            please ignore this email. Your password will remain unchanged and your account is secure.
                          </p>
                        </div>
                        
                        <!-- Tips Section -->
                        <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; border-radius: 16px; padding: 25px 30px; margin: 30px 0;">
                          <h3 style="margin: 0 0 18px; color: #1f2937; font-size: 17px; font-weight: 700;">
                            🔐 Password Security Tips
                          </h3>
                          <ul style="margin: 0; padding: 0 0 0 22px; color: #4b5563; font-size: 14px; line-height: 2;">
                            <li>Use at least 12 characters for maximum security</li>
                            <li>Mix uppercase, lowercase, numbers & special symbols</li>
                            <li>Avoid using personal information or common words</li>
                            <li>Use a unique password for your Tesla Stock account</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Support Section -->
                    <tr>
                      <td style="padding: 30px 50px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0 0 12px; color: #6b7280; font-size: 15px;">
                                Need help? Contact our security team
                              </p>
                              <a href="mailto:support@msktesla.net" style="color: #dc2626; text-decoration: none; font-weight: 600; font-size: 15px;">
                                support@msktesla.net
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 50px; text-align: center;">
                        <p style="margin: 0 0 8px; color: rgba(255, 255, 255, 0.95); font-size: 14px; font-weight: 600;">
                          © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
                        </p>
                        <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
                          This email was sent to ${email}
                        </p>
                        <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 11px;">
                          Tesla Stock Platform | Smart Investing in Clean Energy
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