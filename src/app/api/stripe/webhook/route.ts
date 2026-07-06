import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {getStripeConfigStatus, getStripeServerClient} from '@/lib/stripe';
import {getSupabaseAdminClient} from '@/lib/supabase/admin';

type PurchaseRecordRow = {
  id: string;
};

type UserEntitlementRow = {
  id: string;
  premium_expires_at: string | null;
};

type StripeSubscriptionRest = {
  id: string;
  status: string;
  current_period_end?: number | null;
  items: {
    data: Array<{
      price?: {
        id?: string | null;
      } | null;
    }>;
  };
};

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

function safeLogContext(event: Stripe.Event, session?: Stripe.Checkout.Session, userId?: string | null, subscriptionId?: string | null) {
  return {
    eventId: event.id,
    type: event.type,
    checkoutSessionId: session?.id,
    userId: userId ?? null,
    subscriptionId: subscriptionId ?? null
  };
}

function unixSecondsToIso(seconds: number | null | undefined): string | null {
  if (!seconds || !Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000).toISOString();
}

function getSubscriptionPeriodEnd(subscription: StripeSubscriptionRest): string | null {
  return unixSecondsToIso(subscription.current_period_end);
}

function getSubscriptionPriceId(subscription: StripeSubscriptionRest): string | null {
  return subscription.items.data[0]?.price?.id ?? null;
}

