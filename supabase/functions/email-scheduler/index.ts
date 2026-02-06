import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-SCHEDULER] ${step}${detailsStr}`);
};

/**
 * Email Scheduler - Orchestrates all email automation flows
 * Should be called via cron job (e.g., every hour or daily)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Email scheduler started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Call all email automation functions
    const results = {
      postPaymentSetup: { success: false, error: null as string | null },
      onboardingComplete: { success: false, error: null as string | null },
      failedPayment: { success: false, error: null as string | null },
    };

    // 1. Post-payment setup emails
    try {
      logStep("Triggering post-payment setup emails");
      const response = await fetch(`${supabaseUrl}/functions/v1/email-post-payment-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
      });
      const data = await response.json();
      results.postPaymentSetup = { success: response.ok, error: data.error || null };
      logStep("Post-payment setup result", results.postPaymentSetup);
    } catch (error) {
      results.postPaymentSetup = { success: false, error: String(error) };
    }

    // 2. Onboarding complete emails
    try {
      logStep("Triggering onboarding complete emails");
      const response = await fetch(`${supabaseUrl}/functions/v1/email-onboarding-complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
      });
      const data = await response.json();
      results.onboardingComplete = { success: response.ok, error: data.error || null };
      logStep("Onboarding complete result", results.onboardingComplete);
    } catch (error) {
      results.onboardingComplete = { success: false, error: String(error) };
    }

    // 3. Failed payment emails
    try {
      logStep("Triggering failed payment emails");
      const response = await fetch(`${supabaseUrl}/functions/v1/email-failed-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
      });
      const data = await response.json();
      results.failedPayment = { success: response.ok, error: data.error || null };
      logStep("Failed payment result", results.failedPayment);
    } catch (error) {
      results.failedPayment = { success: false, error: String(error) };
    }

    logStep("Email scheduler completed", results);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      timestamp: new Date().toISOString()
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