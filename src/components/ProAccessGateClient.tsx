'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useLocale} from 'next-intl';
import {ReactNode, useEffect, useState} from 'react';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';

type Props = {
  children: ReactNode;
  labels: {
    title: string;
    description: string;
    featureLabel: string;
    login: string;
    goPro: string;
    currentStatusLabel: string;
    statusGuest: string;
    statusFree: string;
    statusPro: string;
  };
};

export function ProAccessGateClient({children, labels}: Props) {
  const [state, setState] = useState<MemberState | null>(null);
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    initMemberState();
    setState(readMemberState());
    return subscribeMemberState(setState);
  }, []);

  if (state?.loggedIn && state.plan === 'pro') return <>{children}</>;

  const statusText = !state?.loggedIn
    ? labels.statusGuest
    : state.plan === 'pro'
      ? labels.statusPro
      : labels.statusFree;

  return (
    <section className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-5">
      <p className="text-xs font-black uppercase text-amber-800">{labels.featureLabel}</p>
      <h2 className="mt-2 text-xl font-black text-slate-950">{labels.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{labels.description}</p>
      <p className="mt-4 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">
        {labels.currentStatusLabel}: {statusText}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {!state?.loggedIn ? (
          <button type="button" onClick={() => void loginUser(locale, pathname)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
            {labels.login}
          </button>
        ) : null}
        <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900">
          {labels.goPro}
        </Link>
      </div>
    </section>
  );
}
