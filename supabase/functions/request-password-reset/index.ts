import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Sender with proper display name
const FROM_EMAIL = "Msk Tesla <no-reply@msktesla.net>";

// Always use production URL for reset links
const PRODUCTION_URL = "https://msktesla.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Password reset requested for: ${email}`);

    // Create admin client with service role key
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user exists
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if user exists - just say email sent
      console.log(`User not found for email: ${email}, returning success to prevent enumeration`);
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a reset link has been sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate a unique token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing tokens for this email
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('email', email.toLowerCase());

    // Insert new token
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        email: email.toLowerCase(),
        token: token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Failed to create reset token:", insertError);
      throw new Error("Failed to create reset token");
    }

    // Get user's name from profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const userName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0];

    // Always use production URL for reset links - never use preview/dev URLs
    const resetLink = `${PRODUCTION_URL}/reset-password?token=${token}`;

    console.log(`Sending password reset email with FROM: ${FROM_EMAIL}`);
    console.log(`Reset link: ${resetLink}`);
    
    // Send email in background for faster response
    const sendEmailTask = async () => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          reply_to: "support@msktesla.net",
          subject: `Password Reset Request`,
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
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                            Tesla Stock Platform
                          </h1>
                          <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 16px; font-weight: 500;">
                            Password Reset Request
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Greeting -->
                      <tr>
                        <td style="padding: 40px 50px 10px; text-align: center;">
                          <p style="margin: 0; color: #6b7280; font-size: 16px;">Hello,</p>
                          <h2 style="margin: 10px 0 0; color: #1e40af; font-size: 26px; font-weight: 700;">
                            ${userName}
                          </h2>
                          <div style="width: 80px; height: 4px; background: linear-gradient(90deg, #dc2626, #ef4444); margin: 25px auto; border-radius: 2px;"></div>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 50px 40px;">
                          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 35px; margin-bottom: 25px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                              We received a request to reset your password. Click the button below to create a new one.
                            </p>
                            
                            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin: 18px 0 26px; text-align: center;">
                              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                ⚠️ This link expires in 1 hour for your security.
                              </p>
                            </div>
                            
                            <div style="text-align: center; margin: 18px 0 10px;">
                              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 8px 25px -8px rgba(220, 38, 38, 0.5);">
                                Reset Password →
                              </a>
                            </div>
                            
                            <div style="margin-top: 22px; background: #ffffff; border: 1px dashed #e5e7eb; border-radius: 12px; padding: 18px 18px;">
                              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; text-align: center;">
                                If the button doesn't work, copy and paste this link into your browser:
                              </p>
                              <p style="margin: 0; color: #dc2626; font-size: 12px; word-break: break-all; text-align: center; font-weight: 600;">
                                ${resetLink}
                              </p>
                            </div>
                          </div>
                          
                          <div style="border-left: 4px solid #f59e0b; background: #fffbeb; padding: 18px 20px; border-radius: 0 12px 12px 0;">
                            <p style="color: #4b5563; font-size: 14px; line-height: 1.7; margin: 0;">
                              <strong style="color: #92400e;">Security notice:</strong> If you didn't request this reset, you can safely ignore this email.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Support -->
                      <tr>
                        <td style="padding: 0 50px 30px;">
                          <div style="text-align: center; padding: 20px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;">
                            <p style="color: #166534; font-size: 14px; margin: 0 0 10px; font-weight: 600;">Need Help?</p>
                            <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 10px 25px; border-radius: 50px; font-size: 13px; font-weight: 600;">
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

      const sendTime = Date.now();
      if (!res.ok) {
        const errorData = await res.text();
        console.error(`[EMAIL_MONITOR] FAILED | To: ${email} | Type: password_reset | Error: ${errorData}`);
        throw new Error(`Failed to send email: ${errorData}`);
      }

      const data = await res.json();
      console.log(`[EMAIL_MONITOR] SENT | To: ${email} | Type: password_reset | Resend_ID: ${data.id} | Time: ${sendTime}`);
    };

    // Send immediately in background
    EdgeRuntime.waitUntil(sendEmailTask());

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in request-password-reset function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
