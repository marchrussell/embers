/**
 * Stripe Price IDs & Payment Links - Central reference for all products
 * Updated: May 2026
 *
 * HŌM (Subscriptions)
 * - Annual: price_1TXM0yGBlPMRpwZ6GFmKvfyI
 * - Monthly: price_1TUkIjGBlPMRpwZ6r3dSRw8Y
 */

export const isTestMode = import.meta.env.VITE_STRIPE_MODE === "test";

// Test mode price IDs
export const TEST_SUBSCRIPTION_PRICES = {
  ANNUAL: "price_1TAr6X2M0UKIRm2M8me1ayrP",
  MONTHLY: "price_1TAr6p2M0UKIRm2MPQzZQp0b",
} as const;

// Live mode price IDs
export const LIVE_SUBSCRIPTION_PRICES = {
  ANNUAL: "price_1TXM0yGBlPMRpwZ6GFmKvfyI",
  MONTHLY: "price_1TUkIjGBlPMRpwZ6r3dSRw8Y",
} as const;

export const SUBSCRIPTION_PRICES = isTestMode ? TEST_SUBSCRIPTION_PRICES : LIVE_SUBSCRIPTION_PRICES;

export const RISE_ARC_PRICES = "";

export const SUBSCRIPTION_DISPLAY_PRICES = {
  monthly: { unitAmountFormatted: "£18" },
  annual: { unitAmountFormatted: "£149", monthlyEquivalent: "£12.42" },
} as const;

export const SUBSCRIPTION_BENEFITS = [
  "Access to the full HŌM library",
  "Breathwork, meditation, movement, and sensory practices",
  "Short resets and deeper guided sessions",
  "Weekly live sessions and guest workshops",
] as const;
