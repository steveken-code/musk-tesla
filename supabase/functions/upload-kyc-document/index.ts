import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { file, fileName, contentType, kycId, token, withdrawalId, documentType, taxId } = await req.json();

    // Validate required fields
    if (!file || !fileName || !kycId || !token || !withdrawalId || !documentType) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token and get KYC record
    const { data: kycRecord, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('id, user_id, status, kyc_token, withdrawal_id')
      .eq('id', kycId)
      .eq('kyc_token', token)
      .eq('withdrawal_id', withdrawalId)
      .single();

    if (kycError || !kycRecord) {
      console.error('Invalid or expired verification token:', kycError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (kycRecord.status !== 'pending_kyc') {
      console.error('KYC already submitted or processed');
      return new Response(
        JSON.stringify({ error: 'Verification already submitted or processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 file
    const base64Data = file.includes(',') ? file.split(',')[1] : file;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique file path
    const fileExt = fileName.split('.').pop() || 'jpg';
    const storagePath = `${kycRecord.user_id}/${documentType}_${Date.now()}.${fileExt}`;

    console.log('Uploading file to storage:', storagePath);

    // Upload to storage using service role (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(storagePath, binaryData, {
        contentType: contentType || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload document', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Create signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
    }

    const documentUrl = signedUrlData?.signedUrl || storagePath;

    // Update KYC record with document info
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        document_url: documentUrl,
        document_type: documentType,
        tax_id: taxId || null,
        status: 'kyc_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', kycId);

    if (updateError) {
      console.error('Error updating KYC record:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update verification record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('KYC record updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentUrl,
        message: 'Document uploaded successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
