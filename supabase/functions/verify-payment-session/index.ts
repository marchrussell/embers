import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Log immediately on function start
  console.log("[VERIFY-PAYMENT] === Function invoked ===");
  
  if (req.method === "OPTIONS") {
    console.log("[VERIFY-PAYMENT] OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - POST request received");

    let sessionId;
    try {
      const body = await req.json();
      sessionId = body.sessionId;
      logStep("Request body parsed", { sessionId, hasSessionId: !!sessionId });
    } catch (parseError) {
      logStep("ERROR: Failed to parse request body", { error: parseError });
      throw new Error("Invalid request body");
    }

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil",
      timeout: 10000, // 10 second timeout for Stripe API calls
    });
    logStep("Stripe client created with 10s timeout");

    // Initialize Supabase admin client for server-side user validation
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    logStep("Initialized Supabase admin client");

    // Retrieve the checkout session with expanded customer details with timeout
    logStep("Calling Stripe to retrieve session...");
    const sessionPromise = stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer']
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Stripe API timeout after 10 seconds")), 10000)
    );
    
    const session = await Promise.race([sessionPromise, timeoutPromise]) as any;
    logStep("Session retrieved", {
      status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      email: session.customer_details?.email,
      mode: session.mode,
      clientReferenceId: session.client_reference_id
    });

    // SERVER-SIDE VALIDATION: Get email from Stripe session (no client auth needed)
    const customerEmail = session.customer_details?.email || 
                         (typeof session.customer === 'object' ? session.customer.email : null);
    
    if (!customerEmail) {
      logStep("ERROR: No email found in session");
      return new Response(JSON.stringify({
        verified: false,
        error: "No customer email found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Customer email extracted from Stripe", { email: customerEmail });

    // Check if subscription is present and active (for subscription mode)
    let hasActiveSubscription = false;
    let subscriptionStatus = null;
    
    if (session.mode === "subscription" && session.subscription) {
      try {
        logStep("Retrieving subscription details...");
        const subPromise = stripe.subscriptions.retrieve(
          typeof session.subscription === "string" ? session.subscription : session.subscription.id
        );
        const subTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Subscription retrieval timeout")), 10000)
        );
        
        const subscription = await Promise.race([subPromise, subTimeout]) as any;
        subscriptionStatus = subscription.status;
        hasActiveSubscription = subscription.status === "active" || subscription.status === "trialing";
        logStep("Subscription status checked", { 
          status: subscriptionStatus,
          hasActive: hasActiveSubscription 
        });
      } catch (subError) {
        logStep("Error checking subscription", { error: subError });
      }
    }

    // Verify payment was successful
    const verified = session.payment_status === "paid" || hasActiveSubscription;
    
    if (!verified) {
      logStep("Payment not completed", { 
        paymentStatus: session.payment_status,
        subscriptionStatus 
      });
      return new Response(JSON.stringify({
        verified: false,
        error: "Payment not completed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Payment verified successfully (server-side - no client auth required)", { 
      email: customerEmail,
      hasSubscription: hasActiveSubscription
    });

    // CRITICAL: Save subscription data to database IMMEDIATELY
    // This makes users appear in admin dashboard right after payment, before account creation
    if (hasActiveSubscription && session.subscription) {
      try {
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        
        // Fetch full subscription details
        const subscription = await stripe.subscriptions.retrieve(
          typeof session.subscription === "string" ? session.subscription : session.subscription.id
        );
        logStep("Fetched subscription details", { subscriptionId: subscription.id });

        // Save to pending_subscriptions table so admin can see them immediately
        const upsertData: any = {
          email: customerEmail,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0].price.id,
          stripe_session_id: sessionId,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        };

        // Only add dates if they exist
        if (subscription.current_period_start) {
          upsertData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
        }
        if (subscription.current_period_end) {
          upsertData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        const { error: pendingError } = await supabaseAdmin
          .from("pending_subscriptions")
          .upsert(upsertData, { onConflict: 'email' });

        if (pendingError) {
          logStep("Failed to save pending subscription", { error: pendingError });
        } else {
          logStep("Successfully saved pending subscription", { email: customerEmail });
        }
      } catch (saveError) {
        logStep("Error saving subscription data", { error: saveError });
        // Don't fail the request, just log the error
      }
    }
    
    return new Response(JSON.stringify({
      verified: true,
      customer_email: customerEmail,
      customer_id: typeof session.customer === 'string' ? session.customer : session.customer.id,
      subscription_id: session.subscription,
      has_active_subscription: hasActiveSubscription,
      subscription_status: subscriptionStatus,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    logStep("ERROR in verify-payment-session", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
