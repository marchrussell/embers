import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import * as templates from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendEmailRequest {
  to: string;
  firstName: string;
  emailType: string;
  data?: Record<string, any>;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { to, firstName, emailType, data = {} }: SendEmailRequest = await req.json();
    logStep("Request received", { to, firstName, emailType });

    if (!to || !firstName || !emailType) {
      throw new Error("Missing required fields: to, firstName, emailType");
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Define email subjects and template mapping
    const emailConfig: Record<string, { subject: string; template: (data: any) => string }> = {
      // Post-payment setup
      'payment_confirmation': {
        subject: "You're in! Let's get your account set up",
        template: (d) => templates.paymentConfirmationEmail(firstName, d.setupUrl)
      },
      'setup_reminder_day1': {
        subject: "Finish setting up your account",
        template: (d) => templates.setupReminderDay1Email(firstName, d.setupUrl)
      },
      'final_reminder_day3': {
        subject: "Don't miss out on your subscription",
        template: (d) => templates.finalReminderDay3Email(firstName, d.setupUrl)
      },
      'final_notice_day7': {
        subject: "Your subscription will be cancelled soon",
        template: (d) => templates.finalNoticeDay7Email(firstName, d.setupUrl)
      },
      
      // Onboarding complete
      'welcome': {
        subject: "You're all set",
        template: (d) => templates.welcomeEmail(firstName, d.loginUrl, d.quickTipsUrl)
      },
      'usage_nudge': {
        subject: "A few ideas to get started",
        template: (d) => templates.usageNudgeEmail(firstName, d.loginUrl, d.perfectBreathUrl)
      },
      'check_in': {
        subject: "How's everything going?",
        template: (d) => templates.checkInEmail(firstName)
      },
      
      // Failed payment
      'payment_failed': {
        subject: "There was a problem with your payment",
        template: (d) => templates.paymentFailedEmail(firstName, d.updatePaymentUrl)
      },
      'retry_reminder': {
        subject: "Please update your payment details",
        template: (d) => templates.retryReminderEmail(firstName, d.updatePaymentUrl)
      },
      'payment_final_notice': {
        subject: "Your subscription will be paused",
        template: (d) => templates.paymentFinalNoticeEmail(firstName, d.updatePaymentUrl)
      },
      
      // Cancellation
      'cancellation_confirmation': {
        subject: "Your subscription has been cancelled",
        template: (d) => templates.cancellationConfirmationEmail(firstName, d.restartUrl)
      },
      'winback': {
        subject: "I'd love to have you back",
        template: (d) => templates.winBackEmail(firstName, d.restartUrl)
      },
      
      // Transactional
      'refund_confirmation': {
        subject: "Your refund has been processed",
        template: (d) => templates.refundConfirmationEmail(firstName, d.amount)
      },
      'plan_change': {
        subject: "Your subscription has been updated",
        template: (d) => templates.planChangeEmail(firstName, d.planName, d.nextPaymentDate, d.manageUrl)
      },
      'support_acknowledgement': {
        subject: "Thanks for your message",
        template: (d) => templates.supportAcknowledgementEmail(firstName)
      },
    };

    const config = emailConfig[emailType];
    if (!config) {
      throw new Error(`Unknown email type: ${emailType}`);
    }

    // Render the email template
    const html = config.template(data);

    logStep("Email template rendered", { emailType });

    // Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: "March <hello@marchrussell.com>",
      to: [to],
      subject: config.subject,
      html,
      reply_to: "hello@marchrussell.com",
    });

    if (sendError) {
      throw sendError;
    }

    logStep("Email sent successfully", { to, emailType });

    return new Response(JSON.stringify({ 
      success: true,
      emailType,
      sentTo: to
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