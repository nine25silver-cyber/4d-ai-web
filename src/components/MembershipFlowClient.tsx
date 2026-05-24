'use client';

import {useEffect, useMemo, useState} from 'react';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import {initMemberState, loginUser, logoutUser, readMemberState, setPlan, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {hasSupabaseConfig} from '@/lib/supabase-browser';

type Props = {
  labels: {
    panelTitle: string;
    panelText: string;
    statusLabel: string;
    loggedOut: string;
    loggedIn: string;
    freePlan: string;
    proPlan: string;
    login: string;
    logout: string;
    activatePro: string;
    switchFree: string;
    syncWarningPrefix: string;
    syncWarningFallback: string;
  };
};

export function MembershipFlowClient({labels}: Props) {
  const [state, setStateState] = useState<MemberState | null>(null);
  const [pendingAction, setPendingAction] = useState<'login' | 'logout' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isSupabaseMode = hasSupabaseConfig();

  useEffect(() => {
    initMemberState();
    setStateState(readMemberState());
    return subscribeMemberState(setStateState);
  }, []);

  const statusText = useMemo(() => {
    if (!state) return `${labels.loggedOut} | ${labels.freePlan}`;
    if (!state.loggedIn) return `${labels.loggedOut} | ${labels.freePlan}`;
    return `${labels.loggedIn} (${state.email || 'demo@4dai.local'}) | ${state.plan === 'pro' ? labels.proPlan : labels.freePlan}`;
  }, [labels, state]);

  const syncWarningText = useMemo(() => {
    if (!isSupabaseMode || !state?.loggedIn || !state.syncError) return null;
    const base = `${labels.syncWarningPrefix}: ${labels.syncWarningFallback}`;
    if (process.env.NODE_ENV !== 'production') return `${base} (${state.syncError})`;
    return base;
  }, [isSupabaseMode, labels.syncWarningFallback, labels.syncWarningPrefix, state?.loggedIn, state?.syncError]);

  async function handleLogin() {
    setPendingAction('login');
    setAuthError(null);
    const result = await loginUser(locale, pathname);
    if (!result.ok) {
      setAuthError(result.error ?? 'Authentication request failed.');
      setPendingAction(null);
      return;
    }
    if (result.demo) {
      setStateState(readMemberState());
      setAuthError('Demo login is active because Supabase auth is not configured in this environment.');
      setPendingAction(null);
    }
  }

  async function handleLogout() {
    setPendingAction('logout');
    setAuthError(null);
    const result = await logoutUser();
    if (!result.ok) {
      setAuthError(result.error ?? 'Could not sign out.');
      setPendingAction(null);
      return;
    }
    setStateState(readMemberState());
    router.refresh();
    setPendingAction(null);
  }

  return (
    <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5">
      <p className="text-xs font-black uppercase text-blue-800">MVP</p>
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
      {authError ? (
        <p className="mt-3 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">
          {authError}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void handleLogin()} disabled={pendingAction !== null} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-60">
          {pendingAction === 'login' ? 'Signing in...' : labels.login}
        </button>
        {!isSupabaseMode ? (
          <>
            <button type="button" onClick={() => setPlan('pro')} className="rounded-md bg-blue-800 px-3 py-2 text-sm font-bold text-white hover:bg-blue-900">
              {labels.activatePro}
            </button>
            <button type="button" onClick={() => setPlan('free')} className="rounded-md border border-blue-400 bg-blue-100 px-3 py-2 text-sm font-bold text-blue-900 hover:bg-blue-200">
              {labels.switchFree}
            </button>
          </>
        ) : null}
        <button type="button" onClick={() => void handleLogout()} disabled={pendingAction !== null} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-60">
          {pendingAction === 'logout' ? 'Signing out...' : labels.logout}
        </button>
      </div>
    </section>
  );
}
