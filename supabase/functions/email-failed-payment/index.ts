import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-FAILED-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const now = new Date();

    // Get all active subscriptions
    const { data: subscriptions, error: fetchError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*, profiles(email, first_name)")
      .eq("status", "active");

    if (fetchError) throw fetchError;

    logStep("Found active subscriptions", { count: subscriptions?.length || 0 });

    for (const sub of subscriptions || []) {
      if (!sub.profiles || !sub.stripe_subscription_id) continue;

      // Check Stripe for payment status
      const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
      const latestInvoice = await stripe.invoices.retrieve(stripeSub.latest_invoice as string);

      if (latestInvoice.status === "open" || latestInvoice.status === "uncollectible") {
        logStep("Found failed payment", { 
          email: sub.profiles.email,
          invoiceStatus: latestInvoice.status
        });

        // Check email tracking
        const { data: existingTracking } = await supabaseAdmin
          .from("email_tracking")
          .select("*")
          .eq("user_id", sub.user_id)
          .eq("email_type", "failed_payment")
          .single();

        const createdAt = latestInvoice.created ? new Date(latestInvoice.created * 1000) : now;
        const daysSinceFailure = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        // Determine which email to send
        let emailType = '';
        let sequenceStep = 1;

        if (daysSinceFailure === 0 && !existingTracking) {
          emailType = 'payment_failed';
          sequenceStep = 1;
        } else if (daysSinceFailure >= 3 && (!existingTracking || existingTracking.sequence_step < 2)) {
          emailType = 'retry_reminder';
          sequenceStep = 2;
        } else if (daysSinceFailure >= 7 && (!existingTracking || existingTracking.sequence_step < 3)) {
          emailType = 'payment_final_notice';
          sequenceStep = 3;
        }

        if (emailType) {
          // Call send-email function
          const updatePaymentUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app")}/app/profile?tab=billing`;
          
          await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              to: sub.profiles.email,
              firstName: sub.profiles.first_name || sub.profiles.email.split("@")[0],
              emailType,
              data: { updatePaymentUrl }
            }),
          });

          // Update or create tracking
          if (existingTracking) {
            await supabaseAdmin
              .from("email_tracking")
              .update({
                sequence_step: sequenceStep,
                last_sent_at: now.toISOString(),
                next_send_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                updated_at: now.toISOString(),
              })
              .eq("id", existingTracking.id);
          } else {
            await supabaseAdmin
              .from("email_tracking")
              .insert({
                user_id: sub.user_id,
                email: sub.profiles.email,
                email_type: "failed_payment",
                sequence_step: sequenceStep,
                last_sent_at: now.toISOString(),
                next_send_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                metadata: { invoice_id: latestInvoice.id },
              });
          }

          logStep("Email sent and tracked", { email: sub.profiles.email, emailType, sequenceStep });
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: subscriptions?.length || 0
    }), {
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