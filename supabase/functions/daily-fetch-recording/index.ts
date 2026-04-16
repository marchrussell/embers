import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('Admin access required');
    }

    const { sessionId, roomName } = await req.json();

    if (!sessionId || !roomName) {
      throw new Error('sessionId and roomName are required');
    }

    console.log('Fetching recordings for room:', roomName);

    const recordingsResponse = await fetch(
      `https://api.daily.co/v1/recordings?room_name=${encodeURIComponent(roomName)}`,
      {
        headers: {
          'Authorization': `Bearer ${DAILY_API_KEY}`,
        },
      }
    );

    if (!recordingsResponse.ok) {
      const errorText = await recordingsResponse.text();
      console.error('Daily API error:', errorText);
      throw new Error(`Failed to fetch recordings from Daily.co: ${errorText}`);
    }

    const recordingsData = await recordingsResponse.json();
    const recordings: Array<{ status: string; download_link?: string; s3key?: string; duration?: number; start_ts?: number }> = recordingsData.data ?? [];

    const finished = recordings.filter((r) => r.status === 'finished' && r.download_link);
    if (finished.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No finished recording found yet for this room' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Most recent first (Daily returns them newest-first, but sort by start_ts to be safe)
    finished.sort((a, b) => (b.start_ts ?? 0) - (a.start_ts ?? 0));
    const recordingUrl = finished[0].download_link!;

    const { error: updateError } = await supabase
      .from('live_sessions')
      .update({ recording_url: recordingUrl })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error('Failed to save recording URL');
    }

    console.log('Recording URL saved for session:', sessionId);

    return new Response(
      JSON.stringify({ success: true, recording_url: recordingUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in daily-fetch-recording:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
