import {NextResponse} from 'next/server';
import {getStripeConfigStatus} from '@/lib/stripe';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const config = getStripeConfigStatus();

  if (!config.webhookConfigured) {
    return NextResponse.json(
      {
        error: 'stripe_webhook_not_configured',
        message: 'Stripe webhook handling is not configured for this environment.',
        receivedBodyBytes: rawBody.length
      },
      {status: 503, headers: {'Cache-Control': 'no-store'}}
    );
  }

  const signature = request.headers.get('stripe-signature');

  // TODO Phase 1B: verify rawBody with the Stripe webhook signing secret and stripe-signature.
  // TODO Phase 1B: handle checkout.session.completed without writing Supabase from the browser.
  // TODO Phase 1B: handle customer.subscription.updated with an idempotent server-side entitlement update.
  // TODO Phase 1B: handle customer.subscription.deleted with an idempotent server-side entitlement update.
  return NextResponse.json(
    {
      error: 'webhook_skeleton_only',
      message: 'Stripe webhook skeleton is present, but event processing is disabled for Phase 1A.',
      hasSignature: Boolean(signature),
      receivedBodyBytes: rawBody.length
    },
    {status: 501, headers: {'Cache-Control': 'no-store'}}
  );
}
