'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {initMemberState, loginUser, logoutUser, readMemberState, setPlan, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {hasSupabaseConfig} from '@/lib/supabase-browser';

type Props = {
  labels: {
    panelTitle: string;
    panelText: string;
    statusLabel: string;
    googleLabel?: string;
    membershipLabel?: string;
    loggedOut: string;
    loggedIn: string;
    freePlan: string;
    proPlan: string;
    login: string;
    logout: string;
    activatePro: string;
    switchFree: string;
    managePro?: string;
    syncWarningPrefix: string;
    syncWarningFallback: string;
  };
  variant?: 'default' | 'account';
  pricingHref?: string;
};

function formatDateOnly(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) return raw.slice(0, 10);
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function MembershipFlowClient({labels, pricingHref, variant = 'default'}: Props) {
  const [state, setStateState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const locale = useLocale();
  const pathname = usePathname();
  const entitlementT = useTranslations('MembershipEntitlement');
  const isSupabaseMode = hasSupabaseConfig();
  const showDevelopmentPlanControls = !isSupabaseMode && process.env.NODE_ENV !== 'production';

  useEffect(() => {
    let active = true;
    const refreshEntitlement = async () => {
      setEntitlementLoading(true);
      const next = await getCurrentUserEntitlement();
      if (!active) return;
      setEntitlement(next);
      setEntitlementLoading(false);
    };
    initMemberState();
    setStateState(readMemberState());
    void refreshEntitlement();
    const unsubscribe = subscribeMemberState((next) => {
      setStateState(next);
      void refreshEntitlement();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const statusText = useMemo(() => {
    if (!state?.loggedIn) return labels.loggedOut;
    return `${labels.loggedIn} (${state.email || '4D AI'})`;
  }, [labels.loggedIn, labels.loggedOut, state]);

  const syncWarningText = useMemo(() => {
    if (!isSupabaseMode || !state?.loggedIn || !state.syncError) return null;
    const base = `${labels.syncWarningPrefix}: ${labels.syncWarningFallback}`;
    if (process.env.NODE_ENV !== 'production') return `${base} (${state.syncError})`;
    return base;
  }, [isSupabaseMode, labels.syncWarningFallback, labels.syncWarningPrefix, state?.loggedIn, state?.syncError]);

  const entitlementSourceText = useMemo(() => {
    if (!entitlement) return entitlementT('sourceLoading');
    const keyBySource: Record<CurrentUserEntitlement['source'], string> = {
      user_membership_entitlements: 'sourceUserEntitlements',
      missing_row: 'sourceMissingRow',
      not_logged_in: 'sourceNotLoggedIn',
      supabase_unconfigured: 'sourceSupabaseUnconfigured',
      error: 'sourceError'
    };
    return entitlementT(keyBySource[entitlement.source]);
  }, [entitlement, entitlementT]);

  const entitlementPlanText = entitlement?.isPro ? labels.proPlan : labels.freePlan;
  const googleStatusText = state?.loggedIn ? (state.email || labels.loggedIn) : labels.loggedOut;
  const proExpiryDate = entitlement?.isPro ? formatDateOnly(entitlement.currentPeriodEnd) : null;
  const proExpiryText = proExpiryDate
    ? `${locale === 'zh' ? 'Pro 到期' : locale === 'ms' ? 'Pro tamat' : 'Pro expires'}: ${proExpiryDate}`
    : null;

  if (variant === 'account') {
    return (
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">{labels.panelTitle}</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-800">
            {entitlementLoading ? entitlementT('loading') : entitlementPlanText}
          </span>
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs font-black uppercase text-slate-500">{labels.statusLabel}</dt>
            <dd className="mt-1 break-words text-sm font-bold text-slate-900">{statusText}</dd>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs font-black uppercase text-slate-500">{labels.googleLabel}</dt>
            <dd className="mt-1 break-words text-sm font-bold text-slate-900">{googleStatusText}</dd>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs font-black uppercase text-slate-500">{labels.membershipLabel}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-900">{entitlementLoading ? entitlementT('loading') : entitlementPlanText}</dd>
            {proExpiryText ? <dd className="mt-1 text-xs font-semibold text-slate-600">{proExpiryText}</dd> : null}
          </div>
        </dl>
        {syncWarningText ? (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
            {syncWarningText}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {!state?.loggedIn ? (
            <button type="button" onClick={() => void loginUser(locale, pathname)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
              {labels.login}
            </button>
          ) : null}
          {pricingHref ? (
            <Link href={pricingHref} className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-100">
              {labels.managePro || labels.activatePro}
            </Link>
          ) : null}
          {showDevelopmentPlanControls ? (
            <>
              <button type="button" onClick={() => setPlan('pro')} className="rounded-md border border-blue-400 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-200">
                {labels.activatePro}
              </button>
              <button type="button" onClick={() => setPlan('free')} className="rounded-md border border-blue-400 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-200">
                {labels.switchFree}
              </button>
            </>
          ) : null}
          {state?.loggedIn ? (
            <button type="button" onClick={() => void logoutUser()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
              {labels.logout}
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
      <p className="text-xs font-black uppercase text-blue-800">Membership</p>
      <h2 className="mt-2 text-lg font-black text-slate-950">{labels.panelTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{labels.panelText}</p>
      <p className="mt-4 rounded-md border border-blue-300 bg-white px-3 py-2 text-sm font-bold text-slate-800">
        {labels.statusLabel}: {statusText}
      </p>
      {syncWarningText ? (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          {syncWarningText}
        </p>
      ) : null}
      <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-black text-slate-950">{entitlementT('title')}</p>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
            {entitlementLoading ? entitlementT('loading') : entitlementPlanText}
          </span>
        </div>
        <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{entitlementT('readOnlyNote')}</p>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-black uppercase text-slate-500">{entitlementT('sourceLabel')}</dt>
            <dd className="mt-1 font-bold text-slate-800">{entitlementSourceText}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase text-slate-500">{entitlementT('statusLabel')}</dt>
            <dd className="mt-1 font-bold text-slate-800">{entitlement?.status || entitlementT('statusUnavailable')}</dd>
          </div>
          {entitlement?.updatedAt ? (
            <div>
              <dt className="text-xs font-black uppercase text-slate-500">{entitlementT('updatedAtLabel')}</dt>
              <dd className="mt-1 font-bold text-slate-800">{entitlement.updatedAt}</dd>
            </div>
          ) : null}
          {entitlement?.currentPeriodEnd ? (
            <div>
              <dt className="text-xs font-black uppercase text-slate-500">{entitlementT('currentPeriodEndLabel')}</dt>
              <dd className="mt-1 font-bold text-slate-800">{entitlement.currentPeriodEnd}</dd>
            </div>
          ) : null}
        </dl>
        {entitlement?.source === 'error' ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
            {entitlementT('errorText')}
          </p>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void loginUser(locale, pathname)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
          {labels.login}
        </button>
        {showDevelopmentPlanControls ? (
          <>
            <button type="button" onClick={() => setPlan('pro')} className="rounded-md bg-blue-800 px-3 py-2 text-sm font-bold text-white hover:bg-blue-900">
              {labels.activatePro}
            </button>
            <button type="button" onClick={() => setPlan('free')} className="rounded-md border border-blue-400 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-200">
              {labels.switchFree}
            </button>
          </>
        ) : null}
        <button type="button" onClick={() => void logoutUser()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
          {labels.logout}
        </button>
      </div>
    </section>
  );
}
