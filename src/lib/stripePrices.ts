/**
 * Stripe Price IDs & Payment Links - Central reference for all products
 * Updated: December 2024
 * 
 * COURSES (One-time purchases - using Payment Links for reliability)
 * - Emotional First Aid Kit: £57
 * - Sleep & NSDR Pack: £97
 * - Anxiety Reset: £47
 * 
 * MARCH DAILY (Subscriptions)
 * - Monthly: price_1SaMRuGBlPMRpwZ6M3bbM1H8
 * - Annual: price_1SaMMWGBlPMRpwZ64lDmN0cr
 * 
 * RISE ARC METHOD (One-time purchases)
 * - Self Study: price_1SaOFKGBlPMRpwZ6nmVMG3sD
 * - Group Mentorship: price_1SaOGuGBlPMRpwZ6mcWGn1RZ
 * - 1:1 Mentorship: price_1SaOKbGBlPMRpwZ6d5nEIfPX
 */

// Course Payment Links - Direct Stripe Payment Links for maximum reliability
// These open directly in new tab, no async calls needed
export const COURSE_PAYMENT_LINKS: Record<string, string> = {
  'anxiety-reset': 'https://buy.stripe.com/14A4gz9dweUhaQZbxY1kA0b',
  'breathwork-anxiety-reset': 'https://buy.stripe.com/14A4gz9dweUhaQZbxY1kA0b',
  'emotional-first-aid-kit': 'https://buy.stripe.com/cN2bKhcq8duE7ENeV7', // £57
  'sleep-nsdr-pack': 'https://buy.stripe.com/8wMdSpcq8f2l04l5kx', // £97
};

// Courses - One-time purchases with 12 months access
export const COURSE_PRICES = {
  EMOTIONAL_REGULATION_TOOLKIT: 'price_1Scmc3GBlPMRpwZ6I5x7a4lq',
  SLEEP_NSDR_PACK: 'price_1Scmm1GBlPMRpwZ61IAp4cXj',
  ANXIETY_RESET: 'price_1SaMgHGBlPMRpwZ6bgIvIC6t',
} as const;

// Map course slugs to price IDs for easy lookup
export const COURSE_SLUG_TO_PRICE: Record<string, string> = {
  'emotional-regulation-toolkit': COURSE_PRICES.EMOTIONAL_REGULATION_TOOLKIT,
  'sleep-nsdr-pack': COURSE_PRICES.SLEEP_NSDR_PACK,
  'anxiety-reset': COURSE_PRICES.ANXIETY_RESET,
  'breathwork-anxiety-reset': COURSE_PRICES.ANXIETY_RESET,
};

export const isTestMode = import.meta.env.VITE_STRIPE_MODE === 'test';

// Test mode price IDs
export const TEST_MARCH_DAILY_PRICES = {
  MONTHLY: 'price_1ShXxzGBlPMRpwZ6YwMl04ix',
  ANNUAL: 'price_1ShXyLGBlPMRpwZ6bFwpe7d6',
} as const;

// Live mode price IDs
export const LIVE_MARCH_DAILY_PRICES = {
  MONTHLY: 'price_1SaMRuGBlPMRpwZ6M3bbM1H8',
  ANNUAL: 'price_1SaMMWGBlPMRpwZ64lDmN0cr',
} as const;

export const MARCH_DAILY_PRICES = isTestMode 
  ? TEST_MARCH_DAILY_PRICES 
  : LIVE_MARCH_DAILY_PRICES;

// Rise ARC Method prices
export const RISE_ARC_PRICES = {
  SELF_STUDY: 'price_1SaOFKGBlPMRpwZ6nmVMG3sD',
  GROUP_MENTORSHIP: 'price_1SaOGuGBlPMRpwZ6mcWGn1RZ',
  ONE_ON_ONE_MENTORSHIP: 'price_1SaOKbGBlPMRpwZ6d5nEIfPX',
} as const;

// All prices combined for reference
export const ALL_STRIPE_PRICES = {
  courses: COURSE_PRICES,
  marchDaily: MARCH_DAILY_PRICES,
  riseArc: RISE_ARC_PRICES,
} as const;
