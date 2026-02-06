import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔵 Delete user function called');
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      throw new Error('No authorization header');
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');

    console.log('🔐 Verifying admin user...');
    
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Verify the user is authenticated using the admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ User verification failed:', userError);
      throw new Error('Unauthorized');
    }

    console.log('✅ User authenticated:', user.email);

    // Check if user has admin role using admin client
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('🔍 User roles:', userRoles);

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError);
      throw new Error('Failed to verify admin status');
    }

    if (!userRoles?.some(r => r.role === 'admin')) {
      console.error('❌ User is not an admin');
      throw new Error('Unauthorized: Admin access required');
    }

    console.log('✅ Admin verified');

    // Get the user ID to delete from the request body
    const { userId } = await req.json();
    
    if (!userId) {
      console.error('❌ No userId provided');
      throw new Error('User ID is required');
    }

    console.log('🗑️ Starting deletion for user ID:', userId);

    // First, get user email before deletion (for cleanup)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    const userEmail = profile?.email;
    console.log('📧 User email for cleanup:', userEmail);

    console.log('🔨 Attempting to delete user from auth...');

    // Try to delete the user from auth (this will cascade to profiles and related tables due to ON DELETE CASCADE)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      // If user not found in auth, that's OK - they may have been deleted already
      if (deleteError.message?.includes('User not found') || deleteError.message?.includes('not found')) {
        console.log('⚠️ User not found in auth (may be already deleted), cleaning up database records...');
      } else {
        console.error('❌ Error deleting user from auth:', deleteError);
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }
    } else {
      console.log('✅ User deleted from auth');
    }

    // Clean up any remaining database records (in case user was already deleted from auth)
    if (userEmail) {
      console.log('🧹 Cleaning up pending subscriptions by email...');
      
      const { error: pendingError } = await supabaseAdmin
        .from('pending_subscriptions')
        .delete()
        .eq('email', userEmail);
      
      if (pendingError) {
        console.log('⚠️ Could not delete pending subscriptions:', pendingError.message);
      } else {
        console.log('✅ Pending subscriptions cleaned up');
      }
    }

    console.log('✅ User and all related data cleaned up successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in delete-user function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
