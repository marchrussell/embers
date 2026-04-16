import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://esm.sh/zod@3.25.76";

import * as templates from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const EMAIL_TYPES = [
  "payment_confirmation",
  "setup_reminder_day1",
  "final_reminder_day3",
  "final_notice_day7",
  "welcome",
  "usage_nudge",
  "check_in",
  "payment_failed",
  "retry_reminder",
  "payment_final_notice",
  "cancellation_confirmation",
  "winback",
  "refund_confirmation",
  "plan_change",
  "support_acknowledgement",
] as const;

const sendEmailSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  firstName: z.string().min(1, "First name is required"),
  emailType: z.enum(EMAIL_TYPES, { message: "Unknown email type" }),
  data: z.record(z.unknown()).optional(),
});

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

    const body = await req.json();
    const parseResult = sendEmailSchema.safeParse(body);

    if (!parseResult.success) {
      logStep("ERROR: Invalid request body", { errors: parseResult.error.flatten().fieldErrors });
      return new Response(
        JSON.stringify({ error: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, firstName, emailType, data = {} } = parseResult.data;
    logStep("Request received", { to, firstName, emailType });

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

    // Render the email template
    const html = config.template(data);

    logStep("Email template rendered", { emailType });

    // Send email via Resend
    const { error: sendError } = await resend.emails.send({
      from: "Embers Studio <march@embersstudio.io>",
      to: [to],
      subject: config.subject,
      html,
      reply_to: "march@embersstudio.io",
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