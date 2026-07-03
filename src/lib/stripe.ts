import 'server-only';

export type StripeConfigStatus = {
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasProMonthlyPrice: boolean;
  hasSiteUrl: boolean;
  checkoutConfigured: boolean;
  webhookConfigured: boolean;
};

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function getStripeConfigStatus(): StripeConfigStatus {
  const hasSecretKey = hasValue(process.env.STRIPE_SECRET_KEY);
  const hasWebhookSecret = hasValue(process.env.STRIPE_WEBHOOK_SECRET);
  const hasProMonthlyPrice = hasValue(process.env.STRIPE_PRICE_PRO_MONTHLY);
  const hasSiteUrl = hasValue(process.env.NEXT_PUBLIC_SITE_URL);

  return {
    hasSecretKey,
    hasWebhookSecret,
    hasProMonthlyPrice,
    hasSiteUrl,
    checkoutConfigured: hasSecretKey && hasProMonthlyPrice && hasSiteUrl,
    webhookConfigured: hasWebhookSecret
  };
}
