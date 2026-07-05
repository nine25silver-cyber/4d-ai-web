'use client';

import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';

type Props = {
  labels: {
    idle: string;
    loading: string;
    error: string;
  };
};

type CheckoutResponse = {
  url?: string;
  message?: string;
  error?: string;
};

const SUPPORTED_LOCALES = new Set(['en', 'zh', 'ms']);

function getCheckoutReturnPaths(pathname: string | null) {
  const firstSegment = pathname?.split('/').filter(Boolean)[0];
  const localePrefix = firstSegment && SUPPORTED_LOCALES.has(firstSegment) ? `/${firstSegment}` : '';

  return {
    successPath: `${localePrefix}/account?checkout=success`,
    cancelPath: `${localePrefix}/pricing`
  };
}

export function PricingSubscribeButton({labels}: Props) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idleLabel = labels.idle || 'Monthly Subscribe';
  const loadingLabel = labels.loading || 'Opening checkout...';
  const errorLabel = labels.error || 'Unable to start checkout. Please try again.';

  const startCheckout = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {data} = supabase ? await supabase.auth.getSession() : {data: {session: null}};
      const token = data.session?.access_token;
      const returnPaths = getCheckoutReturnPaths(pathname);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        body: JSON.stringify({plan: 'pro_monthly', ...returnPaths})
      });
      const payload = (await response.json().catch(() => ({}))) as CheckoutResponse;

      if (!response.ok) {
        setError(payload.message || errorLabel);
        return;
      }

      if (!payload.url) {
        setError(payload.message || errorLabel);
        return;
      }

      window.location.assign(payload.url);
    } catch {
      setError(errorLabel);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={loading}
        className="w-full rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {loading ? loadingLabel : idleLabel}
      </button>
      {error ? <p className="mt-2 text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
