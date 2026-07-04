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

function getCheckoutUrl(path: 'account?checkout=success' | 'pricing'): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? '';
  return `${siteUrl.replace(/\/$/, '')}/${path}`;
}

export async function POST(request: Request) {
  const config = getStripeConfigStatus();

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
    success_url: getCheckoutUrl('account?checkout=success'),
    cancel_url: getCheckoutUrl('pricing'),
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
