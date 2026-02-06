import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { newsletterEmail } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface SendNewsletterRequest {
  subject: string;
  content: string;
  preheader?: string;
  testEmail?: string; // Optional: send to test email instead of all subscribers
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-NEWSLETTER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("active", true)
      .single();

    if (!roles) {
      throw new Error("User is not an admin");
    }

    logStep("Admin verified", { userId: user.id });

    const { subject, content, preheader, testEmail }: SendNewsletterRequest = await req.json();
    
    if (!subject || !content) {
      throw new Error("Missing required fields: subject, content");
    }

    logStep("Request validated", { subject, isTest: !!testEmail });

    // Get active subscribers
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("active", true);

    if (subError) {
      throw new Error(`Failed to fetch subscribers: ${subError.message}`);
    }

    logStep("Subscribers fetched", { count: subscribers?.length || 0 });

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No active subscribers found",
          sent: 0 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate HTML email
    const htmlContent = newsletterEmail(subject, content, preheader);

    // If test email is provided, only send to that address
    const recipients = testEmail 
      ? [{ email: testEmail, name: "Test" }] 
      : subscribers;

    logStep("Sending emails", { recipientCount: recipients.length });

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const sendPromises = batch.map(async (recipient) => {
        try {
          const { error } = await resend.emails.send({
            from: "March <onboarding@resend.dev>",
            to: [recipient.email],
            subject: subject,
            html: htmlContent,
          });

          if (error) {
            throw error;
          }
          sentCount++;
        } catch (error: any) {
          failedCount++;
          errors.push(`${recipient.email}: ${error.message}`);
          console.error(`Failed to send to ${recipient.email}:`, error);
        }
      });

      await Promise.all(sendPromises);

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logStep("Emails sent", { sentCount, failedCount });

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: testEmail 
          ? `Test email sent to ${testEmail}`
          : `Newsletter sent to ${sentCount} subscribers${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: error.message === "Unauthorized" || error.message === "User is not an admin" ? 403 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
