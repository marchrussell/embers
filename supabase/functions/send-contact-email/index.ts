import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://esm.sh/zod@3.25.76";

import { newsletterWelcomeEmail } from "../_shared/email-templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Validate API key on startup
if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not configured!");
}

const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const contactEmailSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    message: z.string().min(5).max(5000),
  }),
  z.object({
    type: z.literal("newsletter"),
    name: z.string().min(2).max(100),
    email: z.string().email(),
    message: z.string().optional(),
  }),
]);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is configured
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured. Please contact support." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const body = await req.json();
    const result = contactEmailSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.flatten().fieldErrors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { name, email, type } = result.data;
    console.log(`📧 Processing ${type} email for: ${email}`);

    if (type === "contact") {
      const { message } = result.data;

      // Basic XSS prevention - strip HTML tags
      const sanitizedMessage = message.replace(/<[^>]*>/g, '');
      const sanitizedName = name.replace(/<[^>]*>/g, '');

      // Send contact form message to March
      console.log("📤 Attempting to send contact email via Resend...");
      const contactResponse = await resend.emails.send({
        from: "Embers Studio <march@embersstudio.io>",
        to: ["march@embersstudio.io"],
        replyTo: email,
        subject: `New Contact Form Message from ${sanitizedName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
        `,
      });

      console.log("✅ Contact email sent successfully:", contactResponse);

      return new Response(JSON.stringify(contactResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      // Basic XSS prevention for newsletter
      const sanitizedName = name.replace(/<[^>]*>/g, '');
      const firstName = sanitizedName.split(' ')[0] || sanitizedName;

      // Send newsletter confirmation to subscriber
      console.log("📤 Attempting to send newsletter welcome email via Resend...");
      const newsletterResponse = await resend.emails.send({
        from: "Embers Studio <march@embersstudio.io",
        to: [email],
        subject: "A Warm Welcome",
        html: newsletterWelcomeEmail(firstName),
      });

      console.log("✅ Newsletter confirmation sent successfully:", newsletterResponse);

      return new Response(JSON.stringify(newsletterResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
  } catch (error: any) {
    console.error("❌ Error in send-contact-email function:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send email. Please try again or contact support directly.",
        details: error.name || "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
