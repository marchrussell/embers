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

    const { sessionId, roomName, sessionType } = await req.json();

    if (!sessionId || !roomName) {
      throw new Error('sessionId and roomName are required');
    }

    // ── Step 1: List recordings for this room ──────────────────────────────
    console.log('Fetching recordings for room:', roomName);

    const listResponse = await fetch(
      `https://api.daily.co/v1/recordings?room_name=${encodeURIComponent(roomName)}`,
      {
        headers: { 'Authorization': `Bearer ${DAILY_API_KEY}` },
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('Daily API error (list):', errorText);
      throw new Error(`Failed to fetch recordings from Daily.co: ${errorText}`);
    }

    const listData = await listResponse.json();
    const recordings: Array<{ id: string; status: string; start_ts?: number }> = listData.data ?? [];

    const finished = recordings.filter((r) => r.status === 'finished');
    if (finished.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No finished recording found yet for this room' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Most recent first
    finished.sort((a, b) => (b.start_ts ?? 0) - (a.start_ts ?? 0));
    const recordingId = finished[0].id;

    // ── Step 2: Fetch the access link ──────────────────────────────────────
    console.log('Fetching access link for recording:', recordingId);

    const accessResponse = await fetch(
      `https://api.daily.co/v1/recordings/${recordingId}/access-link`,
      {
        headers: { 'Authorization': `Bearer ${DAILY_API_KEY}` },
      }
    );

    if (!accessResponse.ok) {
      const errorText = await accessResponse.text();
      console.error('Daily API error (access-link):', errorText);
      throw new Error(`Failed to fetch recording access link: ${errorText}`);
    }

    const accessData = await accessResponse.json();
    const downloadLink: string = accessData.download_link;

    if (!downloadLink || !downloadLink.startsWith('https://')) {
      throw new Error(`Invalid download link received from Daily.co: ${downloadLink}`);
    }

    // ── Step 3: Store or re-host depending on session type ─────────────────
    // weekly-reset: 7-day Daily.co link matches the availability window
    // everything else: upload to Supabase Storage for permanent access
    const useTempLink = sessionType === 'weekly-reset';
    let recordingUrl: string;

    if (useTempLink) {
      console.log('Storing Daily.co temp link for weekly-reset session:', sessionId);
      recordingUrl = downloadLink;
    } else {
      console.log('Downloading and re-hosting recording for session:', sessionId);

      const videoRes = await fetch(downloadLink);
      if (!videoRes.ok) {
        throw new Error(`Failed to download recording from Daily.co: ${videoRes.statusText}`);
      }

      const fileName = `${sessionId}-${Date.now()}.mp4`;
      const videoBlob = await videoRes.blob();

      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, videoBlob, { contentType: 'video/mp4', upsert: false });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      recordingUrl = urlData.publicUrl;
      console.log('Recording uploaded to Supabase Storage:', recordingUrl);
    }

    // ── Step 4: Write to DB ────────────────────────────────────────────────
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
