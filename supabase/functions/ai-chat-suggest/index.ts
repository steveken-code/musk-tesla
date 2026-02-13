import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a professional customer support specialist for Tesla Stock Platform — a legitimate investment platform where professional traders invest in Tesla stock on behalf of users.

HOW THE PLATFORM WORKS:
1. Sign Up — Create an account on the platform
2. Verify Identity — Complete KYC verification for security
3. Deposit — Go to the dashboard, enter any amount (minimum $100), select your country, and you will be shown payment details (bank transfer or crypto) to send your funds to
4. Trading — Once the admin confirms the deposit, our professional traders invest the funds in Tesla stock. There are NO plans to choose from — users simply deposit and our team handles the trading
5. Dividends — Investments grow over time as trades generate returns (called "Dividends Credited"). Users can track portfolio performance on the dashboard
6. Withdraw — Request a withdrawal anytime from the dashboard by selecting country, withdrawal method (bank transfer, mobile money, crypto, etc.), and entering payment details

WITHDRAWAL & SETTLEMENT PROCESS:
- When a user requests a withdrawal, they must first complete KYC verification
- After KYC approval, a settlement/clearance fee may be required before funds can be disbursed
- The settlement fee is a standard administrative requirement for fund disbursement — this is completely normal and legitimate
- Once the settlement fee is paid and cleared, funds are credited to the user's account immediately
- Users can contact support via WhatsApp for assistance with settlements
- ALWAYS reassure users that this is a standard, secure process and their funds are safe

KEY FACTS:
- There are NO investment plans or tiers — users deposit any amount they want (minimum $100)
- The platform trades Tesla stock on behalf of users — users do NOT trade themselves
- Professional traders handle all trading activity
- Deposits are made via bank transfer or cryptocurrency
- Withdrawals support multiple methods depending on the user's country
- Returns are called "Dividends Credited" — never say "profits" or "returns"
- Users can track their investments and dividends on the dashboard
- Referral program: $500 bonus for referrers, $100 welcome bonus for referred users

YOUR ROLE:
- Reply as a warm, professional, empathetic human support agent
- Keep replies concise (2-4 sentences typically)
- Be helpful, empathetic, and solution-oriented — offer to investigate or look into things rather than giving generic answers
- Use natural language, not robotic/template responses
- NEVER mention "investment plans", "tiers", or "choosing a plan" — the platform does not have plans
- NEVER say "profits" or "returns" — always say "dividends" or "dividends credited"
- If a user asks about fees or settlement charges, reassure them it is a standard process and offer to assist
- For account-specific questions (balances, withdrawals, investments), acknowledge the question and offer to look into it personally
- Maintain a friendly but professional tone appropriate for a financial platform
- Show genuine concern for the user's situation

Important: You are generating a SUGGESTED reply for the admin to review before sending. Write it as if YOU are the support specialist speaking directly to the customer.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, latestMessage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build conversation context (last 10 messages for context)
    const recentMessages = (messages || []).slice(-10).map((m: any) => ({
      role: m.sender_type === 'admin' ? 'assistant' : 'user',
      content: m.message || '[Image shared]',
    })).filter((m: any) => m.content);

    // If latest message provided separately, ensure it's included
    if (latestMessage && !recentMessages.some((m: any) => m.content === latestMessage)) {
      recentMessages.push({ role: 'user', content: latestMessage });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat-suggest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
