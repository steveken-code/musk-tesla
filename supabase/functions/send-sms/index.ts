import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SmsType = 
  | "withdrawal_approved"
  | "withdrawal_rejected"
  | "withdrawal_on_hold"
  | "investment_activated"
  | "login_alert"
  | "profit_update"
  | "trade_closed"
  | "kyc_required"
  | "custom";

interface SendSmsRequest {
  userId?: string;
  phoneNumber?: string;  // Direct phone number (if userId not provided)
  type: SmsType;
  data?: Record<string, string | number>;
  customMessage?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function buildMessage(type: SmsType, data: Record<string, string | number> = {}): string {
  const name = data.userName || "there";
  
  switch (type) {
    case "withdrawal_approved":
      return `Tesla Stock Platform: Hello ${name}, your withdrawal of ${formatCurrency(Number(data.amount))} has been APPROVED and is being processed. Funds will arrive shortly. View details: msktesla.net/dashboard`;
    
    case "withdrawal_rejected":
      return `Tesla Stock Platform: Hello ${name}, your withdrawal request for ${formatCurrency(Number(data.amount))} could not be processed. Please contact support for assistance. msktesla.net/dashboard`;
    
    case "withdrawal_on_hold":
      return `Tesla Stock Platform: Hello ${name}, your withdrawal of ${formatCurrency(Number(data.amount))} is ON HOLD and requires additional verification. Please contact support. msktesla.net/dashboard`;
    
    case "investment_activated":
      return `Tesla Stock Platform: Great news ${name}! Your investment of ${formatCurrency(Number(data.amount))} is now ACTIVE and trading. Track your portfolio: msktesla.net/dashboard`;
    
    case "login_alert":
      return `Tesla Stock Platform: New login detected on your account. If this wasn't you, please secure your account immediately. msktesla.net/dashboard`;
    
    case "profit_update":
      return `Tesla Stock Platform: Hello ${name}, your portfolio has earned ${formatCurrency(Number(data.profitAmount))} in profits! Total balance: ${formatCurrency(Number(data.totalBalance))}. View: msktesla.net/dashboard`;
    
    case "trade_closed":
      return `Tesla Stock Platform: Hello ${name}, a trade has been closed on your portfolio. Profit: ${formatCurrency(Number(data.profitAmount))}. Check your dashboard: msktesla.net/dashboard`;
    
    case "kyc_required":
      return `Tesla Stock Platform: Hello ${name}, identity verification (KYC) is required to proceed with your withdrawal. Please check your email for instructions.`;
    
    case "custom":
      return data.customMessage as string || "Tesla Stock Platform: You have a new notification. Visit msktesla.net/dashboard";
    
    default:
      return "Tesla Stock Platform: You have a new notification. Visit msktesla.net/dashboard";
  }
}

async function sendTwilioSms(to: string, body: string): Promise<{ success: boolean; error?: string; sid?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  // Ensure phone number starts with +
  const formattedTo = to.startsWith("+") ? to : `+${to}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }).toString(),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Twilio SMS failed [${response.status}]:`, result);
      return { success: false, error: result.message || "SMS send failed" };
    }

    console.log(`SMS sent successfully to ${formattedTo}, SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error: any) {
    console.error("Twilio SMS error:", error);
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, phoneNumber, type, data = {}, customMessage }: SendSmsRequest = await req.json();

    let targetPhone = phoneNumber;

    // If userId provided, look up phone from profiles
    if (userId && !targetPhone) {
      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("phone, full_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile?.phone) {
        console.log(`No phone number found for user ${userId}, skipping SMS`);
        return new Response(
          JSON.stringify({ success: false, reason: "no_phone_number" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      targetPhone = profile.phone;
      if (!data.userName && profile.full_name) {
        data.userName = profile.full_name;
      }
    }

    if (!targetPhone) {
      return new Response(
        JSON.stringify({ error: "No phone number provided or found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (customMessage) {
      data.customMessage = customMessage;
    }

    const message = buildMessage(type, data);
    const result = await sendTwilioSms(targetPhone, message);

    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("send-sms error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
