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

interface ResendRequest {
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
    const { email }: ResendRequest = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Resending verification email to ${email}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find user by email
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if user exists
      return new Response(
        JSON.stringify({ success: true, message: "If an account exists, a verification email has been sent" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already verified
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email_verified, full_name')
      .eq('user_id', user.id)
      .single();

    if (profile?.email_verified) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is already verified" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate new verification token
    const verificationToken = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing tokens for this user
    await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', user.id);

    // Insert new verification token
    await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        email: email.toLowerCase(),
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
      });

    const verifyLink = `https://msktesla.net/verify-email?token=${verificationToken}`;
    const userName = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0];

    // Send email in background for faster response
    const sendEmailTask = async () => {
      // Generate unique message ID to prevent email threading
      const uniqueId = crypto.randomUUID();
      const timestamp = Date.now();

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `Verify Your Email Address`,
          headers: {
            "X-Entity-Ref-ID": uniqueId,
            "Message-ID": `<${uniqueId}-${timestamp}@msktesla.net>`,
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
            <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #171717 0%, #0a0a0a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #262626;">
                      
                      <!-- Header -->
                      <tr>
                        <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #e31937 0%, #cc0000 50%, #990000 100%);">
                          <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 80px; height: 80px; line-height: 80px; margin-bottom: 20px;">
                            <span style="color: #e31937; font-size: 40px; font-weight: bold;">T</span>
                          </div>
                          <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                            TESLAINVEST
                          </h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px;">
                          <div style="text-align: center; margin-bottom: 30px;">
                            <div style="display: inline-block; background: #22c55e20; border: 2px solid #22c55e; border-radius: 50%; width: 80px; height: 80px; line-height: 80px;">
                              <span style="font-size: 36px;">✉️</span>
                            </div>
                          </div>
                          
                          <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 26px; font-weight: 700; text-align: center;">
                            Verify Your Email
                          </h2>
                          
                          <p style="margin: 0 0 30px; color: #a3a3a3; font-size: 16px; line-height: 1.7; text-align: center;">
                            Hi ${userName},<br><br>
                            Please click the button below to verify your email address and complete your account setup.
                          </p>
                          
                          <!-- Warning Box -->
                          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid #fbbf24; border-radius: 12px; padding: 15px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0; color: #fbbf24; font-size: 14px; font-weight: 600;">
                              ⏰ This link expires in 24 hours
                            </p>
                          </div>
                          
                          <!-- CTA Button -->
                          <div style="text-align: center; margin: 40px 0;">
                            <a href="${verifyLink}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 15px 40px -10px rgba(34, 197, 94, 0.5);">
                              Verify Email →
                            </a>
                          </div>
                          
                          <!-- Alternative Link -->
                          <div style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 12px; padding: 20px; margin: 30px 0;">
                            <p style="margin: 0 0 10px; color: #737373; font-size: 13px; text-align: center;">
                              If the button doesn't work, copy and paste this link:
                            </p>
                            <p style="margin: 0; color: #e31937; font-size: 12px; word-break: break-all; text-align: center;">
                              ${verifyLink}
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #000000; padding: 30px 40px; text-align: center; border-top: 1px solid #1a1a1a;">
                          <p style="margin: 0 0 10px; color: #525252; font-size: 13px;">
                            © ${new Date().getFullYear()} TeslaInvest. All rights reserved.
                          </p>
                          <p style="margin: 0; color: #404040; font-size: 12px;">
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

      console.log("Verification email resent successfully");
    };

    // Send immediately in background
    EdgeRuntime.waitUntil(sendEmailTask());

    return new Response(
      JSON.stringify({ success: true, message: "Verification email queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in resend-verification-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
