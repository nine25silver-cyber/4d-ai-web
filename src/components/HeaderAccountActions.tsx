'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {Locale} from '@/i18n/routing';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
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
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);

  useEffect(() => {
    let active = true;
    const refreshEntitlement = async () => {
      const next = await getCurrentUserEntitlement();
      if (active) setEntitlement(next);
    };
    initMemberState();
    setState(readMemberState());
    void refreshEntitlement();
    const unsubscribe = subscribeMemberState((next) => {
      setState(next);
      void refreshEntitlement();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const isEntitledPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;

  if (!state) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/account`} className="inline-flex h-8 items-center rounded-md border border-[#f7da7a] bg-[#fff8df] px-3 text-sm font-bold text-[#5f4700] hover:bg-[#fff3c4]">
          {labels.login}
        </Link>
        <Link href={`/${locale}/${isEntitledPro ? 'account' : 'pricing'}`} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
          {isEntitledPro ? labels.proBadge : labels.goPro}
        </Link>
      </div>
    );
  }

  const accountLabel = state.loggedIn ? `${labels.account}: ${state.email || 'member'}` : labels.login;
  const ctaLabel = isEntitledPro ? labels.proBadge : labels.goPro;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (state.loggedIn) {
            void logoutUser();
            return;
          }
          void loginUser(locale);
        }}
        className="inline-flex h-8 items-center rounded-md border border-[#f7da7a] bg-[#fff8df] px-3 text-sm font-bold text-[#5f4700] hover:bg-[#fff3c4]"
      >
        {state.loggedIn ? labels.logout : accountLabel}
      </button>
      <Link href={`/${locale}/${isEntitledPro ? 'account' : 'pricing'}`} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
        {ctaLabel}
      </Link>
    </div>
  );
}
