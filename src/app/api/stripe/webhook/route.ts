import {NextResponse} from 'next/server';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import Stripe from 'stripe';
import {getStripeConfigStatus, getStripeServerClient} from '@/lib/stripe';

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
      current_period_end?: number | null;
      price?: {
        id?: string | null;
      } | null;
    }>;
  };
};

type SupabaseRestConfig = {
  url: string;
  serviceRoleKey: string;
};

type SupabaseRestResult<T> =
  | {ok: true; data: T; status: number}
  | {ok: false; status: number; bodyText: string; bodyJson: unknown};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});
}

function hasValue(value: string | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function getCloudflareEnvValue(name: string): string | undefined {
  try {
    const {env} = getCloudflareContext();
    const value = (env as Record<string, unknown>)[name];
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function getRuntimeEnvValue(name: string): string | undefined {
  const cloudflareValue = getCloudflareEnvValue(name);
  if (hasValue(cloudflareValue)) {
    return cloudflareValue;
  }
  return process.env[name];
}

function getRuntimeEnvValueFrom(names: string[]): string | undefined {
  for (const name of names) {
    const cloudflareValue = getCloudflareEnvValue(name);
    if (hasValue(cloudflareValue)) {
      return cloudflareValue;
    }
  }

  for (const name of names) {
    const processValue = process.env[name];
    if (hasValue(processValue)) {
      return processValue;
    }
  }

  return undefined;
}

function getSupabaseRestConfig(): SupabaseRestConfig | null {
  const url = getRuntimeEnvValue('NEXT_PUBLIC_SUPABASE_URL')?.trim();
  const serviceRoleKey = getRuntimeEnvValueFrom([
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ADMIN_SERVICE_ROLE_KEY'
  ])?.trim();
  if (!hasValue(url) || !hasValue(serviceRoleKey)) {
    return null;
  }
  return {url: url!.replace(/\/+$/, ''), serviceRoleKey: serviceRoleKey!};
}

function serviceRoleKeyLengthCategory(value: string | undefined): 'missing' | 'short' | 'jwt_like' | 'long' {
  if (!hasValue(value)) return 'missing';
  if (value!.length < 40) return 'short';
  if (value!.startsWith('ey') && value!.split('.').length >= 3) return 'jwt_like';
  return 'long';
}

function supabaseHeaders(config: SupabaseRestConfig, prefer?: string): HeadersInit {
  return {
    Authorization: `Bearer ${config.serviceRoleKey}`,
    apikey: config.serviceRoleKey,
    'Content-Type': 'application/json',
    ...(prefer ? {Prefer: prefer} : {})
  };
}

function supabaseRestPath(table: string, params?: Record<string, string>): string {
  const searchParams = params ? new URLSearchParams(params) : null;
  const query = searchParams?.toString();
  return `/rest/v1/${table}${query ? `?${query}` : ''}`;
}

function supabaseRestUrl(config: SupabaseRestConfig, path: string): string {
  const normalizedPath = path.startsWith('/rest/v1/') ? path : `/rest/v1/${path.replace(/^\/+/, '')}`;
  return `${config.url}${normalizedPath}`;
}

function postgrestEq(value: string): string {
  return `eq.${value}`;
}

function supabaseUrlDebugShape(config: SupabaseRestConfig, path: string) {
  let originOnlyShape = false;
  let finalUrlContainsDoubleSlashAfterHost = false;
  const finalUrl = supabaseRestUrl(config, path);

  try {
    const url = new URL(config.url);
    originOnlyShape = url.pathname === '/' && !url.search && !url.hash;
    const finalUrlObject = new URL(finalUrl);
    finalUrlContainsDoubleSlashAfterHost = finalUrlObject.pathname.includes('//');
  } catch {
    originOnlyShape = false;
    finalUrlContainsDoubleSlashAfterHost = false;
  }

  return {
    supabaseUrlPresent: Boolean(config.url),
    supabaseUrlStartsWithHttps: config.url.startsWith('https://'),
    supabaseUrlContainsRestV1: config.url.includes('/rest/v1'),
    supabaseUrlEndsWithSlash: config.url.endsWith('/'),
    supabaseUrlOriginOnlyShape: originOnlyShape,
    sanitizedPath: path,
    finalUrlContainsDoubleRestV1: finalUrl.includes('/rest/v1/rest/v1/'),
    finalUrlContainsDoubleSlashAfterHost
  };
}

async function parseSupabaseRestResponse<T>(response: Response): Promise<SupabaseRestResult<T>> {
  const bodyText = await response.text();
  let bodyJson: unknown = null;
  if (bodyText) {
    try {
      bodyJson = JSON.parse(bodyText) as unknown;
    } catch {
      bodyJson = null;
    }
  }
  if (!response.ok) {
    return {ok: false, status: response.status, bodyText, bodyJson};
  }
  return {ok: true, status: response.status, data: bodyJson as T};
}

async function supabaseAnonLookupDebug(config: SupabaseRestConfig, path: string): Promise<Record<string, unknown>> {
  const anonKey = getRuntimeEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY')?.trim();
  const serviceRoleKey = config.serviceRoleKey;
  const debug: Record<string, unknown> = {
    serviceRoleKeyPresent: hasValue(serviceRoleKey),
    serviceRoleKeyStartsWithEy: serviceRoleKey.startsWith('ey'),
    serviceRoleKeyContainsWhitespace: /\s/.test(serviceRoleKey),
    serviceRoleKeyLengthCategory: serviceRoleKeyLengthCategory(serviceRoleKey),
    anonKeyPresent: hasValue(anonKey),
    anonLookupStatus: null,
    anonLookupResponseText: '',
    serviceLookupStatus: null,
    serviceLookupResponseText: '',
    sanitizedPath: path
  };

  if (!hasValue(anonKey)) {
    return debug;
  }

  try {
    const response = await fetch(supabaseRestUrl(config, path), {
      method: 'GET',
      headers: {
        apikey: anonKey!,
        Authorization: `Bearer ${anonKey!}`,
        Accept: 'application/json'
      }
    });
    debug.anonLookupStatus = response.status;
    debug.anonLookupResponseText = await response.text();
  } catch (error) {
    debug.anonLookupStatus = 0;
    debug.anonLookupResponseText = error instanceof Error ? error.message : 'unknown';
  }

  return debug;
}

async function supabaseRestRequest<T>(
  config: SupabaseRestConfig,
  path: string,
  init: RequestInit,
  operation: string,
  context: ReturnType<typeof safeLogContext>
): Promise<SupabaseRestResult<T>> {
  try {
    const response = await fetch(supabaseRestUrl(config, path), {
      ...init,
      headers: {
        ...supabaseHeaders(config),
        ...(init.headers ?? {})
      }
    });
    return await parseSupabaseRestResponse<T>(response);
  } catch (error) {
    console.error('Supabase REST request failed.', {
      ...context,
      operation,
      errorName: error instanceof Error ? error.name : 'unknown',
      errorMessage: error instanceof Error ? error.message : ''
    });
    return {ok: false, status: 0, bodyText: '', bodyJson: null};
  }
}

function logSupabaseRestError(operation: string, result: SupabaseRestResult<unknown>, context: ReturnType<typeof safeLogContext>) {
  if (result.ok) return;
  console.error('Supabase REST operation failed.', {
    ...context,
    operation,
    status: result.status,
    responseText: result.bodyText,
    responseJson: result.bodyJson
  });
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

function getSubscriptionPeriodEndUnix(subscription: StripeSubscriptionRest): number | null | undefined {
  return subscription.current_period_end ?? subscription.items.data[0]?.current_period_end;
}

function getSubscriptionPeriodEnd(subscription: StripeSubscriptionRest): string | null {
  return unixSecondsToIso(getSubscriptionPeriodEndUnix(subscription));
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

  const logContext = safeLogContext(event, session, supabaseUserId, subscriptionId);
  const supabase = getSupabaseRestConfig();
  if (!supabase) {
    console.error('Supabase REST admin config is not configured for Stripe webhook writes.', logContext);
    return jsonResponse({error: 'supabase_admin_not_configured', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const purchaseLookupPath = supabaseRestPath('purchase_records', {
    select: 'id',
    provider: postgrestEq('stripe'),
    transaction_id: postgrestEq(session.id),
    limit: '1'
  });
  const existingPurchaseResult = await supabaseRestRequest<PurchaseRecordRow[]>(
    supabase,
    purchaseLookupPath,
    {method: 'GET'},
    'purchase_records_lookup',
    logContext
  );

  if (!existingPurchaseResult.ok) {
    const urlDebugShape = supabaseUrlDebugShape(supabase, purchaseLookupPath);
    const anonLookupDebug =
      existingPurchaseResult.status === 400
        ? await supabaseAnonLookupDebug(supabase, purchaseLookupPath)
        : {};
    const purchaseLookupDebug = {
      ...urlDebugShape,
      ...anonLookupDebug,
      serviceLookupStatus: existingPurchaseResult.status,
      serviceLookupResponseText: existingPurchaseResult.bodyText
    };
    logSupabaseRestError('purchase_records_lookup', existingPurchaseResult, {
      ...logContext,
      ...purchaseLookupDebug
    });
    return jsonResponse(
      {
        error: 'purchase_record_lookup_failed',
        eventId: event.id,
        checkoutSessionId: session.id,
        operation: 'purchase_records_lookup',
        path: purchaseLookupPath,
        ...purchaseLookupDebug,
        status: existingPurchaseResult.status,
        responseText: existingPurchaseResult.bodyText,
        responseJson: existingPurchaseResult.bodyJson
      },
      500
    );
  }

  const purchaseAlreadyRecorded = Boolean(existingPurchaseResult.data?.[0]);
  if (!purchaseAlreadyRecorded) {
    const insertPurchaseResult = await supabaseRestRequest<null>(
      supabase,
      supabaseRestPath('purchase_records'),
      {
        method: 'POST',
        headers: supabaseHeaders(supabase, 'return=minimal'),
        body: JSON.stringify({
          provider: 'stripe',
          user_id: supabaseUserId,
          product_id: subscriptionPriceId,
          plan_key: 'pro_monthly',
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
              current_period_end: getSubscriptionPeriodEndUnix(subscription),
              price_id: subscriptionPriceId
            },
            plan_key: 'pro_monthly'
          }
        })
      },
      'purchase_records_insert',
      logContext
    );

    if (!insertPurchaseResult.ok) {
      logSupabaseRestError('purchase_records_insert', insertPurchaseResult, logContext);
      return jsonResponse({error: 'purchase_record_insert_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
    }
  }

  const entitlementLookupResult = await supabaseRestRequest<UserEntitlementRow[]>(
    supabase,
    supabaseRestPath('user_entitlements', {
      select: 'id,premium_expires_at',
      user_id: postgrestEq(supabaseUserId),
      limit: '1'
    }),
    {method: 'GET'},
    'user_entitlements_lookup',
    logContext
  );

  if (!entitlementLookupResult.ok) {
    logSupabaseRestError('user_entitlements_lookup', entitlementLookupResult, logContext);
    return jsonResponse({error: 'entitlement_lookup_failed', eventId: event.id, checkoutSessionId: session.id}, 500);
  }

  const existingEntitlement = entitlementLookupResult.data?.[0] ?? null;
  const entitlementExpiresAt = laterTimestamp(existingEntitlement?.premium_expires_at, premiumExpiresAt);
  const entitlementPayload = {
    user_id: supabaseUserId,
    platform: 'web',
    is_premium: true,
    premium_expires_at: entitlementExpiresAt,
    updated_at: new Date().toISOString()
  };

  const entitlementResult = existingEntitlement
    ? await supabaseRestRequest<null>(
        supabase,
        supabaseRestPath('user_entitlements', {
          id: postgrestEq(existingEntitlement.id)
        }),
        {
          method: 'PATCH',
          headers: supabaseHeaders(supabase, 'return=minimal'),
          body: JSON.stringify(entitlementPayload)
        },
        'user_entitlements_update',
        logContext
      )
    : await supabaseRestRequest<null>(
        supabase,
        supabaseRestPath('user_entitlements'),
        {
          method: 'POST',
          headers: supabaseHeaders(supabase, 'return=minimal'),
          body: JSON.stringify(entitlementPayload)
        },
        'user_entitlements_insert',
        logContext
      );

  if (!entitlementResult.ok) {
    logSupabaseRestError(existingEntitlement ? 'user_entitlements_update' : 'user_entitlements_insert', entitlementResult, logContext);
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
