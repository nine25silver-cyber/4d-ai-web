'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {initMemberState, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';

type Props = {
  locale: string;
  title: string;
  text: string;
  goPro: string;
  watchAd: string;
  unlockedTitle: string;
  unlockedText: string;
};

export function AiUnlockPanelClient({locale, title, text, goPro, watchAd, unlockedTitle, unlockedText}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);

  useEffect(() => {
    initMemberState();
    setMemberState(readMemberState());
    return subscribeMemberState(setMemberState);
  }, []);

  const isPro = memberState?.loggedIn === true && memberState.plan === 'pro';

  if (isPro) {
    return (
      <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="text-lg font-black text-slate-950">{unlockedTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{unlockedText}</p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/${locale}/pricing`} className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{goPro}</Link>
        <span className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-800">{watchAd}</span>
      </div>
    </section>
  );
}
