import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Tesla Stock Platform <no-reply@msktesla.net>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName, userEmail, message } = await req.json();

    // Get admin email from referral_settings (admin's email)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'referral_settings')
      .maybeSingle();

    const adminEmail = (settings?.setting_value as any)?.referralEmail || 'b95157777@gmail.com';

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const truncatedMessage = message && message.length > 200 ? message.substring(0, 200) + '...' : (message || '[Image]');

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); padding: 30px; text-align: center;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="color: #ffffff; font-size: 22px; font-weight: 700;"><span style="color: #ffffff;">💬 New Chat Message</span></td></tr></table>
        </div>
        <div style="padding: 30px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 20px;">
            Hello Admin,
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            You have a new message from <strong>${userName || 'User'}</strong> (${userEmail || 'Unknown'}).
          </p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; font-weight: 600;">Message Preview</p>
            <p style="color: #111827; font-size: 15px; margin: 0; line-height: 1.5;">${truncatedMessage}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Log in to your admin panel to reply.
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [adminEmail],
        subject: `💬 New Chat: ${userName || 'User'} sent a message`,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending chat notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
