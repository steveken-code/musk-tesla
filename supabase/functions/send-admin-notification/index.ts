import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "Tesla Stock Platform <notifications@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

interface AdminNotificationRequest {
  type: "investment" | "withdrawal";
  userEmail: string;
  userName: string;
  amount: number;
  details?: string;
}

async function sendAdminNotification(data: AdminNotificationRequest) {
  const { type, userEmail, userName, amount, details } = data;
  
  console.log(`Sending admin notification for ${type}: ${userEmail}, $${amount}`);

  // Get admin emails
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: adminRoles, error: rolesError } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (rolesError || !adminRoles?.length) {
    console.error("Failed to get admin users:", rolesError);
    return { success: false, error: "No admins found" };
  }

  const adminUserIds = adminRoles.map(r => r.user_id);
  
  const { data: adminProfiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .in('user_id', adminUserIds);

  if (profilesError || !adminProfiles?.length) {
    console.error("Failed to get admin emails:", profilesError);
    return { success: false, error: "No admin emails found" };
  }

  const adminEmails = adminProfiles.map(p => p.email).filter(Boolean) as string[];
  
  if (!adminEmails.length) {
    console.error("No valid admin emails found");
    return { success: false, error: "No valid admin emails" };
  }

  console.log(`Sending notification to ${adminEmails.length} admin(s):`, adminEmails);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isInvestment = type === "investment";
  const typeLabel = isInvestment ? "New Investment" : "Withdrawal Request";
  const emoji = isInvestment ? "💰" : "📤";
  const headerColor = isInvestment ? "#16a34a" : "#7c3aed";
  const statusColor = isInvestment ? "#22c55e" : "#fbbf24";
  const statusText = isInvestment ? "PENDING ACTIVATION" : "PENDING APPROVAL";

  const emailHtml = `
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
                <td style="padding: 40px 50px 30px; text-align: center; background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%);">
                  <div style="display: inline-block; background: #ffffff; border-radius: 50%; width: 70px; height: 70px; line-height: 70px; margin-bottom: 15px;">
                    <span style="font-size: 32px;">${emoji}</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 1px;">
                    ADMIN ALERT
                  </h1>
                  <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 600;">
                    ${typeLabel}
                  </p>
                </td>
              </tr>
              
              <!-- Alert Message -->
              <tr>
                <td style="padding: 35px 50px 20px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">A user has submitted a new ${type}</p>
                  <h2 style="margin: 15px 0 0; color: ${headerColor}; font-size: 42px; font-weight: 800;">
                    ${formattedAmount}
                  </h2>
                  <div style="width: 80px; height: 4px; background: linear-gradient(90deg, ${headerColor}, ${headerColor}99); margin: 25px auto; border-radius: 2px;"></div>
                </td>
              </tr>
              
              <!-- Details Card -->
              <tr>
                <td style="padding: 0 50px 40px;">
                  <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px;">
                    <h3 style="margin: 0 0 20px; color: #374151; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      📋 ${type.charAt(0).toUpperCase() + type.slice(1)} Details
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">User Name</td>
                              <td style="color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${userName || 'N/A'}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">User Email</td>
                              <td style="color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${userEmail}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Amount</td>
                              <td style="color: ${headerColor}; font-size: 16px; text-align: right; font-weight: 800;">${formattedAmount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Date & Time</td>
                              <td style="color: #1f2937; font-size: 14px; text-align: right;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                              <td style="text-align: right;">
                                <span style="background: ${statusColor}20; color: ${statusColor}; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase;">${statusText}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${details ? `
                      <tr>
                        <td style="padding: 14px 0; border-top: 1px solid #e5e7eb;">
                          <p style="color: #6b7280; font-size: 14px; font-weight: 500; margin: 0 0 8px;">Additional Details</p>
                          <p style="color: #1f2937; font-size: 14px; margin: 0; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${details}</p>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Action Button -->
              <tr>
                <td style="padding: 0 50px 40px; text-align: center;">
                  <a href="https://msktesla.net/admin-login" style="display: inline-block; background: linear-gradient(135deg, ${headerColor} 0%, ${headerColor}dd 100%); color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 8px 25px -8px ${headerColor}80;">
                    View in Admin Panel →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px 50px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px;">
                    © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    This is an automated admin notification.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `Admin Alert: ${typeLabel} - ${formattedAmount} from ${userName || userEmail}`,
      headers: {
        "X-Mailer": "Tesla Stock Platform",
      },
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Resend API error:", errorData);
    return { success: false, error: errorData };
  }

  const result = await res.json();
  console.log("Admin notification sent successfully:", result);
  return { success: true, data: result };
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

    const requestData: AdminNotificationRequest = await req.json();

    if (!requestData.type || !requestData.userEmail || !requestData.amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, userEmail, amount" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send in background for fast response
    EdgeRuntime.waitUntil(sendAdminNotification(requestData));

    return new Response(
      JSON.stringify({ success: true, message: "Admin notification queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    // Return generic error message to client
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
