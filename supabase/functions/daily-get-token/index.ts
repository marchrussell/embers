import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Live Streaming Token Generation
 * 
 * HARD REQUIREMENTS (do not reinterpret):
 * 1. Participants and guest teachers NEVER see participant count
 * 2. Guest teachers join via secure link, not admin access
 * 3. Waiting room exists before session goes live
 * 4. Host can test sound privately before going live
 * 5. Session only begins when host explicitly starts it
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!DAILY_API_KEY) {
      throw new Error('Daily.co not configured');
    }

    const { sessionId, role, guestToken } = await req.json();

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('live_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      throw new Error('Session not found');
    }

    if (!session.daily_room_name) {
      throw new Error('Session room not created yet');
    }

    let tokenRole: 'host' | 'guest' | 'audience' = 'audience';
    let userId: string | null = null;
    let userName = 'Viewer';
    let canJoinNow = false;

    // Determine if user can join based on session status and role
    // Host can ALWAYS join (to test privately before going live)
    // Guest and audience can only join when session is "live"

    // === ROLE: GUEST TEACHER ===
    if (role === 'guest' && guestToken) {
      // Validate guest token
      if (session.guest_token !== guestToken) {
        throw new Error('Invalid guest link');
      }
      
      // Check if guest link has expired
      if (session.guest_link_expires_at && new Date(session.guest_link_expires_at) < new Date()) {
        throw new Error('Guest link has expired');
      }
      
      tokenRole = 'guest';
      userName = 'Guest Teacher';
      
      // Guest teachers can only join when session is live
      canJoinNow = session.status === 'live';
      
      if (!canJoinNow) {
        throw new Error('Waiting for host to start the session');
      }
      
      console.log('Guest teacher joining session:', sessionId);
      
    // === ROLE: HOST (ADMIN) ===  
    } else if (role === 'host') {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Authorization required for host access');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error('Unauthorized');
      }

      // Verify admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        throw new Error('Admin access required for host');
      }

      tokenRole = 'host';
      userId = user.id;
      userName = 'March';
      
      // Host can ALWAYS join (for private sound testing)
      canJoinNow = true;
      
      console.log('Host joining session:', sessionId, 'Status:', session.status);
      
    // === ROLE: AUDIENCE (SUBSCRIBER) ===
    } else {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Sign in required to join');
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error('Please sign in to join');
      }

      // Check for active subscription (if required)
      if (session.access_level === 'members') {
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'past_due'])
          .maybeSingle();

        if (!subscription) {
          throw new Error('Active membership required');
        }
      }

      tokenRole = 'audience';
      userId = user.id;
      
      // Get user name for display (never shown to others, just for host reference)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name')
        .eq('id', user.id)
        .maybeSingle();
      
      userName = profile?.first_name || profile?.full_name?.split(' ')[0] || 'Viewer';
      
      // Audience can only join when session is live
      canJoinNow = session.status === 'live';
      
      if (!canJoinNow) {
        // Return waiting room response instead of error
        return new Response(
          JSON.stringify({
            waitingRoom: true,
            sessionStatus: session.status,
            message: 'Session has not started yet. Please wait.',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Audience member joining:', user.id);
    }

    // Calculate token expiry
    const expiry = session.end_time 
      ? Math.floor(new Date(session.end_time).getTime() / 1000) + 3600
      : Math.floor(Date.now() / 1000) + 14400;

    // Build token properties based on role
    // CRITICAL: Never expose participant count to guests or audience
    const tokenProperties: Record<string, unknown> = {
      room_name: session.daily_room_name,
      user_name: userName,
      exp: expiry,
    };

    if (tokenRole === 'host') {
      // Host: full control, can see everything
      tokenProperties.is_owner = true;
      tokenProperties.enable_screenshare = true;
      tokenProperties.start_video_off = false;
      tokenProperties.start_audio_off = false;
    } else if (tokenRole === 'guest') {
      // Guest teacher: can broadcast but NOT see participant count or list
      tokenProperties.is_owner = false;
      tokenProperties.enable_screenshare = true;
      tokenProperties.start_video_off = false;
      tokenProperties.start_audio_off = false;
    } else {
      // Audience: view-only, completely passive
      tokenProperties.is_owner = false;
      tokenProperties.enable_screenshare = false;
      tokenProperties.start_video_off = true;
      tokenProperties.start_audio_off = true;
      tokenProperties.enable_recording = false;
    }

    // Create meeting token via Daily API
    const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({ properties: tokenProperties }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Daily token API error:', errorText);
      throw new Error('Failed to create meeting token');
    }

    const tokenData = await tokenResponse.json();

    // Track attendance (only for authenticated users)
    if (userId) {
      try {
        await supabase.from('live_session_attendance').insert({
          session_id: sessionId,
          user_id: userId,
          role: tokenRole,
        });
      } catch {
        // Don't fail if attendance tracking fails
      }
    }

    return new Response(
      JSON.stringify({
        token: tokenData.token,
        roomUrl: session.daily_room_url,
        role: tokenRole,
        userName,
        sessionStatus: session.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in daily-get-token:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
