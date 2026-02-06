import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random token
function generateToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('Admin access required');
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID required');
    }

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      throw new Error('Session not found');
    }

    // Generate new guest token
    const guestToken = generateToken();
    
    // Set expiry to 24 hours after session end, or 48 hours from now if no end time
    const expiresAt = session.end_time 
      ? new Date(new Date(session.end_time).getTime() + 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Update session with new guest token
    const { error: updateError } = await supabase
      .from('live_sessions')
      .update({
        guest_token: guestToken,
        guest_link_expires_at: expiresAt.toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error('Failed to generate guest link');
    }

    // Construct the guest join URL
    const baseUrl = req.headers.get('origin') || 'https://march-wellness.lovable.app';
    const guestJoinUrl = `${baseUrl}/live/${sessionId}?role=guest&token=${guestToken}`;

    console.log('Generated guest link for session:', sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        guestToken,
        guestJoinUrl,
        expiresAt: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in daily-generate-guest-link:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
