import 'server-only';

import Stripe from 'stripe';

export type StripeCheckoutPlan = 'pro_monthly' | 'pro_quarterly' | 'pro_yearly';

export const STRIPE_CHECKOUT_PLANS: StripeCheckoutPlan[] = ['pro_monthly', 'pro_quarterly', 'pro_yearly'];

const planPriceEnvNames: Record<StripeCheckoutPlan, string> = {
  pro_monthly: 'STRIPE_PRICE_PRO_MONTHLY',
  pro_quarterly: 'STRIPE_PRICE_PRO_QUARTERLY',
  pro_yearly: 'STRIPE_PRICE_PRO_YEARLY'
};

export type StripeConfigStatus = {
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasProMonthlyPrice: boolean;
  hasProQuarterlyPrice: boolean;
  hasProYearlyPrice: boolean;
  hasSiteUrl: boolean;
  checkoutConfigured: boolean;
  webhookConfigured: boolean;
};

let stripeClient: Stripe | null = null;

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function isStripeCheckoutPlan(value: unknown): value is StripeCheckoutPlan {
  return typeof value === 'string' && STRIPE_CHECKOUT_PLANS.includes(value as StripeCheckoutPlan);
}

export function getStripePriceIdForPlan(plan: StripeCheckoutPlan): string | null {
  const priceId = process.env[planPriceEnvNames[plan]]?.trim();
  return priceId && priceId.length > 0 ? priceId : null;
}

export function getStripePlanForPriceId(priceId: string | null | undefined): StripeCheckoutPlan | null {
  if (!priceId) return null;
  const normalizedPriceId = priceId.trim();
  for (const plan of STRIPE_CHECKOUT_PLANS) {
    if (getStripePriceIdForPlan(plan) === normalizedPriceId) return plan;
  }
  return null;
}

export function getStripeConfigStatus(): StripeConfigStatus {
  const hasSecretKey = hasValue(process.env.STRIPE_SECRET_KEY);
  const hasWebhookSecret = hasValue(process.env.STRIPE_WEBHOOK_SECRET);
  const hasProMonthlyPrice = hasValue(process.env.STRIPE_PRICE_PRO_MONTHLY);
  const hasProQuarterlyPrice = hasValue(process.env.STRIPE_PRICE_PRO_QUARTERLY);
  const hasProYearlyPrice = hasValue(process.env.STRIPE_PRICE_PRO_YEARLY);
  const hasSiteUrl = hasValue(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    hasSecretKey,
    hasWebhookSecret,
    hasProMonthlyPrice,
    hasProQuarterlyPrice,
    hasProYearlyPrice,
    hasSiteUrl,
    checkoutConfigured: hasSecretKey && hasProMonthlyPrice && hasProQuarterlyPrice && hasProYearlyPrice && hasSiteUrl,
    webhookConfigured: hasWebhookSecret
  };
}

export function getStripeServerClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}
