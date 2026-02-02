import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated and is an admin
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

    // Get user IDs to sync from request body
    const { userIds } = await req.json() as { userIds: string[] };
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No user IDs provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Syncing profiles for ${userIds.length} users`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const userId of userIds) {
      try {
        // Get user from auth.users via admin API
        const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
        
        if (getUserError || !authUser?.user) {
          console.error(`Failed to get user ${userId}:`, getUserError);
          errors++;
          continue;
        }

        const email = authUser.user.email || null;
        const fullName = authUser.user.user_metadata?.full_name || null;

        // Check if profile exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id, full_name, email')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingProfile) {
          // Create new profile
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
              user_id: userId,
              email,
              full_name: fullName,
            });

          if (insertError) {
            console.error(`Failed to create profile for ${userId}:`, insertError);
            errors++;
          } else {
            created++;
            console.log(`Created profile for user ${userId}`);
          }
        } else {
          // Update if fields are missing
          const needsUpdate = (!existingProfile.full_name && fullName) || (!existingProfile.email && email);
          
          if (needsUpdate) {
            const updateData: { full_name?: string; email?: string } = {};
            if (!existingProfile.full_name && fullName) updateData.full_name = fullName;
            if (!existingProfile.email && email) updateData.email = email;

            const { error: updateError } = await supabaseAdmin
              .from('profiles')
              .update(updateData)
              .eq('user_id', userId);

            if (updateError) {
              console.error(`Failed to update profile for ${userId}:`, updateError);
              errors++;
            } else {
              updated++;
              console.log(`Updated profile for user ${userId}`);
            }
          }
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        created, 
        updated, 
        errors,
        message: `Synced ${created + updated} profiles (${created} created, ${updated} updated, ${errors} errors)` 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in sync-missing-profiles:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while syncing profiles" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
