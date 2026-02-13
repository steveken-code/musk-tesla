import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FROM_EMAIL, HEADER_GRADIENT, FONT_FAMILY, COLORS } from "../_shared/email-constants.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  conversationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, conversationId }: VerificationRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Store verification code
    const { error: insertError } = await supabaseAdmin
      .from('chat_verification_codes')
      .insert({
        email,
        code,
        conversation_id: conversationId || null,
      });

    if (insertError) {
      console.error("Failed to store verification code:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with the code
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Your Verification Code - Tesla Stock Platform",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="max-width: 650px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: ${HEADER_GRADIENT};">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                Tesla Stock Platform
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">
                Chat Verification Code
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 50px;">
              <p style="color: ${COLORS.greetingText}; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                Hello,
              </p>
              <p style="color: ${COLORS.bodyText}; font-size: 15px; line-height: 1.7; margin: 0 0 30px 0;">
                Your verification code to start a support chat is:
              </p>
              
              <!-- Code Display -->
              <div style="text-align: center; margin: 30px 0;">
                <div style="display: inline-block; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px 48px;">
                  <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: ${COLORS.sectionHeader}; font-family: monospace;">
                    ${code}
                  </span>
                </div>
              </div>
              
              <p style="color: ${COLORS.secondaryText}; font-size: 14px; line-height: 1.7; margin: 20px 0 0 0; text-align: center;">
                This code expires in <strong style="color: ${COLORS.darkText};">10 minutes</strong>.
              </p>
              <p style="color: ${COLORS.mutedText}; font-size: 13px; line-height: 1.7; margin: 16px 0 0 0; text-align: center;">
                If you did not request this code, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 24px 50px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: ${COLORS.secondaryText}; font-size: 13px; margin: 0;">
                © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Failed to send verification email: ${errorData}`);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Verification code sent to ${email}`);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-chat-verification:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
