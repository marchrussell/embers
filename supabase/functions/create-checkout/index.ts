import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "https://esm.sh/zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createCheckoutSchema = z.object({
  priceId: z.string().startsWith("price_", "Invalid price ID format"),
  couponCode: z.string().optional(),
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

    const { priceId, couponCode, mode } = parseResult.data;
    logStep("Request body parsed", { priceId, couponCode, mode });

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
    logStep("Creating checkout session", { priceId, origin, hasCoupon: !!couponCode });
    
    // Build checkout session params - NO AUTH REQUIRED for new signups
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
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    };

    if (checkoutMode === 'subscription') {
      sessionParams.subscription_data = { trial_period_days: 7 };
    }

    // Add coupon if provided
    if (couponCode) {
      try {
        logStep("Attempting to find promotion code (case-insensitive)", { code: couponCode });
        
        // Retrieve ALL active promotion codes and search case-insensitively
        const allPromoCodes = await stripe.promotionCodes.list({
          active: true,
          limit: 100, // Get up to 100 codes to search through
        });

        logStep("Retrieved promotion codes", { 
          total: allPromoCodes.data.length,
          searchingFor: couponCode
        });

        // Find the code with case-insensitive matching
        const matchingCode = allPromoCodes.data.find(
          (pc: any) => pc.code.toLowerCase() === couponCode.toLowerCase()
        );

        if (matchingCode) {
          sessionParams.discounts = [{
            promotion_code: matchingCode.id,
          }];
          logStep("Promotion code applied successfully", { 
            inputCode: couponCode,
            matchedCode: matchingCode.code,
            promoCodeId: matchingCode.id,
            couponId: matchingCode.coupon
          });
        } else {
          logStep("No promotion code found", { 
            searchedCode: couponCode,
            availableCodes: allPromoCodes.data.map((pc: any) => pc.code)
          });
          throw new Error("The discount code you entered is not valid or has expired. Please check the code and try again.");
        }
      } catch (couponError: any) {
        logStep("Error applying coupon", { error: couponError.message, stack: couponError.stack });
        if (couponError.message.includes("not valid")) {
          throw couponError;
        }
        throw new Error("Unable to apply discount code. Please try again or proceed without a discount.");
      }
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
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
