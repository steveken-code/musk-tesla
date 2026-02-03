import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Tax ID label by country
const getTaxIdLabel = (countryCode: string): string => {
  const labels: Record<string, string> = {
    RU: 'TIN (ИНН) for Russian Federation residents',
    US: 'Social Security Number (SSN) for US residents',
    DE: 'Steuer-ID for German residents',
    GB: 'National Insurance Number for UK residents',
    FR: 'NIF for French residents',
    ES: 'NIF/NIE for Spanish residents',
    IT: 'Codice Fiscale for Italian residents',
    CA: 'Social Insurance Number (SIN) for Canadian residents',
    AU: 'Tax File Number (TFN) for Australian residents',
  };
  return labels[countryCode?.toUpperCase()] || 'Tax Identification Number for your country of residence';
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

interface KYCRequestPayload {
  userEmail: string;
  userName: string;
  withdrawalId: string;
  withdrawalAmount: number;
  kycToken: string;
  bankCountry: string;
  verificationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-kyc-request function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: KYCRequestPayload = await req.json();
    console.log("KYC request payload:", { 
      userEmail: payload.userEmail, 
      userName: payload.userName,
      withdrawalId: payload.withdrawalId,
      bankCountry: payload.bankCountry 
    });

    // Validate required fields
    if (!payload.userEmail || !payload.userName || !payload.withdrawalId || !payload.kycToken) {
      throw new Error("Missing required fields");
    }

    // Sanitize inputs
    const sanitize = (str: string) => str?.replace(/[<>]/g, '') || '';
    const userName = sanitize(payload.userName);
    const withdrawalId = sanitize(payload.withdrawalId);
    const transactionRef = `TXN-${withdrawalId.slice(0, 8).toUpperCase()}`;
    const taxIdLabel = getTaxIdLabel(payload.bankCountry);
    const countryName = getCountryName(payload.bankCountry);
    // Use the provided verificationUrl or fallback to the platform's production URL
    const verificationUrl = payload.verificationUrl || `https://msktesla.net/verify-identity?token=${payload.kycToken}&withdrawal_id=${payload.withdrawalId}`;
    const formattedAmount = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(payload.withdrawalAmount || 0);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Identity Verification Required</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f0f;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                  
                  <!-- Header with Tesla Red gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                        🔐 Identity Verification Required
                      </h1>
                      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">
                        Tesla Stock Brokerage Platform
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Dear <span style="color: #3b82f6; font-weight: 600;">${userName}</span>,
                      </p>

                      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                        To comply with international <strong style="color: #ffffff;">Anti-Money Laundering (AML)</strong> and 
                        <strong style="color: #ffffff;">Counter-Terrorist Financing (CTF)</strong> regulations, we require a 
                        formal Identity Verification (KYC) to process your recent withdrawal request.
                      </p>

                      <!-- CTA Button -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                              Complete KYC Verification →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Requirements Box - Professional Light Grey Styling -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(148, 163, 184, 0.1); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #e2e8f0; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              📋 Requirements
                            </h3>
                            <ul style="color: #d1d5db; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                              <li><strong style="color: #ffffff;">Government-Issued ID:</strong> A clear, color scan of your Passport, National ID, or Driver's License</li>
                              <li><strong style="color: #ffffff;">Tax Identification:</strong> ${taxIdLabel}</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <!-- Transaction Details -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              📊 Transaction Details
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Reference</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${transactionRef}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Withdrawal Amount</td>
                                <td style="color: #22c55e; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${formattedAmount}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Country</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right;">${countryName}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 8px 0;">Status</td>
                                <td style="padding: 8px 0; text-align: right;">
                                  <span style="background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    Pending Verification
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #71717a; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                        Your funds are currently held in a secured <strong style="color: #eab308;">'Pending'</strong> status 
                        and will proceed to the next stage once your identity is confirmed.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 40px; border-top: 1px solid #2a2a2a; text-align: center;">
                      <p style="color: #52525b; font-size: 12px; margin: 0;">
                        This is an automated message from Tesla Stock Brokerage Platform.<br>
                        Please do not reply to this email.
                      </p>
                      <p style="color: #3f3f46; font-size: 11px; margin: 16px 0 0 0;">
                        © 2024 Tesla Stock Platform. All rights reserved.
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

    const FROM_EMAIL = "Tesla Stock Platform <no-reply@msktesla.net>";

    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [payload.userEmail],
      subject: `Action Required: Identity Verification for Withdrawal Request [Ref: #${transactionRef}]`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
    });

    console.log("KYC request email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-kyc-request function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
