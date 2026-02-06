import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-ONBOARDING] ${step}${detailsStr}`);
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

    // Get users who completed onboarding and check their email tracking
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, created_at")
      .eq("has_completed_onboarding", true);

    if (fetchError) throw fetchError;

    logStep("Found profiles with completed onboarding", { count: profiles?.length || 0 });

    for (const profile of profiles || []) {
      const createdAt = new Date(profile.created_at);
      const daysSinceOnboarding = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Check if email tracking exists
      const { data: existingTracking } = await supabaseAdmin
        .from("email_tracking")
        .select("*")
        .eq("user_id", profile.id)
        .eq("email_type", "onboarding_complete")
        .single();

      logStep("Processing profile", { 
        email: profile.email, 
        daysSinceOnboarding,
        hasTracking: !!existingTracking
      });

      // Determine which email to send
      let emailType = '';
      let sequenceStep = 1;
      const loginUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app")}/app`;
      const quickTipsUrl = `${loginUrl}?show=quick-tips`;
      const perfectBreathUrl = `${loginUrl}/library?session=perfect-breath`;

      if (daysSinceOnboarding === 0 && !existingTracking) {
        emailType = 'welcome';
        sequenceStep = 1;
      } else if (daysSinceOnboarding >= 3 && daysSinceOnboarding <= 5 && (!existingTracking || existingTracking.sequence_step < 2)) {
        emailType = 'usage_nudge';
        sequenceStep = 2;
      } else if (daysSinceOnboarding >= 14 && (!existingTracking || existingTracking.sequence_step < 3)) {
        emailType = 'check_in';
        sequenceStep = 3;
      }

      if (emailType) {
        // Call send-email function
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: profile.email,
            firstName: profile.first_name || profile.email.split("@")[0],
            emailType,
            data: { 
              loginUrl,
              quickTipsUrl,
              perfectBreathUrl
            }
          }),
        });

        // Update or create tracking
        if (existingTracking) {
          await supabaseAdmin
            .from("email_tracking")
            .update({
              sequence_step: sequenceStep,
              last_sent_at: now.toISOString(),
              next_send_at: sequenceStep < 3 ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
              completed: sequenceStep === 3,
              updated_at: now.toISOString(),
            })
            .eq("id", existingTracking.id);
        } else {
          await supabaseAdmin
            .from("email_tracking")
            .insert({
              user_id: profile.id,
              email: profile.email,
              email_type: "onboarding_complete",
              sequence_step: sequenceStep,
              last_sent_at: now.toISOString(),
              next_send_at: sequenceStep < 3 ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
              completed: sequenceStep === 3,
            });
        }

        logStep("Email sent and tracked", { email: profile.email, emailType, sequenceStep });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: profiles?.length || 0
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