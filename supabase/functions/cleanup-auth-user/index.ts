import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { email } = await req.json();
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log('🧹 Request to clean up auth user:', email);

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate the requesting user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error('❌ Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const requestingUser = claimsData.user;
    console.log('👤 Requesting user:', requestingUser.email);

    // Check if user is deleting their own account
    const isDeletingOwnAccount = requestingUser.email === email;

    // If not deleting own account, check for admin role
    if (!isDeletingOwnAccount) {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', requestingUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('❌ Error checking admin role:', roleError.message);
        throw new Error('Failed to verify permissions');
      }

      if (!roleData) {
        console.error('❌ User attempted to delete another account without admin role');
        return new Response(
          JSON.stringify({ error: 'Forbidden - you can only delete your own account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }

      console.log('✅ Admin role verified');
    } else {
      console.log('✅ User is deleting their own account');
    }

    // Get user by email to delete
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    const userToDelete = users.find(u => u.email === email);
    
    if (!userToDelete) {
      console.log('ℹ️ User not found in auth.users');
      return new Response(
        JSON.stringify({ success: true, message: 'User not found - already deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log('🗑️ Deleting user from auth:', userToDelete.id);

    // Delete from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    console.log('✅ User successfully deleted from auth');

    return new Response(
      JSON.stringify({ success: true, message: 'User deleted from auth successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
