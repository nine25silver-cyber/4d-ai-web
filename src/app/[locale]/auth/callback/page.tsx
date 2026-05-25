'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useLocale} from 'next-intl';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {refreshMemberStateFromAuth} from '@/lib/member-state';

export default function AuthCallbackPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    async function run() {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const next = url.searchParams.get('next') || `/${locale}/account`;
      if (!supabase) {
        router.replace(next);
        return;
      }
      const code = url.searchParams.get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      await refreshMemberStateFromAuth();
      router.replace(next);
    }
    void run();
  }, [locale, router]);

  return (
    <main className="container-shell py-16">
      <p className="text-sm font-bold text-slate-600">Signing in...</p>
    </main>
  );
}
