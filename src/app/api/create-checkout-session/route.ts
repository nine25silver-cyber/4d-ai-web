import {NextResponse} from 'next/server';
import {getStripeConfigStatus} from '@/lib/stripe';

export async function POST() {
  const config = getStripeConfigStatus();

  if (!config.checkoutConfigured) {
    return NextResponse.json(
      {
        error: 'checkout_not_configured',
        message: 'Stripe Checkout is not configured for this environment.',
        config: {
          hasSecretKey: config.hasSecretKey,
          hasProMonthlyPrice: config.hasProMonthlyPrice,
          hasSiteUrl: config.hasSiteUrl
        }
      },
      {status: 503, headers: {'Cache-Control': 'no-store'}}
    );
  }

  // TODO Phase 1B: verify the current Supabase user before creating a test-mode Checkout Session.
  // TODO Phase 1B: call Stripe only when test-mode env is complete and explicitly enabled.
  return NextResponse.json(
    {
      error: 'checkout_skeleton_only',
      message: 'Stripe Checkout skeleton is present, but session creation is disabled for Phase 1A.'
    },
    {status: 501, headers: {'Cache-Control': 'no-store'}}
  );
}
