import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALLOWED_ORIGINS = ["https://msktesla.net", "https://www.msktesla.net"];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || origin.includes('lovableproject.com') || origin.includes('lovable.app'));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
}

interface PlatformNoticeRequest {
  recipientEmail: string;
  subject: string;
  message: string;
  status: "active" | "inactive";
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Auth check - admin only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Verify admin role
    const supabaseAdmin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin only' }), {
        status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const body: PlatformNoticeRequest = await req.json();

    // Validate
    if (!body.recipientEmail || !body.subject || !body.message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: recipientEmail, subject, message' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.recipientEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (body.subject.length > 200 || body.message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Subject or message too long' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const sanitize = (str: string) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeSubject = sanitize(body.subject);
    const safeMessage = sanitize(body.message).replace(/\n/g, '<br>');

    const isActive = body.status === "active";
    const statusColor = isActive ? "#16a34a" : "#d97706";
    const statusLabel = isActive ? "Active Update" : "Important Notice";
    const statusEmoji = isActive ? "✅" : "⚠️";
    const statusBadgeBg = isActive ? "#dcfce7" : "#fef3c7";
    const statusBadgeText = isActive ? "#166534" : "#92400e";

    const formattedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 50px 30px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px;"><span style="color: #ffffff;">TESLA STOCK PLATFORM</span></td></tr>
                    <tr><td align="center" style="color: #ffffff; font-size: 14px; padding-top: 8px;"><span style="color: #ffffffcc;">Platform Notice</span></td></tr>
                  </table>
                </td>
              </tr>

              <!-- Status Badge -->
              <tr>
                <td style="padding: 30px 50px 10px; text-align: center;">
                  <span style="display: inline-block; background: ${statusBadgeBg}; color: ${statusBadgeText}; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${statusEmoji} ${statusLabel}</span>
                </td>
              </tr>

              <!-- Subject -->
              <tr>
                <td style="padding: 20px 50px 10px; text-align: center;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td align="center" style="color: #111827; font-size: 22px; font-weight: 800;"><span style="color: #111827;">${safeSubject}</span></td></tr>
                  </table>
                  <div style="width: 60px; height: 4px; background: linear-gradient(90deg, ${statusColor}, ${statusColor}99); margin: 20px auto; border-radius: 2px;"></div>
                </td>
              </tr>

              <!-- Message Body -->
              <tr>
                <td style="padding: 0 50px 30px;">
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px 30px; border-left: 4px solid ${statusColor};">
                    <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">${safeMessage}</p>
                  </div>
                </td>
              </tr>

              <!-- Date -->
              <tr>
                <td style="padding: 0 50px 30px; text-align: center;">
                  <p style="color: #9ca3af; font-size: 13px; margin: 0;">📅 ${formattedDate}</p>
                </td>
              </tr>

              <!-- CTA -->
              <tr>
                <td style="padding: 0 50px 40px; text-align: center;">
                  <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 8px 25px -8px rgba(220,38,38,0.5);">
                    Go to Dashboard →
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 50px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="color: #9ca3af; font-size: 11px; margin: 0; line-height: 1.6;">This is an official platform notice from Tesla Stock Platform.</p>
                  <p style="color: #9ca3af; font-size: 11px; margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [body.recipientEmail],
        subject: body.subject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const result = await res.json();
    console.log("Platform notice sent to:", body.recipientEmail);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
