// supabase/functions/get-prices/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Price IDs must be duplicated here since Edge Functions can't import from src/
// Keep in sync with src/lib/stripePrices.ts
const PRICE_IDS = {
  // Test mode
  test: {
    embers: {
      annual: 'price_1TAr6X2M0UKIRm2M8me1ayrP',
      monthly: 'price_1TAr6p2M0UKIRm2MPQzZQp0b',
    },
  },
  // Live mode
  live: {
    embers: {
      annual: 'price_1TA9Tr2N5TUgC2sKTHGanZgb',
      monthly: 'price_1TA9Tr2N5TUgC2sKtnlCgeGj',
    },
  },
};

// Helper to format currency
function formatCurrency(amount: number | null, currency: string): string {
  if (amount === null) return '';
  
  const symbols: Record<string, string> = {
    gbp: '£',
    usd: '$',
    eur: '€',
  };
  
  const symbol = symbols[currency.toLowerCase()] || currency.toUpperCase() + ' ';
  return `${symbol}${(amount / 100).toFixed(2)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    // Detect test/live mode from the key prefix
    const isTestMode = stripeKey.startsWith('sk_test_');
    console.log(`[get-prices] Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Parse request body for optional filtering
    let category = 'embers'; // Default to subscription prices
    try {
      const body = await req.json();
      if (body.category) {
        category = body.category;
      }
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Get the appropriate price IDs based on mode
    const modeConfig = isTestMode ? PRICE_IDS.test : PRICE_IDS.live;
    const priceIds = modeConfig[category as keyof typeof modeConfig];

    if (!priceIds) {
      throw new Error(`Unknown category: ${category}. Available: ${Object.keys(modeConfig).join(', ')}`);
    }

    // Fetch each price from Stripe
    const priceIdList = Object.values(priceIds) as string[];
    const pricePromises = priceIdList.map(id => 
      stripe.prices.retrieve(id, { expand: ['product'] })
    );
    
    const prices = await Promise.all(pricePromises);

    // Format the response with useful fields
    const formattedPrices = prices.map((price: Stripe.Price) => {
      const product = price.product as Stripe.Product;
      
      return {
        id: price.id,
        // Raw amount in smallest currency unit (e.g., pence)
        unitAmount: price.unit_amount,
        // Display-ready formatted amount (e.g., "£29.00")
        unitAmountFormatted: formatCurrency(price.unit_amount, price.currency),
        currency: price.currency,
        // Subscription details (null for one-time prices)
        interval: price.recurring?.interval || null,
        intervalCount: price.recurring?.interval_count || null,
        // Type: 'recurring' for subscriptions, 'one_time' for purchases
        type: price.type,
        // Product info
        productId: product?.id || null,
        productName: product?.name || null,
        productDescription: product?.description || null,
        // Useful metadata
        nickname: price.nickname,
        active: price.active,
        // For annual plans, calculate monthly equivalent
        monthlyEquivalent: price.recurring?.interval === 'year' 
          ? formatCurrency(Math.round((price.unit_amount || 0) / 12), price.currency)
          : null,
      };
    });

    // Create a keyed response for easier frontend usage
    const priceKeys = Object.keys(priceIds);
    const keyedPrices: Record<string, typeof formattedPrices[0]> = {};
    priceKeys.forEach((key, index) => {
      keyedPrices[key] = formattedPrices[index];
    });

    return new Response(JSON.stringify({ 
      mode: isTestMode ? 'test' : 'live',
      category,
      prices: keyedPrices,
      // Also include as array for convenience
      pricesList: formattedPrices,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('[get-prices] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
