import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Msk Tesla <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// Allowed origins for CORS
const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

interface PasswordResetRequest {
  email: string;
  name: string;
  resetLink: string;
}

async function sendPasswordResetEmailTask({ email, name, resetLink }: PasswordResetRequest) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
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
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">

                  <!-- Header (matches welcome email) -->
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

                  <!-- Title -->
                  <tr>
                    <td style="padding: 40px 50px 10px; text-align: center;">
                      <p style="margin: 0; color: #6b7280; font-size: 16px;">Hello,</p>
                      <h2 style="margin: 10px 0 0; color: #1e40af; font-size: 26px; font-weight: 700;">
                        ${name || 'Valued Investor'}
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

                  <!-- Footer (matches welcome email) -->
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
  console.log("Password reset email sent successfully:", data);
  return { success: true, data };
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: PasswordResetRequest = await req.json();

    // Verify the email matches the authenticated user
    if (user.email !== payload.email) {
      console.error("Email mismatch: requested email does not match authenticated user");
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send in background for fast response
    EdgeRuntime.waitUntil(sendPasswordResetEmailTask(payload));

    return new Response(JSON.stringify({ success: true, message: "Password reset email queued" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    // Return generic error message to client
    return new Response(JSON.stringify({ error: "An error occurred while processing your request. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
