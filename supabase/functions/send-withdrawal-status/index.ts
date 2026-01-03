import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Msk Tesla <noreply@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TESLA_LOGO_URL = "https://ndvwqmoahasggeobwwld.supabase.co/storage/v1/object/public/assets/new_tesla-removebg-preview.png";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WithdrawalStatusRequest {
  userEmail: string;
  userName: string;
  amount: number;
  status: string;
  holdMessage?: string;
  paymentDetails: string;
  country: string;
  withdrawalId?: string;
}

// Country code to full name mapping
const countryNames: Record<string, string> = {
  "US": "United States",
  "UK": "United Kingdom",
  "RU": "Russia",
  "NG": "Nigeria",
  "GH": "Ghana",
  "KE": "Kenya",
  "ZA": "South Africa",
  "CA": "Canada",
  "AU": "Australia",
  "DE": "Germany",
  "FR": "France",
  "ES": "Spain",
  "IT": "Italy",
  "BR": "Brazil",
  "IN": "India",
  "CN": "China",
  "JP": "Japan",
  "KR": "South Korea",
  "MX": "Mexico",
  "AE": "United Arab Emirates",
  "SA": "Saudi Arabia",
  "EG": "Egypt",
  "PK": "Pakistan",
  "BD": "Bangladesh",
  "PH": "Philippines",
  "ID": "Indonesia",
  "MY": "Malaysia",
  "SG": "Singapore",
  "TH": "Thailand",
  "VN": "Vietnam",
  "TR": "Turkey",
  "PL": "Poland",
  "NL": "Netherlands",
  "BE": "Belgium",
  "SE": "Sweden",
  "NO": "Norway",
  "DK": "Denmark",
  "FI": "Finland",
  "AT": "Austria",
  "CH": "Switzerland",
  "IE": "Ireland",
  "PT": "Portugal",
  "GR": "Greece",
  "CZ": "Czech Republic",
  "RO": "Romania",
  "HU": "Hungary",
  "UA": "Ukraine",
  "IL": "Israel",
  "NZ": "New Zealand",
  "AR": "Argentina",
  "CL": "Chile",
  "CO": "Colombia",
  "PE": "Peru",
  "VE": "Venezuela"
};

// Detect if payment details is a card number or phone number
function getPaymentType(details: string): { type: string; label: string } {
  const cleanDetails = details.replace(/\s+/g, '');
  
  // Card patterns (starts with digits, 13-19 characters, may have spaces/dashes)
  if (/^\d{13,19}$/.test(cleanDetails) || /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{0,7}$/.test(details)) {
    return { type: 'card', label: 'Card Number' };
  }
  
  // Phone patterns (starts with + or has country code format)
  if (/^\+?\d{10,15}$/.test(cleanDetails) || /^\+\d/.test(details)) {
    return { type: 'phone', label: 'Phone Number' };
  }
  
  // Default to payment details
  return { type: 'other', label: 'Payment Details' };
}

