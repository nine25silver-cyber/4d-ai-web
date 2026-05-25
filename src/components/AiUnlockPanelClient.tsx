'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';

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
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const refreshEntitlement = async () => {
      setEntitlementLoading(true);
      const next = await getCurrentUserEntitlement();
      if (!active) return;
      setEntitlement(next);
      setEntitlementLoading(false);
    };
    void refreshEntitlement();
    return () => {
      active = false;
    };
  }, []);

  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;

  if (isFormalPro) {
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
      {entitlementLoading ? (
        <p className="mt-2 text-xs font-bold text-amber-800">
          {locale === 'zh' ? '正在确认会员权限。' : locale === 'ms' ? 'Sedang menyemak akses ahli.' : 'Checking membership access.'}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`/${locale}/pricing`} className="rounded-md border border-blue-300 bg-white px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{goPro}</Link>
        <span className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-800">{watchAd}</span>
      </div>
    </section>
  );
}
