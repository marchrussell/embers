import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
          attemptCount: invoice.attempt_count
        });

        // Get customer email
        const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
        
        if (customer.email && resend) {
          // Send payment failure email
          const emailResult = await resend.emails.send({
            from: "Embers Studio <march@embersstudio.io>",
            to: [customer.email],
            subject: "Payment Failed - Please Update Your Payment Details",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #dc2626;">Payment Failed</h1>
                <p>Hi there,</p>
                <p>We were unable to process your payment for your Embers Studio subscription.</p>
                <p><strong>Attempt ${invoice.attempt_count} of 4</strong></p>
                <p>To continue enjoying your subscription, please update your payment details as soon as possible.</p>
                <p style="margin: 30px 0;">
                  <a href="https://marchrussell.com/app/profile"
                     style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Update Payment Details
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  If you have any questions, please don't hesitate to reach out to us.
                </p>
                <p style="color: #666; font-size: 14px;">
                  Best regards,<br>
                  The Embers Studio Team
                </p>
              </div>
            `,
          });
          logStep("Payment failure email sent", { result: emailResult });
        }

        // Update subscription status in database
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
        logStep("Subscription updated", { 
          subscriptionId: subscription.id,
          status: subscription.status,
          customerId: subscription.customer
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

        // Send email for specific status changes
        if (subscription.status === "past_due" || subscription.status === "unpaid") {
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          
          if (customer.email && resend) {
            await resend.emails.send({
              from: "Embers Studio <march@embersstudio.io>",
              to: [customer.email],
              subject: "Action Required: Subscription Payment Issue",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #dc2626;">Subscription Payment Issue</h1>
                  <p>Hi there,</p>
                  <p>Your Embers Studio subscription payment is ${subscription.status}.</p>
                  <p>Please update your payment details to avoid interruption of service.</p>
                  <p style="margin: 30px 0;">
                    <a href="https://marchrussell.com/app/profile"
                       style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Update Payment Details
                    </a>
                  </p>
                  <p style="color: #666; font-size: 14px;">
                    Best regards,<br>
                    The Embers Studio Team
                  </p>
                </div>
              `,
            });
            logStep("Subscription status email sent");
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { 
          subscriptionId: subscription.id,
          customerId: subscription.customer
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

        // Send cancellation email
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        
        if (customer.email && resend) {
          await resend.emails.send({
            from: "Embers Studio <march@embersstudio.io>",
            to: [customer.email],
            subject: "Your Embers Studio Subscription Has Been Canceled",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Subscription Canceled</h1>
                <p>Hi there,</p>
                <p>Your Embers Studio subscription has been canceled due to payment issues.</p>
                <p>We're sorry to see you go! If this was unintentional, you can resubscribe at any time.</p>
                <p style="margin: 30px 0;">
                  <a href="https://marchrussell.com/app/profile"
                     style="background-color: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Resubscribe Now
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">
                  If you have any questions, please reach out to us.
                </p>
                <p style="color: #666; font-size: 14px;">
                  Best regards,<br>
                  The Embers Studio Team
                </p>
              </div>
            `,
          });
          logStep("Cancellation email sent");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment succeeded", { 
          customerId: invoice.customer,
          invoiceId: invoice.id
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
          paymentStatus: session.payment_status,
          metadata: session.metadata
        });

        // Handle course purchase
        if (session.metadata?.type === 'course_purchase' && session.metadata?.user_id && session.metadata?.course_id) {
          const userId = session.metadata.user_id;
          const courseId = session.metadata.course_id;
          
          logStep("Processing course purchase", { userId, courseId });

          // Create course purchase record
          const { error: purchaseError } = await supabaseClient
            .from("user_course_purchases")
            .upsert({
              user_id: userId,
              course_id: courseId,
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              status: 'active',
              purchased_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,course_id'
            });

          if (purchaseError) {
            logStep("Error creating course purchase", { error: purchaseError });
          } else {
            logStep("Course purchase created successfully");

            // Send confirmation email
            if (session.customer_details?.email && resend) {
              // Get course details
              const { data: courseData } = await supabaseClient
                .from("courses")
                .select("title")
                .eq("id", courseId)
                .single();

              await resend.emails.send({
                from: "Embers Studio <march@embersstudio.io>",
                to: [session.customer_details.email],
                subject: `Welcome to ${courseData?.title || 'Your Course'}!`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #333;">You're In! 🎉</h1>
                    <p>Hi there,</p>
                    <p>Thank you for purchasing <strong>${courseData?.title || 'your course'}</strong>.</p>
                    <p>You now have lifetime access to all the course content.</p>
                    <p style="margin: 30px 0;">
                      <a href="https://marchrussell.com/courses" 
                         style="background-color: #9F542C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; display: inline-block;">
                        Start Learning Now
                      </a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                      If you have any questions, please don't hesitate to reach out.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                      Best regards,<br>
                      Embers Studio
                    </p>
                  </div>
                `,
              });
              logStep("Course purchase confirmation email sent");
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