async function sendStatusEmail(data: WithdrawalStatusRequest) {
  const { userEmail, userName, amount, status, holdMessage, paymentDetails, country, withdrawalId } = data;

  console.log(`Sending withdrawal status email to ${userEmail} for $${amount} - Status: ${status}`);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get full country name
  const fullCountryName = countryNames[country] || country;
  
  // Get payment type
  const paymentType = getPaymentType(paymentDetails);
  
  // Generate transaction ID if not provided
  const transactionId = withdrawalId ? withdrawalId.substring(0, 8).toUpperCase() : `TXN${Date.now().toString(36).toUpperCase()}`;

  let subject = "";
  let statusLabel = "";
  let statusBgColor = "";
  let statusTextColor = "";
  let statusMessage = "";
  let statusIcon = "";
  let showSupportCTA = false;

  switch (status) {
    case "completed":
      subject = `✅ Withdrawal Completed - ${formattedAmount} | Tesla Stock`;
      statusLabel = "COMPLETED";
      statusBgColor = "#dcfce7";
      statusTextColor = "#166534";
      statusMessage = "Your withdrawal has been successfully processed! The funds have been transferred to your account.";
      statusIcon = "✅";
      break;
    case "on_hold":
      subject = `⏸️ Withdrawal On Hold - Action Required | Tesla Stock`;
      statusLabel = "ON HOLD";
      statusBgColor = "#ffedd5";
      statusTextColor = "#9a3412";
      statusMessage = holdMessage || "Your withdrawal requires additional verification. Please contact support.";
      statusIcon = "⏸️";
      showSupportCTA = true;
      break;
    case "pending":
    case "processing":
      subject = `🕐 Withdrawal Processing - ${formattedAmount} | Tesla Stock`;
      statusLabel = "PROCESSING";
      statusBgColor = "#fef3c7";
      statusTextColor = "#92400e";
      statusMessage = "Your withdrawal is being processed. You will receive an update once it's completed.";
      statusIcon = "🕐";
      break;
    default:
      subject = `Withdrawal Status Update | Tesla Stock`;
      statusLabel = status.toUpperCase().replace('_', ' ');
      statusBgColor = "#f3f4f6";
      statusTextColor = "#374151";
      statusMessage = `Your withdrawal status has been updated to: ${status}`;
      statusIcon = "📋";
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e5e5e5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 50px 50px 40px; text-align: center; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);">
                  <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                    Tesla Stock Platform
                  </h1>
                  <p style="margin: 15px 0 0; color: rgba(255, 255, 255, 0.95); font-size: 18px; font-weight: 600;">
                    ${status === 'completed' ? 'Transaction Receipt' : 'Withdrawal Status Update'}
                  </p>
                </td>
              </tr>
              
              <!-- Greeting -->
              <tr>
                <td style="padding: 40px 50px 15px;">
                  <p style="margin: 0; color: #1e40af; font-size: 22px; font-weight: 700;">
                    Hello ${userName || 'Valued Investor'},
                  </p>
                </td>
              </tr>
              
              <!-- Status Badge -->
              <tr>
                <td style="padding: 15px 50px 25px;">
                  <div style="text-align: center; margin: 25px 0;">
                    <span style="background: ${statusBgColor}; color: ${statusTextColor}; padding: 14px 35px; border-radius: 50px; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                      ${statusIcon} ${statusLabel}
                    </span>
                  </div>
                  <p style="margin: 25px 0 0; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                    ${statusMessage}
                  </p>
                </td>
              </tr>
              
              <!-- Withdrawal Details Card -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 35px; margin: 0;">
                    <h3 style="margin: 0 0 25px; color: #dc2626; font-size: 20px; font-weight: 700;">
                      📋 Withdrawal Details
                    </h3>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Transaction ID</td>
                              <td style="color: #111827; font-size: 15px; text-align: right; font-weight: 700; font-family: monospace;">#${transactionId}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Description</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">Withdrawal Request</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Amount</td>
                              <td style="color: #059669; font-size: 22px; text-align: right; font-weight: 800;">${formattedAmount}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Date</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">${formattedDate}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Country</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">${fullCountryName}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">${paymentType.label}</td>
                              <td style="color: #111827; font-size: 15px; text-align: right; word-break: break-all; font-family: ${paymentType.type === 'card' ? 'monospace' : 'inherit'};">${paymentDetails}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Status</td>
                              <td style="text-align: right;">
                                <span style="background: ${statusBgColor}; color: ${statusTextColor}; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">${statusIcon} ${statusLabel}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              ${showSupportCTA ? `
              <!-- Support CTA -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #92400e; font-size: 18px; font-weight: 700;">
                      ⏸️ Action Required
                    </p>
                    <p style="margin: 0 0 25px; color: #78350f; font-size: 15px; line-height: 1.7;">
                      Please contact our Customer Support Team to complete your withdrawal.
                    </p>
                    <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                      💬 Contact Support on WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
              ` : ''}
              
              <!-- Dashboard CTA -->
              <tr>
                <td style="padding: 0 50px 35px; text-align: center;">
                  <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                    View Dashboard →
                  </a>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 35px 50px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600;">
                    © ${new Date().getFullYear()} Tesla Stock Platform. All rights reserved.
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                    This is an automated message. Please do not reply directly to this email.
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
      to: [userEmail],
      subject: subject,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Resend API error:", errorData);
    return { success: false, error: errorData };
  }

  const result = await res.json();
  console.log("Withdrawal status email sent successfully:", result);
  return { success: true, data: result };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role for admin verification
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const requestData = await req.json() as WithdrawalStatusRequest;

    // Use background task for faster response
    EdgeRuntime.waitUntil(sendStatusEmail(requestData));

    return new Response(
      JSON.stringify({ success: true, message: "Status email queued" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-withdrawal-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