async function retrieveStripeSubscription(subscriptionId: string, secretKey: string) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`
    }
  });
  const payload = await response.json().catch(() => null) as StripeSubscriptionRest & {error?: {type?: string; code?: string}} | null;
  return {response, payload};
}

function laterTimestamp(current: string | null | undefined, next: string): string {
  if (!current) return next;
  const currentMs = Date.parse(current);
  const nextMs = Date.parse(next);
  if (Number.isNaN(currentMs) || Number.isNaN(nextMs)) return next;
  return currentMs > nextMs ? current : next;
}

async function handleCheckoutSessionCompleted(event: Stripe.Event, session: Stripe.Checkout.Session, stripe: Stripe) {
  const supabaseUserId = metadataUserId(session);
  const customerId = stripeId(session.customer);
  const subscriptionId = stripeId(session.subscription);

  if (!supabaseUserId) {
    console.warn('Stripe checkout completed without Supabase user id.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse(
      {
        received: true,
        eventId: event.id,
        type: event.type,
        checkoutSessionId: session.id,
        writesEnabled: false,
        warning: 'missing_supabase_user_id'
      },
      200
    );
  }

  if (!subscriptionId) {
    console.warn('Stripe checkout completed without subscription id.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse(
      {
        received: true,
        eventId: event.id,
        type: event.type,
        checkoutSessionId: session.id,
        writesEnabled: false,
        warning: 'missing_subscription_id'
      },
      200
    );
  }

  const expectedPriceId = process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
  if (!expectedPriceId) {
    console.error('Stripe checkout webhook missing monthly price configuration.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'stripe_price_not_configured', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeSecretKey) {
    console.error('Stripe checkout webhook missing secret key configuration.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'stripe_secret_not_configured', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  let subscription: StripeSubscriptionRest;
  try {
    const {response, payload} = await retrieveStripeSubscription(subscriptionId, stripeSecretKey);
    if (!response.ok || !payload || payload.error) {
      console.error('Stripe subscription retrieve failed.', {
        ...safeLogContext(event, session, supabaseUserId, subscriptionId),
        status: response.status,
        errorType: payload?.error?.type,
        errorCode: payload?.error?.code
      });
      return jsonResponse({error: 'stripe_subscription_retrieve_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
    }
    subscription = payload;
  } catch (error) {
    console.error('Stripe subscription retrieve request failed.', {
      ...safeLogContext(event, session, supabaseUserId, subscriptionId),
      errorName: error instanceof Error ? error.name : 'unknown'
    });
    return jsonResponse({error: 'stripe_subscription_retrieve_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const subscriptionPriceId = getSubscriptionPriceId(subscription);
  const premiumExpiresAt = getSubscriptionPeriodEnd(subscription);

  if (subscriptionPriceId !== expectedPriceId) {
    console.warn('Stripe checkout completed with unexpected price id.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse(
      {
        received: true,
        eventId: event.id,
        type: event.type,
        checkoutSessionId: session.id,
        writesEnabled: false,
        warning: 'price_mismatch'
      },
      200
    );
  }

  if (!premiumExpiresAt) {
    console.error('Stripe subscription is missing current period end.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'subscription_period_end_missing', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    console.error('Supabase admin client is not configured for Stripe webhook writes.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'supabase_admin_not_configured', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const {data: existingPurchaseRows, error: existingPurchaseError} = await supabase
    .from('purchase_records')
    .select('id')
    .eq('provider', 'stripe')
    .eq('transaction_id', session.id)
    .limit(1)
    .returns<PurchaseRecordRow[]>();

  if (existingPurchaseError) {
    console.error('Unable to check existing Stripe purchase record.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'purchase_record_lookup_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const purchaseAlreadyRecorded = Boolean(existingPurchaseRows?.[0]);
  if (!purchaseAlreadyRecorded) {
    const {error: insertPurchaseError} = await supabase.from('purchase_records').insert({
      provider: 'stripe',
      user_id: supabaseUserId,
      product_id: subscriptionPriceId,
      subscription_id: subscriptionId,
      transaction_id: session.id,
      status: subscription.status,
      verified_at: new Date().toISOString(),
      raw_payload: {
        event: {
          id: event.id,
          type: event.type,
          created: event.created
        },
        checkout_session: {
          id: session.id,
          customer: customerId,
          subscription: subscriptionId,
          client_reference_id: session.client_reference_id,
          metadata: session.metadata
        },
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          price_id: subscriptionPriceId
        },
        plan_key: 'pro_monthly'
      }
    });

    if (insertPurchaseError) {
      console.error('Unable to insert Stripe purchase record.', safeLogContext(event, session, supabaseUserId, subscriptionId));
      return jsonResponse({error: 'purchase_record_insert_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
    }
  }

  const {data: entitlementRows, error: entitlementLookupError} = await supabase
    .from('user_entitlements')
    .select('id,premium_expires_at')
    .eq('user_id', supabaseUserId)
    .limit(1)
    .returns<UserEntitlementRow[]>();

  if (entitlementLookupError) {
    console.error('Unable to look up user entitlement.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'entitlement_lookup_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const existingEntitlement = entitlementRows?.[0] ?? null;
  const entitlementExpiresAt = laterTimestamp(existingEntitlement?.premium_expires_at, premiumExpiresAt);
  const entitlementPayload = {
    user_id: supabaseUserId,
    platform: 'web',
    is_premium: true,
    premium_expires_at: entitlementExpiresAt,
    updated_at: new Date().toISOString()
  };

  const entitlementResult = existingEntitlement
    ? await supabase.from('user_entitlements').update(entitlementPayload).eq('id', existingEntitlement.id)
    : await supabase.from('user_entitlements').insert(entitlementPayload);

  if (entitlementResult.error) {
    console.error('Unable to write user entitlement.', safeLogContext(event, session, supabaseUserId, subscriptionId));
    return jsonResponse({error: 'entitlement_write_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  return jsonResponse(
    {
      received: true,
      eventId: event.id,
      type: event.type,
      checkoutSessionId: session.id,
      hasSupabaseUserId: true,
      hasCustomer: Boolean(customerId),
      hasSubscription: true,
      purchaseAlreadyRecorded,
      entitlementUpdated: true,
      writesEnabled: true
    },
    200
  );
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
    return handleCheckoutSessionCompleted(event, session, stripe);
  }

  // TODO Phase 3: handle customer.subscription.updated with an idempotent server-side entitlement update.
  // TODO Phase 3: handle customer.subscription.deleted with an idempotent server-side entitlement update.
  // TODO Phase 3: handle invoice.payment_failed with an idempotent server-side entitlement update.
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
