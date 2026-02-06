import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY');
    const DAILY_DOMAIN = Deno.env.get('DAILY_DOMAIN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!DAILY_API_KEY || !DAILY_DOMAIN) {
      console.error('Missing Daily.co credentials');
      throw new Error('Daily.co not configured');
    }

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Verify the user is an admin
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

    const { sessionId, title, startTime, endTime, recordingEnabled } = await req.json();

    console.log('Creating Daily room for session:', sessionId, title);

    // Create room name from session ID (sanitized)
    const roomName = `march-live-${sessionId.substring(0, 8)}`;

    // Calculate expiry (24 hours after end time, or 24 hours from now if no end time)
    const expiry = endTime 
      ? Math.floor(new Date(endTime).getTime() / 1000) + 86400 
      : Math.floor(Date.now() / 1000) + 86400;

    // Create Daily room via API
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'private',
        properties: {
          exp: expiry,
          enable_chat: false,
          enable_knocking: false,
          enable_screenshare: true,
          enable_recording: recordingEnabled ? 'cloud' : undefined,
          start_video_off: true,
          start_audio_off: true,
          owner_only_broadcast: true,
          enable_prejoin_ui: false,
          enable_people_ui: false,
          enable_network_ui: false,
        },
      }),
    });

    if (!roomResponse.ok) {
      const errorText = await roomResponse.text();
      console.error('Daily API error:', errorText);
      throw new Error(`Failed to create Daily room: ${errorText}`);
    }

    const roomData = await roomResponse.json();
    console.log('Daily room created:', roomData.name);

    const roomUrl = `https://${DAILY_DOMAIN}/${roomData.name}`;

    // Update the live session with room details
    const { error: updateError } = await supabase
      .from('live_sessions')
      .update({
        daily_room_name: roomData.name,
        daily_room_url: roomUrl,
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error('Failed to update session with room details');
    }

    return new Response(
      JSON.stringify({
        success: true,
        roomName: roomData.name,
        roomUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in daily-create-room:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
