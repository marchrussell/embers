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

    // Find users whose last activity falls in the inactivity window
    // user_progress tracks session completions — use max(completed_at) per user
    const { data: recentActivity, error: activityError } = await supabaseAdmin
      .from("user_progress")
      .select("user_id, completed_at")
      .in("user_id", userIds)
      .gte("completed_at", inactiveFrom.toISOString())
      .lte("completed_at", inactiveTo.toISOString());

    if (activityError) {
      logStep("Error fetching user progress", { error: activityError.message });
      throw activityError;
    }

    // Also find users with NO activity at all who joined 10–14 days ago
    const { data: noActivityUsers, error: noActivityError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_id, current_period_start")
      .in("status", ["active", "trialing"])
      .gte("current_period_start", inactiveFrom.toISOString())
      .lte("current_period_start", inactiveTo.toISOString());

    if (noActivityError) {
      logStep("Error fetching no-activity users", { error: noActivityError.message });
    }

    // Combine: users with last activity in window + users with no activity who joined in window
    const activityUserIds = new Set((recentActivity ?? []).map((r) => r.user_id));
    const noActivityUserIds = (noActivityUsers ?? [])
      .filter((u) => !activityUserIds.has(u.user_id))
      .map((u) => u.user_id);

    // Check which users haven't had activity since the window (last activity is in window range)
    // We need users whose LATEST activity falls in the window
    const userLastActivity: Record<string, string> = {};
    for (const row of recentActivity ?? []) {
      const current = userLastActivity[row.user_id];
      if (!current || row.completed_at > current) {
        userLastActivity[row.user_id] = row.completed_at;
      }
    }

    const inactiveUserIds = [
      ...Object.keys(userLastActivity),
      ...noActivityUserIds,
    ];

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
