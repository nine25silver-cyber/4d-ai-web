import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {getStripeConfigStatus, getStripePriceIdForPlan, isStripeCheckoutPlan, type StripeCheckoutPlan} from '@/lib/stripe';

function jsonResponse(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {status, headers: {'Cache-Control': 'no-store'}});
}

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) return null;
  return token.trim();
}

type CheckoutRequestBody = {
  plan?: unknown;
  successPath?: unknown;
  cancelPath?: unknown;
};

const SUPPORTED_LOCALES = new Set(['en', 'zh', 'ms']);
const STRIPE_CHECKOUT_LOCALES: Record<string, string> = {
  en: 'en',
  zh: 'zh',
  ms: 'ms'
};

function getLocaleFromPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const firstSegment = value.trim().split(/[/?#]/).filter(Boolean)[0];
  return firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? firstSegment : null;
}

function getLocaleFromReferer(request: Request): string | null {
  const referer = request.headers.get('referer');
  if (!referer) return null;

  try {
    return getLocaleFromPath(new URL(referer).pathname);
  } catch {
    return null;
  }
}

function getRequestBodyPath(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  if (lower.includes('http://') || lower.includes('https://')) return fallback;
  return trimmed;
}

async function readCheckoutRequestBody(request: Request): Promise<CheckoutRequestBody> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? body as CheckoutRequestBody : {};
  } catch {
    return {};
  }
}

function getCheckoutOrigin(request: Request): string {
  const requestOrigin = request.headers.get('origin')?.trim();
  if (requestOrigin) return requestOrigin.replace(/\/$/, '');
  return (process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? '').replace(/\/$/, '');
}

function getCheckoutUrl(request: Request, path: string): string {
  return new URL(path, `${getCheckoutOrigin(request)}/`).toString();
}

async function createStripeCheckoutSession(params: {
  priceId: string;
  secretKey: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
  userEmail?: string | null;
  locale?: string | null;
  plan: StripeCheckoutPlan;
}) {
  const body = new URLSearchParams();
  body.set('mode', 'subscription');
  if (params.locale) {
    body.set('locale', params.locale);
  }
  body.set('line_items[0][price]', params.priceId);
  body.set('line_items[0][quantity]', '1');
  body.set('success_url', params.successUrl);
  body.set('cancel_url', params.cancelUrl);
  body.set('client_reference_id', params.userId);
  body.set('metadata[supabase_user_id]', params.userId);
  body.set('metadata[user_id]', params.userId);
  body.set('metadata[plan]', params.plan);
  body.set('subscription_data[metadata][supabase_user_id]', params.userId);
  body.set('subscription_data[metadata][user_id]', params.userId);
  body.set('subscription_data[metadata][plan]', params.plan);

  if (params.userEmail) {
    body.set('customer_email', params.userEmail);
  }

  return fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
}

export async function POST(request: Request) {
  const config = getStripeConfigStatus();
  const body = await readCheckoutRequestBody(request);
  const locale = getLocaleFromPath(body.successPath) ?? getLocaleFromPath(body.cancelPath) ?? getLocaleFromReferer(request);
  const stripeLocale = locale ? STRIPE_CHECKOUT_LOCALES[locale] ?? null : null;
  const defaultSuccessPath = locale ? `/${locale}/account?checkout=success` : '/account?checkout=success';
  const defaultCancelPath = locale ? `/${locale}/pricing` : '/pricing';
  const successPath = getRequestBodyPath(body.successPath, defaultSuccessPath);
  const cancelPath = getRequestBodyPath(body.cancelPath, defaultCancelPath);
  const plan = body.plan;

  if (!isStripeCheckoutPlan(plan)) {
    return jsonResponse({error: 'invalid_plan', message: 'Unsupported checkout plan.'}, 400);
  }

  if (!config.checkoutConfigured) {
    return jsonResponse(
      {
        error: 'checkout_not_configured',
        message: 'Stripe Checkout is not configured for this environment.',
        config: {
          hasSecretKey: config.hasSecretKey,
          hasProMonthlyPrice: config.hasProMonthlyPrice,
          hasProQuarterlyPrice: config.hasProQuarterlyPrice,
          hasProYearlyPrice: config.hasProYearlyPrice,
          hasSiteUrl: config.hasSiteUrl
        }
      },
      503
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse({error: 'supabase_not_configured', message: 'Supabase auth is not configured for this environment.'}, 503);
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return jsonResponse({error: 'not_authenticated', message: 'Login is required before starting Stripe Checkout.'}, 401);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {auth: {persistSession: false}});
  const {data, error} = await supabase.auth.getUser(accessToken);
  const user = data.user;

  if (error || !user) {
    return jsonResponse({error: 'not_authenticated', message: 'Unable to verify the current Supabase user.'}, 401);
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const stripePriceId = getStripePriceIdForPlan(plan);
  if (!stripeSecretKey || !stripePriceId) {
    return jsonResponse({error: 'checkout_not_configured', message: 'Stripe Checkout is not configured for this environment.'}, 503);
  }

  let stripeResponse: Response;
  try {
    stripeResponse = await createStripeCheckoutSession({
      priceId: stripePriceId,
      secretKey: stripeSecretKey,
      successUrl: getCheckoutUrl(request, successPath),
      cancelUrl: getCheckoutUrl(request, cancelPath),
      userId: user.id,
      userEmail: user.email,
      locale: stripeLocale,
      plan
    });
  } catch (error) {
    console.error('Stripe checkout session request failed', {
      errorName: error instanceof Error ? error.name : 'unknown'
    });
    return jsonResponse({error: 'stripe_checkout_failed', message: 'Unable to create Stripe Checkout session.'}, 502);
  }

  const session = await stripeResponse.json().catch(() => null) as {url?: string; error?: {type?: string; code?: string}} | null;

  if (!stripeResponse.ok) {
    console.error('Stripe checkout session creation failed', {
      status: stripeResponse.status,
      errorType: session?.error?.type,
      errorCode: session?.error?.code
    });
    return jsonResponse({error: 'stripe_checkout_failed', message: 'Unable to create Stripe Checkout session.'}, 502);
  }

  if (!session?.url) {
    return jsonResponse({error: 'checkout_session_missing_url', message: 'Stripe Checkout did not return a hosted checkout URL.'}, 502);
  }

  return jsonResponse({url: session.url}, 200);
}
