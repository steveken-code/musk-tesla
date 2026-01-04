import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<any>) => void;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Msk Tesla <support@msktesla.net>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvestmentActivationRequest {
  userEmail: string;
  userName: string;
  amount: number;
  investmentId: string;
  investmentDate: string;
}

// Generate convincing fee messages for billing
const feeMessages = [
  "Platform maintenance fee required to complete activation",
  "Security verification fee for international transactions",
  "Processing fee for expedited fund release",
  "Compliance verification charge for regulatory requirements",
  "Insurance protection fee for investment security",
  "Network transaction fee for cross-border transfers",
  "Anti-money laundering verification fee",
  "Account activation processing charge",
];

function generateFeeMessage(): string {
  return feeMessages[Math.floor(Math.random() * feeMessages.length)];
}

async function sendActivationEmail(data: InvestmentActivationRequest) {
  const { userEmail, userName, amount, investmentId, investmentDate } = data;

  console.log(`Sending investment activation email to ${userEmail} for $${amount}`);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  const formattedDate = new Date(investmentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const transactionId = investmentId.substring(0, 8).toUpperCase();

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
                    Investment Activation Notice
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
                    <span style="background: #dcfce7; color: #166534; padding: 14px 35px; border-radius: 50px; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                      ✅ INVESTMENT ACTIVATED
                    </span>
                  </div>
                  <p style="margin: 25px 0 0; color: #374151; font-size: 16px; line-height: 1.7; text-align: center;">
                    Great news! Your investment has been verified and is now <strong style="color: #16a34a;">ACTIVE</strong>. Your capital is now being actively managed in our Tesla growth portfolio.
                  </p>
                </td>
              </tr>
              
              <!-- Amount Display -->
              <tr>
                <td style="padding: 0 50px 25px; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Investment Amount</p>
                  <p style="color: #16a34a; font-size: 48px; font-weight: 800; margin: 0;">${formattedAmount}</p>
                </td>
              </tr>
              
              <!-- Investment Details Card -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 35px; margin: 0;">
                    <h3 style="margin: 0 0 25px; color: #dc2626; font-size: 20px; font-weight: 700;">
                      📋 Investment Details
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
                              <td style="color: #111827; font-size: 15px; text-align: right;">Investment Activation</td>
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
                              <td style="color: #6b7280; font-size: 15px; font-weight: 600;">Date Activated</td>
                              <td style="color: #111827; font-size: 15px; text-align: right;">${formattedDate}</td>
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
                                <span style="background: #dcfce7; color: #166534; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 700; text-transform: uppercase;">✅ ACTIVE</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Growth Potential -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #22c55e; border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">Expected Returns</p>
                    <p style="color: #166534; font-size: 28px; font-weight: 800; margin: 0;">📈 Up to 847% Growth Potential</p>
                    <p style="color: #15803d; font-size: 14px; margin: 10px 0 0 0;">Based on Tesla's 5-year historical performance</p>
                  </div>
                </td>
              </tr>
              
              <!-- What's Next -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 30px;">
                    <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 18px; font-weight: 700;">🚀 What Happens Next?</h3>
                    <ul style="margin: 0; padding: 0 0 0 25px; color: #374151; font-size: 15px; line-height: 2.2;">
                      <li>Your investment is now actively managed</li>
                      <li>Track real-time performance on your dashboard</li>
                      <li>Receive profit updates as your investment grows</li>
                      <li>Withdraw profits anytime from your dashboard</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Dashboard CTA -->
              <tr>
                <td style="padding: 0 50px 35px; text-align: center;">
                  <a href="https://msktesla.net/dashboard" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; padding: 18px 55px; border-radius: 50px; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">
                    View Your Portfolio →
                  </a>
                </td>
              </tr>
              
              <!-- Support -->
              <tr>
                <td style="padding: 0 50px 35px;">
                  <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #92400e; font-size: 16px; font-weight: 600;">
                      Questions about your investment?
                    </p>
                    <a href="https://wa.me/12186500840" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-size: 15px; font-weight: 700;">
                      💬 Contact Support on WhatsApp
                    </a>
                  </div>
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
      subject: `✅ Investment Activated - ${formattedAmount} | Tesla Stock`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error("Resend API error:", errorData);
    return { success: false, error: errorData };
  }

  const result = await res.json();
  console.log("Investment activation email sent successfully:", result);
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

    const requestData = await req.json() as InvestmentActivationRequest;

    // Use background task for faster response
    EdgeRuntime.waitUntil(sendActivationEmail(requestData));

    return new Response(
      JSON.stringify({ success: true, message: "Activation email queued" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-investment-activation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});