import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import Stripe from "https://esm.sh/stripe@18.5.0";
import {
  eventBookingAdminNotificationEmail,
  eventBookingConfirmationEmail,
  generateICalContent,
  ICalEventDetails
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-EVENT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_EVENTS_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_EVENTS_WEBHOOK_SECRET");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) throw new Error("STRIPE_EVENTS_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_EVENTS_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const resend = resendKey ? new Resend(resendKey) : null;

    // Verify webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Checkout session completed", {
        sessionId: session.id,
        paymentStatus: session.payment_status,
        metadata: session.metadata
      });

      if (session.metadata?.type === 'event_booking' && session.payment_status === 'paid') {
        const {
          eventType,
          eventDate,
          eventDisplayDate,
          eventTime,
          eventLocation,
          userId,
          quantity,
          signatureData,
          attendeeName,
          attendeeEmail
        } = session.metadata;

        logStep("Processing event booking", { eventType, eventDate, userId });

        const eventTitle = eventType
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        const { data: booking, error: bookingError } = await supabaseClient
          .from('event_bookings')
          .insert({
            user_id: userId,
            event_type: eventType,
            event_date: eventDate,
            quantity: parseInt(quantity),
            total_amount: session.amount_total || 0,
            stripe_payment_intent_id: session.payment_intent as string,
            payment_status: 'paid',
            signature_data: signatureData,
            has_accepted_safety: true,
            attendee_name: attendeeName,
            attendee_email: attendeeEmail,
          })
          .select()
          .single();

        if (bookingError) {
          logStep("Error creating event booking", { error: bookingError });
        } else {
          logStep("Event booking created", { bookingId: booking.id });

          if (attendeeEmail && resend) {
            const [year, month, day] = eventDate.split('-').map(Number);
            const [hours, minutes] = eventTime.split(':').map(Number);

            const startDate = new Date(year, month - 1, day, hours, minutes, 0);
            const duration = eventType.includes('breath-presence') ? 90 : 60;
            const endDate = new Date(startDate.getTime() + duration * 60000);

            const location = eventLocation || (eventType.includes('online') ? 'Online (Zoom link will be sent)' : 'AUFI, 20 Eastcastle St, London W1W 8DB');

            const icalDetails: ICalEventDetails = {
              title: eventTitle,
              description: `Join Embers Studio for ${eventTitle}.\n\nBooking confirmed for ${quantity} ${parseInt(quantity) === 1 ? 'person' : 'people'}.\n\nLocation: ${location}`,
              location,
              startDate,
              endDate,
              organizerName: 'Embers Studio',
              organizerEmail: 'support@embersstudio.io',
            };

            const icalContent = generateICalContent(icalDetails);
            const icalBase64 = btoa(icalContent);

            const emailHtml = eventBookingConfirmationEmail(attendeeName, {
              eventTitle,
              eventDate: eventDisplayDate,
              eventTime,
              location,
              quantity: parseInt(quantity),
              totalAmount: session.amount_total || 0,
            });

            await resend.emails.send({
              from: "Embers Studio <hello@embersstudio.io>",
              to: [attendeeEmail],
              subject: `Booking Confirmed: ${eventTitle}`,
              html: emailHtml,
              attachments: [
                {
                  filename: `${eventType}-${eventDate}.ics`,
                  content: icalBase64,
                },
              ],
            });
            logStep("Event confirmation email with calendar sent");
          }

          if (resend) {
            const adminEmailHtml = eventBookingAdminNotificationEmail({
              attendeeName,
              attendeeEmail,
              eventTitle,
              eventDate: eventDisplayDate,
              eventTime,
              quantity: parseInt(quantity),
              totalAmount: session.amount_total || 0,
              paymentId: session.payment_intent as string,
            });

            await resend.emails.send({
              from: "Embers Studio <hello@embersstudio.io>",
              to: ["support@embersstudio.io"],
              subject: `New Booking: ${eventTitle} — ${attendeeName}`,
              html: adminEmailHtml,
            });
            logStep("Admin notification sent");
          }
        }
      }
    } else {
      logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
