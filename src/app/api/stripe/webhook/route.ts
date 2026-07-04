import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {getStripeConfigStatus, getStripeServerClient} from '@/lib/stripe';

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});
}

function stripeId(value: string | {id?: string} | null): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value.id ?? null;
}

function metadataUserId(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.supabase_user_id ?? session.client_reference_id ?? null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const config = getStripeConfigStatus();

  if (!config.webhookConfigured) {
    return jsonResponse(
      {
        error: 'stripe_webhook_not_configured',
        message: 'Stripe webhook handling is not configured for this environment.',
        receivedBodyBytes: rawBody.length
      },
      503
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return jsonResponse({error: 'stripe_signature_missing', message: 'Stripe webhook signature is required.'}, 400);
  }

  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return jsonResponse({error: 'stripe_webhook_not_configured', message: 'Stripe webhook handling is not configured for this environment.'}, 503);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return jsonResponse({error: 'stripe_signature_invalid', message: 'Stripe webhook signature verification failed.'}, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const supabaseUserId = metadataUserId(session);
    const customerId = stripeId(session.customer);
    const subscriptionId = stripeId(session.subscription);

    // TODO Phase 3B: use event.id for idempotency before any database write.
    // TODO Phase 3B: insert or upsert public.purchase_records with session/customer/subscription audit data.
    // TODO Phase 3B: update public.user_entitlements only after the subscription state and period are verified.
    return jsonResponse(
      {
        received: true,
        eventId: event.id,
        type: event.type,
        checkoutSessionId: session.id,
        hasSupabaseUserId: Boolean(supabaseUserId),
        hasCustomer: Boolean(customerId),
        hasSubscription: Boolean(subscriptionId),
        writesEnabled: false
      },
      200
    );
  }

  // TODO Phase 3B: handle customer.subscription.updated with an idempotent server-side entitlement update.
  // TODO Phase 3B: handle customer.subscription.deleted with an idempotent server-side entitlement update.
  return jsonResponse(
    {
      received: true,
      eventId: event.id,
      type: event.type,
      ignored: true
    },
    200
  );
}
