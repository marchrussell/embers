import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { upsertLoopsContact, fireLoopsEvent } from "../_shared/loops.ts";

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

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

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
            }
          } catch (err) {
            logStep("Error processing subscription checkout", { error: err instanceof Error ? err.message : String(err) });
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
