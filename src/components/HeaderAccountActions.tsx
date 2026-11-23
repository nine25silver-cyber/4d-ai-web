'use client';

import Link from 'next/link';
import {Locale} from '@/i18n/routing';
import {isPaidProEntitlement, isTrialEntitlement} from '@/lib/member-entitlement';
import {loginUser, logoutUser} from '@/lib/member-state';
import {useMemberEntitlementCheck} from '@/lib/use-member-entitlement-check';

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
  const {memberState:state,entitlement,entitlementLoading} = useMemberEntitlementCheck();

  const isEntitledPro = isPaidProEntitlement(entitlement);
  const isTrial = isTrialEntitlement(entitlement);
  const awaitingVerification = state?.loggedIn && (entitlementLoading || entitlement?.source === 'error');
  const accessHref = `/${locale}/${isEntitledPro || isTrial || awaitingVerification ? 'account' : 'pricing'}`;
  const accessLabel = isEntitledPro ? labels.proBadge : isTrial ? 'Trial'
    : awaitingVerification ? labels.account : labels.goPro;

  if (!state) {
    return (
      <div className="site-header-account flex items-center gap-2">
        <Link href={`/${locale}/account`} className="inline-flex h-8 items-center rounded-md border border-[#f7da7a] bg-[#fff8df] px-3 text-sm font-bold text-[#5f4700] hover:bg-[#fff3c4]">
          {labels.login}
        </Link>
        <Link href={accessHref} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
          {accessLabel}
        </Link>
      </div>
    );
  }

  const accountLabel = state.loggedIn ? `${labels.account}: ${state.email || 'member'}` : labels.login;
  const ctaLabel = accessLabel;

  return (
    <div className="site-header-account flex items-center gap-2">
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
      <Link href={accessHref} className="inline-flex h-8 items-center rounded-md border border-[#f8e7bb] bg-[#ebc978] px-3 text-sm font-bold text-white hover:bg-[#e2be68]">
        {ctaLabel}
      </Link>
    </div>
  );
}
