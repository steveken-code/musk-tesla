import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://msktesla.net',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Valid country codes
const VALID_COUNTRIES = [
  'RU', 'US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'PL', 'CZ', 
  'PT', 'SE', 'NO', 'DK', 'FI', 'IE', 'GR', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 
  'LT', 'LV', 'EE', 'CY', 'MT', 'LU', 'UA', 'BY', 'KZ', 'GE', 'AM', 'AZ', 'MD',
  'CA', 'AU', 'NZ', 'JP', 'KR', 'CN', 'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'PE',
  'ZA', 'NG', 'EG', 'MA', 'KE', 'GH', 'TZ', 'AE', 'SA', 'IL', 'TR', 'TH', 'VN',
  'MY', 'SG', 'ID', 'PH'
];

// Maximum withdrawal amount
const MAX_WITHDRAWAL_AMOUNT = 1000000;
const MAX_PAYMENT_DETAILS_LENGTH = 500;

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify user with anon client
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      console.error('Invalid JSON body');
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, country, payment_details, payment_method } = body;

    // Validate amount
    if (amount === undefined || amount === null) {
      console.error('Amount is required');
      return new Response(
        JSON.stringify({ error: 'Amount is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({ error: 'Amount must be a positive number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (numericAmount > MAX_WITHDRAWAL_AMOUNT) {
      console.error('Amount exceeds maximum:', numericAmount);
      return new Response(
        JSON.stringify({ error: `Amount cannot exceed ${MAX_WITHDRAWAL_AMOUNT}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate country
    if (!country || typeof country !== 'string') {
      console.error('Country is required');
      return new Response(
        JSON.stringify({ error: 'Country is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!VALID_COUNTRIES.includes(country.toUpperCase())) {
      console.error('Invalid country code:', country);
      return new Response(
        JSON.stringify({ error: 'Invalid country code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment_details
    if (!payment_details || typeof payment_details !== 'string') {
      console.error('Payment details are required');
      return new Response(
        JSON.stringify({ error: 'Payment details are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (payment_details.length > MAX_PAYMENT_DETAILS_LENGTH) {
      console.error('Payment details too long:', payment_details.length);
      return new Response(
        JSON.stringify({ error: `Payment details cannot exceed ${MAX_PAYMENT_DETAILS_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize payment details - remove potential script tags
    const sanitizedPaymentDetails = payment_details
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();

    if (sanitizedPaymentDetails.length === 0) {
      console.error('Payment details are empty after sanitization');
      return new Response(
        JSON.stringify({ error: 'Invalid payment details' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's available balance (profit from active investments)
    const { data: investments, error: investmentsError } = await supabaseAdmin
      .from('investments')
      .select('amount, profit_amount, status')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const availableBalance = investments?.reduce(
      (sum, inv) => sum + (inv.profit_amount || 0), 
      0
    ) || 0;

    console.log('Available balance:', availableBalance, 'Requested amount:', numericAmount);

    if (numericAmount > availableBalance) {
      console.error('Insufficient balance. Available:', availableBalance, 'Requested:', numericAmount);
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert withdrawal with validated data
    const { data: withdrawalData, error: insertError } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount: numericAmount,
        country: country.toUpperCase(),
        payment_details: sanitizedPaymentDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating withdrawal:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create withdrawal request' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Withdrawal created successfully:', withdrawalData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: withdrawalData,
        payment_method: payment_method || 'card'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error in create-withdrawal:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
