'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Locale} from '@/i18n/routing';
import {initMemberState, loginUser, logoutUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';

type Props = {
  locale: Locale;
  labels: {
    login: string;
    logout: string;
    goPro: string;
    account: string;
    proBadge: string;
  };
};

export function HeaderAccountActions({locale, labels}: Props) {
  const [state, setState] = useState<MemberState | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    initMemberState();
    setState(readMemberState());
    return subscribeMemberState(setState);
  }, []);

  if (!state) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/account`} className="inline-flex h-8 items-center rounded-md border border-[#f7da7a] bg-[#fff8df] px-3 text-sm font-bold text-[#5f4700] hover:bg-[#fff3c4]">
          {labels.login}
        </Link>
        <Link href={`/${locale}/pricing`} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
          {labels.goPro}
        </Link>
      </div>
    );
  }

  const accountLabel = state.loggedIn ? `${labels.account}: ${state.email || 'member'}` : labels.login;
  const ctaLabel = state.plan === 'pro' ? labels.proBadge : labels.goPro;

  async function handleAccountClick() {
    if (!state) return;
    const currentState = state;
    setPending(true);
    setError(null);
    const result = currentState.loggedIn ? await logoutUser() : await loginUser(locale);
    if (!result.ok) {
      setError(result.error ?? 'Authentication request failed.');
      setPending(false);
      return;
    }
    if (currentState.loggedIn) {
      setState(readMemberState());
      router.refresh();
      setPending(false);
      return;
    }
    if (result.demo) {
      setState(readMemberState());
      setError('Demo login is active because Supabase auth is not configured in this environment.');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error ? <p className="max-w-[240px] text-right text-xs font-bold text-amber-200">{error}</p> : null}
      <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void handleAccountClick()}
        disabled={pending}
        className="inline-flex h-8 items-center rounded-md border border-[#f7da7a] bg-[#fff8df] px-3 text-sm font-bold text-[#5f4700] hover:bg-[#fff3c4] disabled:opacity-60"
      >
        {pending ? 'Working...' : state.loggedIn ? labels.logout : accountLabel}
      </button>
      <Link href={`/${locale}/${state.plan === 'pro' ? 'account' : 'pricing'}`} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
        {ctaLabel}
      </Link>
      </div>
    </div>
  );
}
