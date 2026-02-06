import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { eventReminderEmail } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    console.log("Starting event reminder check...");

    // Get current time and 24-26 hour window (to account for cron timing)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowPlus2h = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    console.log(`Checking for events between ${tomorrow.toISOString()} and ${tomorrowPlus2h.toISOString()}`);

    // Find bookings for events happening in 24-26 hours that haven't had reminders sent
    const { data: bookings, error: fetchError } = await supabase
      .from("event_bookings")
      .select("*")
      .eq("payment_status", "completed")
      .is("reminder_sent_at", null)
      .gte("event_date", tomorrow.toISOString())
      .lte("event_date", tomorrowPlus2h.toISOString());

    if (fetchError) {
      console.error("Error fetching bookings:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${bookings?.length || 0} bookings needing reminders`);

    const results = [];

    for (const booking of bookings || []) {
      try {
        // Parse event date for display
        const eventDate = new Date(booking.event_date);
        const formattedDate = eventDate.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, ' • ');
        
        const formattedTime = eventDate.toLocaleTimeString('en-GB', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Europe/London'
        }).toUpperCase() + ' GMT';

        // Determine location based on event type
        let location = 'Online';
        if (booking.event_type?.includes('In-Person') || booking.event_type?.includes('Dub')) {
          location = 'AUFI, 20 Eastcastle St, London W1W 8DB';
        }

        const emailHtml = eventReminderEmail(booking.attendee_name, {
          eventTitle: booking.event_type || 'MARCH Event',
          eventDate: formattedDate,
          eventTime: formattedTime,
          location,
          quantity: booking.quantity
        });

        // Send reminder email
        const { error: emailError } = await resend.emails.send({
          from: "MARCH <events@marchrussell.com>",
          to: [booking.attendee_email],
          subject: `Reminder: ${booking.event_type || 'Your Session'} is Tomorrow`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Failed to send reminder to ${booking.attendee_email}:`, emailError);
          results.push({ id: booking.id, status: 'failed', error: emailError.message });
          continue;
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("event_bookings")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", booking.id);

        if (updateError) {
          console.error(`Failed to update reminder status for ${booking.id}:`, updateError);
        }

        console.log(`✅ Reminder sent to ${booking.attendee_email} for ${booking.event_type}`);
        results.push({ id: booking.id, status: 'sent', email: booking.attendee_email });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`Error processing booking ${booking.id}:`, err);
        results.push({ id: booking.id, status: 'error', error: errorMessage });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-event-reminders:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});