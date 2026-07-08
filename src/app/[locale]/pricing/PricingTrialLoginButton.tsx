'use client';

import {useEffect, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import {initMemberState, loginUser, readMemberState, subscribeMemberState} from '@/lib/member-state';

type PricingTrialLoginButtonProps = {
  locale: Locale;
  labels: {
    login: string;
    loggedIn: string;
    ready: string;
  };
};

export function PricingTrialLoginButton({locale, labels}: PricingTrialLoginButtonProps) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    initMemberState();
    setLoggedIn(readMemberState().loggedIn === true);
    return subscribeMemberState((state) => setLoggedIn(state.loggedIn === true));
  }, []);

  if (loggedIn) {
    return (
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
        <span className="block">{labels.loggedIn}</span>
        <span className="block text-xs font-semibold text-blue-800">{labels.ready}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void loginUser(locale, `/${locale}/pricing`)}
      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 hover:bg-emerald-100"
    >
      {labels.login}
    </button>
  );
}
