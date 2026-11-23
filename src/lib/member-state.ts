'use client';

import type {Session} from '@supabase/supabase-js';
import {getSupabaseBrowserClient, hasSupabaseConfig} from '@/lib/supabase-browser';

export type MemberPlan = 'free' | 'pro';

export type MemberState = {
  loggedIn: boolean;
  email: string;
  plan: MemberPlan;
  syncError: string | null;
  updatedAt: string;
};

const STORAGE_KEY = 'four_d_ai_member_state_v1';
const EVENT_NAME = 'four-d-ai-member-state-updated';
const DEFAULT_LOGIN_EMAIL = 'demo@4dai.local';

let bootstrapped = false;
let memberAuthRevision = 0;
let observedToken: string | null | undefined;
let observedUserId: string | null | undefined;

export function readMemberAuthRevision() {return memberAuthRevision;}
export function readMemberAuthUserId() {return observedUserId;}

function observeSession(session:Session|null) {
  const token = session?.access_token ?? null;
  observedUserId = session?.user.id ?? null;
  if (token !== observedToken) {
    observedToken = token;
    memberAuthRevision++;
  }
}

function defaultState(): MemberState {
  return {
    loggedIn: false,
    email: '',
    plan: 'free',
    syncError: null,
    updatedAt: new Date().toISOString()
  };
}

export function readMemberState(): MemberState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<MemberState>;
    return {
      loggedIn: parsed.loggedIn === true,
      email: typeof parsed.email === 'string' ? parsed.email : '',
      plan: parsed.plan === 'pro' ? 'pro' : 'free',
      syncError: typeof parsed.syncError === 'string' ? parsed.syncError : null,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString()
    };
  } catch {
    return defaultState();
  }
}

function notifyUpdate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function writeMemberState(next: MemberState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifyUpdate();
}

function writeFromSession(session: Session | null) {
  if (!session) {
    writeMemberState({
      loggedIn: false,
      email: '',
      plan: 'free',
      syncError: null,
      updatedAt: new Date().toISOString()
    });
    return;
  }
  writeMemberState({
    loggedIn: true,
    email: session.user.email ?? '',
    plan: 'free',
    syncError: null,
    updatedAt: new Date().toISOString()
  });
}

export function loginDemoUser() {
  const current = readMemberState();
  writeMemberState({
    ...current,
    loggedIn: true,
    email: current.email || DEFAULT_LOGIN_EMAIL,
    plan: 'free',
    syncError: null,
    updatedAt: new Date().toISOString()
  });
}

export function setPlan(plan: MemberPlan) {
  const current = readMemberState();
  writeMemberState({
    ...current,
    loggedIn: true,
    plan,
    syncError: null,
    updatedAt: new Date().toISOString()
  });
}

export function subscribeMemberState(onChange: (state: MemberState) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onChange(readMemberState());
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange(readMemberState());
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export function initMemberState() {
  if (typeof window === 'undefined' || bootstrapped) return;
  bootstrapped = true;
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  let authEventSeen = false;
  let publishRevision = 0;
  const publishSession = (session:Session|null) => {
    observeSession(session);
    const revision = ++publishRevision;
    // Member subscribers may themselves read Auth. Notify after the SDK callback.
    setTimeout(() => {
      if (revision !== publishRevision) return;
      try {writeFromSession(session);} catch {/* Storage is not always available. */}
    }, 0);
  };
  supabase.auth.onAuthStateChange((event, session) => {
    // The SDK also emits INITIAL_SESSION/null if its internal session read errors.
    // Only the separately checked getSession result can label that case guest.
    if (event === 'INITIAL_SESSION' && (authEventSeen || !session)) return;
    authEventSeen = true;
    publishSession(session);
  });
  void supabase.auth.getSession().then(({data,error}) => {
    if (!authEventSeen && !error) publishSession(data.session);
  }).catch(() => {
    // A failed initial read must not turn an existing session into a sign-out.
  });
}

export async function refreshMemberStateFromAuth() {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const revision = memberAuthRevision;
  const {data,error} = await supabase.auth.getSession();
  if (!error && revision === memberAuthRevision) {
    observeSession(data.session);
    writeFromSession(data.session);
  }
}

export async function loginUser(locale: string, nextPath?: string) {
  if (!hasSupabaseConfig()) {
    loginDemoUser();
    return;
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase || typeof window === 'undefined') {
    loginDemoUser();
    return;
  }
  const fallbackNext = `/${locale}/account`;
  const next = nextPath && nextPath.startsWith('/') ? nextPath : fallbackNext;
  const redirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`;
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {redirectTo}
  });
}

export async function logoutUser() {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  writeMemberState({
    loggedIn: false,
    email: '',
    plan: 'free',
    syncError: null,
    updatedAt: new Date().toISOString()
  });
}
