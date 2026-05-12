import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://esm.sh/zod@3.25.76";

import { captureException } from "../_shared/sentry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createCheckoutSchema = z.object({
  priceId: z.string().startsWith("price_", "Invalid price ID format"),
  mode: z.enum(["payment", "subscription"]).default("subscription"),
});

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const body = await req.json();
    const parseResult = createCheckoutSchema.safeParse(body);

    if (!parseResult.success) {
      logStep("ERROR: Invalid request body", { errors: parseResult.error.flatten().fieldErrors });
      return new Response(
        JSON.stringify({ error: parseResult.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { priceId, mode } = parseResult.data;
    logStep("Request body parsed", { priceId, mode });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: No Stripe key");
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    logStep("Stripe key found");

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil"
    });
    logStep("Stripe client created");

    const origin = req.headers.get("origin") || "http://localhost:3000";
    logStep("Creating checkout session", { priceId, origin });

    const checkoutMode = mode;
    logStep("Checkout mode determined", { usingMode: checkoutMode });

    const sessionParams: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: checkoutMode,
      allow_promotion_codes: true,
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    };

    if (checkoutMode === 'subscription') {
      sessionParams.subscription_data = { trial_period_days: 7 };
    }
    
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    logStep("ERROR in create-checkout", { message: errorMessage });
    await captureException(error, { function: "create-checkout" });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
