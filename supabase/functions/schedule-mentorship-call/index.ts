import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Calendar API helpers
async function getGoogleAccessToken() {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google service account credentials');
  }

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claimBase64 = btoa(JSON.stringify(claim)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signatureInput = `${headerBase64}.${claimBase64}`;

  const keyData = privateKey.replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signatureInput}.${signatureBase64}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Google token error:', data);
    throw new Error(`Failed to get Google access token: ${JSON.stringify(data)}`);
  }
  
  return data.access_token;
}

// Zoom API helpers
async function getZoomAccessToken() {
  const accountId = Deno.env.get('ZOOM_ACCOUNT_ID');
  const clientId = Deno.env.get('ZOOM_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOOM_CLIENT_SECRET');

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Missing Zoom credentials');
  }

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=account_credentials&account_id=${accountId}`,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Zoom token error:', data);
    throw new Error(`Failed to get Zoom access token: ${JSON.stringify(data)}`);
  }
  
  return data.access_token;
}

async function createZoomMeeting(accessToken: string, topic: string, startTime: string, duration: number) {
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Zoom meeting creation error:', data);
    throw new Error(`Failed to create Zoom meeting: ${JSON.stringify(data)}`);
  }
  
  return data;
}

async function createGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  summary: string,
  startTime: string,
  endTime: string,
  attendeeEmail: string,
  zoomLink: string,
  notes: string
) {
  const event = {
    summary,
    description: `${notes}\n\nZoom Link: ${zoomLink}`,
    start: {
      dateTime: startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime,
      timeZone: 'UTC',
    },
    attendees: [
      { email: attendeeEmail },
    ],
    conferenceData: {
      entryPoints: [{
        entryPointType: 'video',
        uri: zoomLink,
        label: 'Zoom Meeting',
      }],
      conferenceSolution: {
        name: 'Zoom Meeting',
        iconUri: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png',
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error('Google Calendar event creation error:', data);
    throw new Error(`Failed to create calendar event: ${JSON.stringify(data)}`);
  }
  
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, scheduledFor, notes, calendarId } = await req.json();

    if (!userId || !scheduledFor) {
      throw new Error('Missing required fields: userId, scheduledFor');
    }

    console.log('Scheduling call for user:', userId, 'at', scheduledFor);

    // Get user profile for email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    // Create Zoom meeting
    const zoomToken = await getZoomAccessToken();
    const startTime = new Date(scheduledFor).toISOString();
    const zoomMeeting = await createZoomMeeting(
      zoomToken,
      `Mentorship Session with ${profile.full_name || profile.email}`,
      startTime,
      60 // 1 hour duration
    );

    console.log('Zoom meeting created:', zoomMeeting.id);

    // Create Google Calendar event
    const googleToken = await getGoogleAccessToken();
    const endTime = new Date(new Date(scheduledFor).getTime() + 60 * 60 * 1000).toISOString();
    
    const calendarEvent = await createGoogleCalendarEvent(
      googleToken,
      calendarId || 'primary',
      `Mentorship Session - ${profile.full_name || profile.email}`,
      startTime,
      endTime,
      profile.email,
      zoomMeeting.join_url,
      notes || 'Mentorship coaching session'
    );

    console.log('Google Calendar event created:', calendarEvent.id);

    // Save to database
    const { data: call, error: callError } = await supabase
      .from('mentorship_calls')
      .insert({
        user_id: userId,
        scheduled_for: scheduledFor,
        zoom_link: zoomMeeting.join_url,
        notes: notes || '',
        status: 'scheduled',
      })
      .select()
      .single();

    if (callError) {
      console.error('Database error:', callError);
      throw new Error(`Failed to save call to database: ${callError.message}`);
    }

    console.log('Call saved to database:', call.id);

    return new Response(
      JSON.stringify({
        success: true,
        call,
        zoomMeeting: {
          id: zoomMeeting.id,
          joinUrl: zoomMeeting.join_url,
          startUrl: zoomMeeting.start_url,
        },
        calendarEvent: {
          id: calendarEvent.id,
          htmlLink: calendarEvent.htmlLink,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in schedule-mentorship-call:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
