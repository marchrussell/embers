import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

import { fireLoopsEvent, upsertLoopsContact } from "../_shared/loops.ts";
import {
  eventBookingAdminNotificationEmail,
  eventBookingConfirmationEmail,
  generateICalContent,
  ICalEventDetails,
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

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

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different webhook events
    switch (event.type) {
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", {
          customerId: invoice.customer,
          invoiceId: invoice.id,
          attemptCount: invoice.attempt_count,
        });

        // Update subscription status — Stripe dunning handles payment failure emails natively
        const { error: updateError } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer as string);

        if (updateError) {
          logStep("Error updating subscription status", { error: updateError });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const previousStatus = (event.data.previous_attributes as { status?: string })?.status;
        logStep("Subscription updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
          previousStatus,
          customerId: subscription.customer,
        });

        // Update subscription in database
        const { error: updateError } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          logStep("Error updating subscription", { error: updateError });
        }

        // Update Loops contact status when trial converts to active
        if (subscription.status === "active" && previousStatus === "trialing") {
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          if (customer.email) {
            await upsertLoopsContact(customer.email, { subscriptionStatus: "active" });
            logStep("Loops contact updated: trial converted to active", { email: customer.email });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // Update subscription in database
        const { error: deleteError } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (deleteError) {
          logStep("Error updating canceled subscription", { error: deleteError });
        }

        // Fire Loops subscriptionCanceled event (triggers cancellation + win-back sequence)
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        if (customer.email) {
          await upsertLoopsContact(customer.email, {
            subscriptionStatus: "canceled",
            canceledAt: new Date().toISOString(),
          });
          await fireLoopsEvent(customer.email, "subscriptionCanceled");
          logStep("Loops subscriptionCanceled event fired", { email: customer.email });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", {
          customerId: invoice.customer,
          invoiceId: invoice.id,
        });

        // Update subscription status to active
        const { error: updateError } = await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", invoice.customer as string);

        if (updateError) {
          logStep("Error updating subscription status", { error: updateError });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          mode: session.mode,
          paymentStatus: session.payment_status,
        });

        // Backup write: save subscription data to pending_subscriptions
        // This fires before the user creates their account, ensuring the data is
        // preserved even if the user closes the browser before /payment-success loads.
        // verify-payment-session also writes here in the normal flow; this is a fallback.
        if (session.mode === "subscription" && session.subscription && session.customer_email) {
          try {
            const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";
            const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);

            const upsertData: Record<string, unknown> = {
              email: session.customer_email,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              stripe_session_id: session.id,
              status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            };

            if (subscription.current_period_start) {
              upsertData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
            }
            if (subscription.current_period_end) {
              upsertData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
            }

            const { error: pendingError } = await supabaseClient
              .from("pending_subscriptions")
              .upsert(upsertData, { onConflict: "email" });

            if (pendingError) {
              logStep("Error saving pending subscription", { error: pendingError });
            } else {
              logStep("Pending subscription saved via webhook", { email: session.customer_email });

              // Create Loops contact and fire paymentCompleted — covers both normal
              // flow and fallback (user closes browser before /payment-success loads)
              const trialEndsAt = upsertData.current_period_end as string | undefined;
              await upsertLoopsContact(session.customer_email, {
                subscriptionStatus: "pending_setup",
                pendingSetup: true,
                ...(trialEndsAt ? { trialEndsAt } : {}),
              });
              await fireLoopsEvent(session.customer_email, "paymentCompleted");
              logStep("Loops contact created and paymentCompleted event fired");
            }
          } catch (err) {
            logStep("Error processing subscription checkout", { error: err instanceof Error ? err.message : String(err) });
          }
        } else if (session.metadata?.type === 'event_booking' && session.payment_status === 'paid') {
          const {
            eventType,
            eventDate,
            eventDisplayDate,
            eventTime,
            eventLocation,
            userId,
            quantity,
            attendeeName,
            attendeeEmail,
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
                from: "Embers Studio <march@embersstudio.io>",
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
                from: "Embers Studio <march@embersstudio.io>",
                to: ["support@embersstudio.io"],
                subject: `New Booking: ${eventTitle} — ${attendeeName}`,
                html: adminEmailHtml,
              });
              logStep("Admin notification sent");
            }

            if (attendeeEmail) {
              await upsertLoopsContact(attendeeEmail, {
                lastEventBookedAt: new Date().toISOString(),
              });
              await fireLoopsEvent(attendeeEmail, "eventBookingCompleted", {
                eventTitle,
                eventDate: eventDisplayDate,
                quantity: parseInt(quantity),
              });
              logStep("Loops eventBookingCompleted event fired");
            }
          }
        }
        break;
      }

      default:
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
