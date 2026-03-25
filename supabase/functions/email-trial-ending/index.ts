import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { fireLoopsEvent } from "../_shared/loops.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-TRIAL-ENDING] ${step}${detailsStr}`);
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

    const now = new Date();
    // Target: trials ending in 2–3 days from now
    const windowStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    logStep("Checking for trials ending soon", {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    });

    // Find trialing subscriptions with trial ending in the window
    const { data: trialingSubs, error: fetchError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, current_period_end")
      .eq("status", "trialing")
      .gte("current_period_end", windowStart.toISOString())
      .lte("current_period_end", windowEnd.toISOString());

    if (fetchError) {
      logStep("Error fetching trialing subscriptions", { error: fetchError.message });
      throw fetchError;
    }

    logStep("Found trialing subscriptions in window", { count: trialingSubs?.length ?? 0 });

    let fired = 0;
    let skipped = 0;

    for (const sub of trialingSubs ?? []) {
      // Check if we already fired this event for this user
      const { data: existing } = await supabaseAdmin
        .from("email_tracking")
        .select("id")
        .eq("user_id", sub.user_id)
        .eq("email_type", "trial_ending")
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Get user email
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", sub.user_id)
        .maybeSingle();

      if (!profile?.email) {
        logStep("No email for user", { userId: sub.user_id });
        continue;
      }

      await fireLoopsEvent(profile.email, "trialEnding", {
        trialEndsAt: sub.current_period_end,
      });

      // Record in email_tracking to prevent re-firing
      await supabaseAdmin.from("email_tracking").insert({
        user_id: sub.user_id,
        email: profile.email,
        email_type: "trial_ending",
        sequence_step: 1,
        last_sent_at: now.toISOString(),
        completed: true,
      });

      fired++;
      logStep("trialEnding event fired", { email: profile.email });
    }

    logStep("Run complete", { fired, skipped });

    return new Response(JSON.stringify({ fired, skipped }), {
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
