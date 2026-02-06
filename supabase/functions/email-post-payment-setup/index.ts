import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EMAIL-POST-PAYMENT] ${step}${detailsStr}`);
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

    // Get pending subscriptions without accounts
    const { data: pendingSubs, error: fetchError } = await supabaseAdmin
      .from("pending_subscriptions")
      .select("*")
      .is("user_id", null);

    if (fetchError) throw fetchError;

    logStep("Found pending subscriptions", { count: pendingSubs?.length || 0 });

    for (const sub of pendingSubs || []) {
      // Check if email tracking exists
      const { data: existingTracking } = await supabaseAdmin
        .from("email_tracking")
        .select("*")
        .eq("email", sub.email)
        .eq("email_type", "post_payment_setup")
        .single();

      const now = new Date();
      const createdAt = new Date(sub.created_at);
      const daysSincePayment = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      logStep("Processing subscription", { 
        email: sub.email, 
        daysSincePayment,
        hasTracking: !!existingTracking
      });

      // Determine which email to send based on days since payment
      let emailType = '';
      let sequenceStep = 1;

      if (daysSincePayment === 0 && !existingTracking) {
        emailType = 'payment_confirmation';
        sequenceStep = 1;
      } else if (daysSincePayment >= 1 && (!existingTracking || existingTracking.sequence_step < 2)) {
        emailType = 'setup_reminder_day1';
        sequenceStep = 2;
      } else if (daysSincePayment >= 3 && (!existingTracking || existingTracking.sequence_step < 3)) {
        emailType = 'final_reminder_day3';
        sequenceStep = 3;
      } else if (daysSincePayment >= 7 && (!existingTracking || existingTracking.sequence_step < 4)) {
        emailType = 'final_notice_day7';
        sequenceStep = 4;
      }

      if (emailType) {
        // Call send-email function
        const setupUrl = `${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app")}/payment-success?session_id=${sub.stripe_session_id}`;
        
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            to: sub.email,
            firstName: sub.email.split("@")[0], // Use email prefix as fallback
            emailType,
            data: { setupUrl }
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
              email: sub.email,
              email_type: "post_payment_setup",
              sequence_step: sequenceStep,
              last_sent_at: now.toISOString(),
              next_send_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
              metadata: { stripe_session_id: sub.stripe_session_id },
            });
        }

        logStep("Email sent and tracked", { email: sub.email, emailType, sequenceStep });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: pendingSubs?.length || 0
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