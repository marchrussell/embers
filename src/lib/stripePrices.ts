/**
 * Stripe Price IDs & Payment Links - Central reference for all products
 * Updated: March 2026
 *
 * EMBERS (Subscriptions)
 * - Annual: price_1TA9Tr2N5TUgC2sKTHGanZgb
 * - Monthly: price_1TA9Tr2N5TUgC2sKtnlCgeGj
 *
 */

export const isTestMode = import.meta.env.VITE_STRIPE_MODE === "test";

// Test mode price IDs
export const TEST_SUBSCRIPTION_PRICES = {
  ANNUAL: "price_1TAr6X2M0UKIRm2M8me1ayrP",
  MONTHLY: "price_1TAr6p2M0UKIRm2MPQzZQp0b",
} as const;

// Live mode price IDs
export const LIVE_SUBSCRIPTION_PRICES = {
  ANNUAL: "price_1TA9Tr2N5TUgC2sKTHGanZgb",
  MONTHLY: "price_1TA9Tr2N5TUgC2sKtnlCgeGj",
} as const;

export const SUBSCRIPTION_PRICES = isTestMode ? TEST_SUBSCRIPTION_PRICES : LIVE_SUBSCRIPTION_PRICES;

export const RISE_ARC_PRICES = "";

export const SUBSCRIPTION_DISPLAY_PRICES = {
  monthly: { unitAmountFormatted: "£25" },
  annual: { unitAmountFormatted: "£180", monthlyEquivalent: "£15" },
} as const;

export const SUBSCRIPTION_BENEFITS = [
  "Unlimited access to the full Embers practice library",
  "Breathwork, meditation, and nervous system regulation",
  "Short daily resets and deeper guided sessions",
  "Weekly live sessions and guest workshops",
  "7-day free trial — cancel anytime",
] as const;
