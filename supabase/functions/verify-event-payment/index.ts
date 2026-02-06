import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) throw new Error("Session ID required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const { eventId, userId, quantity, signatureData, attendeeName, attendeeEmail } = session.metadata;

    // Get event details
    const { data: event } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (!event) throw new Error("Event not found");

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('event_bookings')
      .insert({
        event_id: eventId,
        user_id: userId,
        quantity: parseInt(quantity),
        total_amount: session.amount_total,
        stripe_payment_intent_id: session.payment_intent,
        payment_status: 'paid',
        signature_data: signatureData,
        has_accepted_safety: true,
        attendee_name: attendeeName,
        attendee_email: attendeeEmail,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Update tickets sold
    await supabaseClient
      .from('events')
      .update({ tickets_sold: event.tickets_sold + parseInt(quantity) })
      .eq('id', eventId);

    // Send confirmation email to customer
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    await resend.emails.send({
      from: "March Russell <onboarding@resend.dev>",
      to: [attendeeEmail],
      subject: `Your ticket(s) for ${event.title}`,
      html: `
        <h1>Ticket Confirmation</h1>
        <p>Hi ${attendeeName},</p>
        <p>Thank you for booking ${quantity} ticket(s) for <strong>${event.title}</strong>.</p>
        <h2>Event Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${event.event_time}</li>
          <li><strong>Location:</strong> ${event.address}</li>
          <li><strong>Teacher:</strong> ${event.teacher_name}</li>
        </ul>
        <p>See you there!</p>
      `,
    });

    // Send notification to admin
    await resend.emails.send({
      from: "March Russell <onboarding@resend.dev>",
      to: ["march@marchrussell.com"],
      subject: `New Ticket Sale: ${event.title}`,
      html: `
        <h1>New Ticket Sale!</h1>
        <p><strong>${attendeeName}</strong> just purchased ${quantity} ticket(s) for <strong>${event.title}</strong>.</p>
        <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
        <p><strong>Tickets Sold:</strong> ${event.tickets_sold + parseInt(quantity)} / ${event.total_tickets}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, booking }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
