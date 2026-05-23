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

function resolvePlanFromSession(session: Session): MemberPlan {
  const appPlan = session.user.app_metadata?.plan;
  const userPlan = session.user.user_metadata?.plan;
  const appTier = session.user.app_metadata?.subscription_tier;
  const userTier = session.user.user_metadata?.subscription_tier;
  const appRole = session.user.app_metadata?.role;
  const userRole = session.user.user_metadata?.role;
  const appMembership = session.user.app_metadata?.membership;
  const userMembership = session.user.user_metadata?.membership;
  const appIsPro = session.user.app_metadata?.is_pro;
  const userIsPro = session.user.user_metadata?.is_pro;
  const appEntitlement = session.user.app_metadata?.entitlement;
  const userEntitlement = session.user.user_metadata?.entitlement;
  if (appIsPro === true || userIsPro === true) return 'pro';
  if (metadataSuggestsPro(session.user.app_metadata) || metadataSuggestsPro(session.user.user_metadata)) return 'pro';
  const candidates = [appPlan, userPlan, appTier, userTier, appRole, userRole, appMembership, userMembership, appEntitlement, userEntitlement]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());
  return candidates.some((value) => value.includes('pro')) ? 'pro' : 'free';
}

function metadataSuggestsPro(value: unknown): boolean {
  const queue: unknown[] = [value];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === true) return true;
    if (typeof current === 'string') {
      const normalized = current.toLowerCase();
      if (normalized.includes('pro') || normalized === 'active' || normalized === 'paid' || normalized === 'premium' || normalized === 'gold') {
        return true;
      }
      continue;
    }
    if (!current || typeof current !== 'object') continue;
    for (const [key, next] of Object.entries(current as Record<string, unknown>)) {
      const normalizedKey = key.toLowerCase();
      if ((normalizedKey.includes('pro') || normalizedKey.includes('active') || normalizedKey.includes('paid') || normalizedKey.includes('premium')) && next === true) {
        return true;
      }
      queue.push(next);
    }
  }
  return false;
}

async function resolvePlanFromDatabase(session: Session): Promise<{plan: MemberPlan | null; syncError: string | null}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {plan: null, syncError: null};
  const {data, error} = await supabase
    .from('profiles')
    .select('plan,is_pro')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) return {plan: null, syncError: 'PROFILE_QUERY_ERROR'};
  if (!data) return {plan: null, syncError: 'PROFILE_NOT_FOUND'};
  const rawPlan = typeof data.plan === 'string' ? data.plan.toLowerCase() : '';
  if (rawPlan.includes('pro')) return {plan: 'pro', syncError: null};
  if (data.is_pro === true) return {plan: 'pro', syncError: null};
  const fallback = await resolvePlanFromSubscriptionTables(session);
  if (fallback.plan) return fallback;
  return {plan: 'free', syncError: fallback.syncError};
}

function valueLooksPro(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return normalized.includes('pro') || normalized === 'active' || normalized === 'paid' || normalized === 'premium' || normalized === 'true';
  }
  return false;
}

async function probeSubscriptionTable(
  session: Session,
  table: string,
  columns: string[],
  idColumn: 'id' | 'user_id'
): Promise<{hit: boolean; missing: boolean}> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {hit: false, missing: true};
  const selectColumns = columns.join(',');
  const {data, error} = await supabase
    .from(table)
    .select(selectColumns)
    .eq(idColumn, session.user.id)
    .order('updated_at', {ascending: false})
    .limit(1)
    .maybeSingle();
  if (error) {
    // Missing table/column or no permission; continue probing other candidates.
    if (error.code === '42P01' || error.code === '42703' || error.code === 'PGRST116' || error.code === 'PGRST204') {
      return {hit: false, missing: true};
    }
    return {hit: false, missing: false};
  }
  if (!data || typeof data !== 'object') return {hit: false, missing: false};
  const values = Object.values(data as Record<string, unknown>);
  return {hit: values.some((value) => valueLooksPro(value)), missing: false};
}

async function resolvePlanFromSubscriptionTables(session: Session): Promise<{plan: MemberPlan | null; syncError: string | null}> {
  const probes: Array<{table: string; columns: string[]; idColumn: 'id' | 'user_id'}> = [
    {table: 'subscriptions', columns: ['status', 'plan', 'is_pro', 'is_active'], idColumn: 'user_id'},
    {table: 'user_subscriptions', columns: ['status', 'plan', 'is_pro', 'is_active'], idColumn: 'user_id'},
    {table: 'entitlements', columns: ['status', 'tier', 'is_pro', 'active'], idColumn: 'user_id'},
    {table: 'user_entitlements', columns: ['status', 'tier', 'is_pro', 'active'], idColumn: 'user_id'},
    {table: 'memberships', columns: ['status', 'plan', 'is_pro', 'is_active'], idColumn: 'user_id'},
    {table: 'profiles', columns: ['status', 'tier', 'membership'], idColumn: 'id'}
  ];
  let checkedAny = false;
  for (const probe of probes) {
    const result = await probeSubscriptionTable(session, probe.table, probe.columns, probe.idColumn);
    if (!result.missing) checkedAny = true;
    if (result.hit) return {plan: 'pro', syncError: null};
  }
  return {plan: null, syncError: checkedAny ? 'SUBSCRIPTION_TABLE_CHECKED_NO_PRO' : 'SUBSCRIPTION_TABLE_UNAVAILABLE'};
}

async function writeFromSession(session: Session | null) {
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
  const previous = readMemberState();
  const sessionPlan = resolvePlanFromSession(session);
  let plan: MemberPlan = sessionPlan;
  let syncError: string | null = null;
  const dbResult = await resolvePlanFromDatabase(session);
  if (dbResult.plan) {
    // Never downgrade a session-confirmed Pro user to free due to profile lag/mismatch.
    if (sessionPlan === 'pro' && dbResult.plan === 'free') {
      plan = 'pro';
      if (!syncError) syncError = 'PROFILE_PLAN_CONFLICT_KEEP_SESSION_PRO';
    } else {
      plan = dbResult.plan;
    }
  }
  if (dbResult.syncError) syncError = dbResult.syncError;
  const sameUserAsBefore = previous.loggedIn && previous.email !== '' && previous.email === (session.user.email ?? '');
  const keepPreviousPro = sameUserAsBefore && previous.plan === 'pro' && !dbResult.plan;
  if (keepPreviousPro) {
    plan = 'pro';
    // Keep showing sync warning for debugging, but do not downgrade capabilities.
    if (!syncError) syncError = 'PROFILE_SYNC_SKIPPED_KEEP_PRO';
  }
  writeMemberState({
    loggedIn: true,
    email: session.user.email ?? '',
    plan,
    syncError,
    updatedAt: new Date().toISOString()
  });
}

export function loginDemoUser() {
  const current = readMemberState();
  writeMemberState({
    ...current,
    loggedIn: true,
    email: current.email || DEFAULT_LOGIN_EMAIL,
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
  void supabase.auth.getSession().then(({data}) => void writeFromSession(data.session));
  supabase.auth.onAuthStateChange((_event, session) => {
    void writeFromSession(session);
  });
}

export async function refreshMemberStateFromAuth() {
  if (!hasSupabaseConfig()) return;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const {data} = await supabase.auth.getSession();
  await writeFromSession(data.session);
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
