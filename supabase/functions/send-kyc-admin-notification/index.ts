import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Get country name from code
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    RU: 'Russia', US: 'United States', DE: 'Germany', GB: 'United Kingdom',
    FR: 'France', ES: 'Spain', IT: 'Italy', CA: 'Canada', AU: 'Australia',
    NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', CH: 'Switzerland',
    PL: 'Poland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
    PT: 'Portugal', GR: 'Greece', IE: 'Ireland', CZ: 'Czech Republic',
    HU: 'Hungary', RO: 'Romania', UA: 'Ukraine', BY: 'Belarus',
    JP: 'Japan', CN: 'China', KR: 'South Korea', IN: 'India',
    BR: 'Brazil', MX: 'Mexico', AR: 'Argentina', ZA: 'South Africa',
    AE: 'United Arab Emirates', SA: 'Saudi Arabia', TR: 'Turkey', IL: 'Israel',
    SG: 'Singapore', HK: 'Hong Kong', TW: 'Taiwan', TH: 'Thailand',
  };
  return countries[code?.toUpperCase()] || code || 'Unknown';
};

interface KYCSubmissionPayload {
  userName: string;
  userEmail: string;
  withdrawalId: string;
  withdrawalAmount: number;
  bankCountry: string;
  documentType: string;
  documentUrl?: string;
  taxId: string;
  submittedAt: string;
  adminEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-kyc-admin-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: KYCSubmissionPayload = await req.json();
    console.log("KYC admin notification payload:", { 
      userName: payload.userName,
      withdrawalId: payload.withdrawalId,
      documentType: payload.documentType
    });

    // Validate required fields
    if (!payload.userName || !payload.withdrawalId) {
      throw new Error("Missing required fields");
    }

    // Get admin email from settings or use default
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let adminEmail = payload.adminEmail;
    if (!adminEmail) {
      // Try to get admin email from referral_settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'referral_settings')
        .maybeSingle();
      
      if (settingsData?.setting_value) {
        const settings = settingsData.setting_value as { referralEmail?: string };
        adminEmail = settings.referralEmail;
      }
    }

    if (!adminEmail) {
      console.log("No admin email configured, skipping notification");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "No admin email configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize inputs
    const sanitize = (str: string) => str?.replace(/[<>]/g, '') || '';
    const userName = sanitize(payload.userName);
    const userEmail = sanitize(payload.userEmail || 'Not provided');
    const transactionRef = `TXN-${payload.withdrawalId.slice(0, 8).toUpperCase()}`;
    const countryName = getCountryName(payload.bankCountry);
    const documentType = sanitize(payload.documentType || 'ID Document');
    const taxId = sanitize(payload.taxId || 'Not provided');
    const submittedAt = payload.submittedAt ? new Date(payload.submittedAt).toLocaleString() : new Date().toLocaleString();
    
    const formattedAmount = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(payload.withdrawalAmount || 0);

    const adminPortalUrl = 'https://msktesla.lovable.app/admin';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KYC Document Submitted</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f0f;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                  
                  <!-- Header with Blue/Purple gradient for Admin -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr><td align="center" style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;"><span style="color: #ffffff;">📄 New KYC Submission</span></td></tr>
                        <tr><td align="center" style="color: #ffffff; font-size: 14px; padding-top: 8px;"><span style="color: #ffffff;">Admin Notification - Action Required</span></td></tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                        A user has submitted their KYC verification documents for review. Please review and approve/reject the submission.
                      </p>

                      <!-- User Details -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #3b82f6; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              👤 User Details
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Name</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${userName}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Email</td>
                                <td style="color: #3b82f6; font-size: 13px; padding: 8px 0; text-align: right;">${userEmail}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Country</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right;">${countryName}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Submission Details -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              📋 Submission Details
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Transaction Ref</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${transactionRef}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Withdrawal Amount</td>
                                <td style="color: #22c55e; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${formattedAmount}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Document Type</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right;">${documentType}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Tax ID Provided</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right;">${taxId ? 'Yes' : 'No'}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Submitted At</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right;">${submittedAt}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${adminPortalUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                              Review in Admin Portal →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 40px; border-top: 1px solid #2a2a2a; text-align: center;">
                      <p style="color: #52525b; font-size: 11px; margin: 0; line-height: 1.6;">This is a system-generated admin notification from Tesla Stock Platform.</p>
                      <p style="color: #3f3f46; font-size: 11px; margin: 8px 0 0 0;">&copy; 2026 Tesla Stock Platform. All rights reserved. &nbsp;&#8226;&nbsp; Confidential communication.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const fromEmail = Deno.env.get("FROM_EMAIL") || "Tesla Stock <noreply@teslastockplatform.com>";

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: `🔔 KYC Submission Pending Review - ${userName} [Ref: #${transactionRef}]`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
    });

    console.log("Admin KYC notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-kyc-admin-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
