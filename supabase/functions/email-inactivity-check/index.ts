import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

import { fireLoopsEvent } from "../_shared/loops.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-INACTIVITY] ${step}${detailsStr}`);
};

// Fire inactivity event if user has had no activity for 10–14 days
const INACTIVITY_MIN_DAYS = 10;
const INACTIVITY_MAX_DAYS = 14;

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
    const inactiveFrom = new Date(now.getTime() - INACTIVITY_MAX_DAYS * 24 * 60 * 60 * 1000);
    const inactiveTo = new Date(now.getTime() - INACTIVITY_MIN_DAYS * 24 * 60 * 60 * 1000);

    logStep("Checking for inactive users", {
      lastActiveBefore: inactiveTo.toISOString(),
      lastActiveAfter: inactiveFrom.toISOString(),
    });

    // Get active/trialing subscribers
    const { data: activeSubs, error: subsError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id")
      .in("status", ["active", "trialing"]);

    if (subsError) {
      logStep("Error fetching subscriptions", { error: subsError.message });
      throw subsError;
    }

    const userIds = (activeSubs ?? []).map((s) => s.user_id);
    logStep("Active/trialing subscribers", { count: userIds.length });

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ fired: 0, skipped: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const tenDaysAgo = new Date(now.getTime() - INACTIVITY_MIN_DAYS * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - INACTIVITY_MAX_DAYS * 24 * 60 * 60 * 1000);

    // Step 1: Users with ANY activity in the last 10 days — these are not inactive
    const { data: recentlyActive } = await supabaseAdmin
      .from("user_progress")
      .select("user_id")
      .in("user_id", userIds)
      .gte("completed_at", tenDaysAgo.toISOString());

    const recentlyActiveIds = new Set((recentlyActive ?? []).map((r: { user_id: string }) => r.user_id));

    // Step 2: Users who had a session 10–14 days ago, but none since
    const { data: hadActivity, error: activityError } = await supabaseAdmin
      .from("user_progress")
      .select("user_id")
      .in("user_id", userIds)
      .gte("completed_at", fourteenDaysAgo.toISOString())
      .lt("completed_at", tenDaysAgo.toISOString());

    if (activityError) {
      logStep("Error fetching user progress", { error: activityError.message });
      throw activityError;
    }

    const inactiveWithHistory = ([...new Set((hadActivity ?? []).map((r: { user_id: string }) => r.user_id))] as string[])
      .filter((id) => !recentlyActiveIds.has(id));

    // Step 3: Users who joined 10–14 days ago with no activity in the last 10 days
    const { data: noActivityUsers, error: noActivityError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id")
      .in("status", ["active", "trialing"])
      .in("user_id", userIds)
      .gte("current_period_start", fourteenDaysAgo.toISOString())
      .lt("current_period_start", tenDaysAgo.toISOString());

    if (noActivityError) {
      logStep("Error fetching no-activity users", { error: noActivityError.message });
    }

    const neverActiveIds = (noActivityUsers ?? [])
      .map((u: { user_id: string }) => u.user_id)
      .filter((id: string) => !recentlyActiveIds.has(id));

    const inactiveUserIds = [...new Set([...inactiveWithHistory, ...neverActiveIds])];
    logStep("Inactive users found", { count: inactiveUserIds.length });

    let fired = 0;
    let skipped = 0;

    for (const userId of inactiveUserIds) {
      // Check if we already fired an inactivity event recently (within 7 days)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const { data: existing } = await supabaseAdmin
        .from("email_tracking")
        .select("id")
        .eq("user_id", userId)
        .eq("email_type", "inactivity")
        .gte("last_sent_at", sevenDaysAgo.toISOString())
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Get user email
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.email) {
        logStep("No email for user", { userId });
        continue;
      }

      await fireLoopsEvent(profile.email, "userInactive");

      // Record in email_tracking to prevent re-firing within 7 days
      await supabaseAdmin.from("email_tracking").insert({
        user_id: userId,
        email: profile.email,
        email_type: "inactivity",
        sequence_step: 1,
        last_sent_at: now.toISOString(),
        completed: true,
      });

      fired++;
      logStep("userInactive event fired", { email: profile.email });
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
