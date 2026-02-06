import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Extract JWT token from Authorization header
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    // Pass the JWT token directly to getUser
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    // Handle invalid/expired tokens gracefully - return unsubscribed state
    if (userError || !user) {
      logStep("Invalid or expired token", { error: userError?.message });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    if (!user.email) {
      logStep("User email not available");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Supabase admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if there's a pending subscription for this email and migrate it
    const { data: pendingSub } = await supabaseAdmin
      .from("pending_subscriptions")
      .select("*")
      .eq("email", user.email)
      .maybeSingle();
    
    if (pendingSub) {
      logStep("Found pending subscription, migrating to user account", { email: user.email });
      
      // Move to user_subscriptions
      const { error: migrateError } = await supabaseAdmin
        .from("user_subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: pendingSub.stripe_customer_id,
          stripe_subscription_id: pendingSub.stripe_subscription_id,
          stripe_price_id: pendingSub.stripe_price_id,
          status: pendingSub.status,
          current_period_start: pendingSub.current_period_start,
          current_period_end: pendingSub.current_period_end,
          cancel_at_period_end: pendingSub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (migrateError) {
        logStep("Failed to migrate pending subscription", { error: migrateError.message });
      } else {
        // Delete from pending_subscriptions
        await supabaseAdmin
          .from("pending_subscriptions")
          .delete()
          .eq("email", user.email);
        
        logStep("Successfully migrated pending subscription to user account");
        
        // Return immediately since we just migrated the data
        return new Response(JSON.stringify({
          subscribed: true,
          product_id: pendingSub.stripe_price_id,
          subscription_end: pendingSub.current_period_end
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active, trialing, and past_due subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "trialing",
      limit: 1,
    });
    
    // Also check for past_due subscriptions (grace period)
    const pastDueSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "past_due",
      limit: 1,
    });

    const hasActiveSub = activeSubscriptions.data.length > 0 || 
                         trialingSubscriptions.data.length > 0 ||
                         pastDueSubscriptions.data.length > 0;
    
    // Get the subscription from whichever list has data
    const subscription = activeSubscriptions.data[0] || 
                        trialingSubscriptions.data[0] || 
                        pastDueSubscriptions.data[0];
    
    let productId = null;
    let subscriptionEnd = null;
    let subscriptionStatus = null;

    if (hasActiveSub && subscription) {
      subscriptionStatus = subscription.status;
      
      if (subscription.current_period_end) {
        subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Subscription found", { 
          subscriptionId: subscription.id, 
          status: subscription.status,
          endDate: subscriptionEnd 
        });
      } else {
        logStep("Subscription found without end date", { 
          subscriptionId: subscription.id,
          status: subscription.status 
        });
      }
      productId = subscription.items.data[0].price.product;
      logStep("Determined subscription tier", { productId });
      
      // Persist subscription data to database using service role key for write access
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      // Prepare upsert data with safe date conversions
      const upsertData: any = {
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      };
      
      // Only add dates if they exist
      if (subscription.current_period_start) {
        upsertData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString();
      }
      if (subscription.current_period_end) {
        upsertData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
      }
      
      const { error: upsertError } = await supabaseAdmin
        .from("user_subscriptions")
        .upsert(upsertData, {
          onConflict: 'user_id'
        });
      
      if (upsertError) {
        logStep("Failed to persist subscription to database", { error: upsertError.message });
      } else {
        logStep("Successfully persisted subscription to database");
      }
    } else {
      logStep("No active subscription found");
      
      // Update database to reflect no active subscription
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const { error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      
      if (updateError) {
        logStep("Failed to update canceled status", { error: updateError.message });
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      subscription_status: subscriptionStatus
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
