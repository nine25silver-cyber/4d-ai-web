'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useLocale} from 'next-intl';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {refreshMemberStateFromAuth} from '@/lib/member-state';

export default function AuthCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const next = url.searchParams.get('next') || `/${locale}/account`;
      const providerError = url.searchParams.get('error_description') || url.searchParams.get('error');
      if (providerError) {
        setError(providerError);
        return;
      }
      if (!supabase) {
        setError('Supabase auth is not configured.');
        return;
      }
      const code = url.searchParams.get('code');
      if (!code) {
        setError('Missing sign-in callback code.');
        return;
      }
      const {error} = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setError(error.message || 'Could not finish sign in.');
        return;
      }
      await refreshMemberStateFromAuth();
      router.replace(next);
    }
    void run();
  }, [locale, router]);

  return (
    <main className="container-shell py-16">
      <p className="text-sm font-bold text-slate-600">{error ? 'Sign in could not be completed.' : 'Signing in...'}</p>
      {error ? <p className="mt-3 max-w-xl rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">{error}</p> : null}
    </main>
  );
}
