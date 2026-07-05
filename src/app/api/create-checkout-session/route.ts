import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {getStripeConfigStatus, getStripeServerClient} from '@/lib/stripe';

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
  successPath?: unknown;
  cancelPath?: unknown;
};

const SUPPORTED_LOCALES = new Set(['en', 'zh', 'ms']);

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

export async function POST(request: Request) {
  const config = getStripeConfigStatus();
  const body = await readCheckoutRequestBody(request);
  const locale = getLocaleFromPath(body.successPath) ?? getLocaleFromPath(body.cancelPath) ?? getLocaleFromReferer(request);
  const defaultSuccessPath = locale ? `/${locale}/account?checkout=success` : '/account?checkout=success';
  const defaultCancelPath = locale ? `/${locale}/pricing` : '/pricing';
  const successPath = getRequestBodyPath(body.successPath, defaultSuccessPath);
  const cancelPath = getRequestBodyPath(body.cancelPath, defaultCancelPath);

  if (!config.checkoutConfigured) {
    return jsonResponse(
      {
        error: 'checkout_not_configured',
        message: 'Stripe Checkout is not configured for this environment.',
        config: {
          hasSecretKey: config.hasSecretKey,
          hasProMonthlyPrice: config.hasProMonthlyPrice,
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

  const stripe = getStripeServerClient();
  if (!stripe) {
    return jsonResponse({error: 'checkout_not_configured', message: 'Stripe Checkout is not configured for this environment.'}, 503);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_PRO_MONTHLY,
        quantity: 1
      }
    ],
    success_url: getCheckoutUrl(request, successPath),
    cancel_url: getCheckoutUrl(request, cancelPath),
    client_reference_id: user.id,
    metadata: {
      supabase_user_id: user.id
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id
      }
    }
  });

  if (!session.url) {
    return jsonResponse({error: 'checkout_session_missing_url', message: 'Stripe Checkout did not return a hosted checkout URL.'}, 502);
  }

  return jsonResponse({url: session.url}, 200);
}
