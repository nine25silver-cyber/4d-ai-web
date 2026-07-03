'use client';

import {getSupabaseBrowserClient} from '@/lib/supabase-browser';

export type CurrentUserEntitlement = {
  loggedIn: boolean;
  userId?: string;
  plan: 'free' | 'pro';
  status?: string | null;
  isPro: boolean;
  source: 'user_membership_entitlements' | 'missing_row' | 'not_logged_in' | 'supabase_unconfigured' | 'error';
  error?: string;
  updatedAt?: string | null;
  currentPeriodEnd?: string | null;
};

type EntitlementRow = {
  user_id: string;
  plan: string | null;
  is_pro: boolean | null;
  status: string | null;
  current_period_end: string | null;
  updated_at: string | null;
};

type UserAccessStateRow = {
  is_logged_in: boolean | null;
  is_pro: boolean | null;
  plan: string | null;
  membership_status: string | null;
  current_period_end: string | null;
  checked_at: string | null;
};

const FREE_FALLBACK: CurrentUserEntitlement = {
  loggedIn: false,
  plan: 'free',
  isPro: false,
  source: 'not_logged_in'
};

function sanitizeError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unable to read membership status.';
  const record = error as {message?: unknown; code?: unknown};
  const message = typeof record.message === 'string' && record.message.trim() ? record.message.trim() : 'Unable to read membership status.';
  const code = typeof record.code === 'string' && record.code.trim() ? record.code.trim() : null;
  return code ? `${code}: ${message}` : message;
}

function statusAllowsPro(status: string | null): boolean {
  if (!status) return true;
  const normalized = status.toLowerCase();
  return !['inactive', 'canceled', 'cancelled', 'expired', 'disabled', 'revoked'].some((blocked) => normalized.includes(blocked));
}

function periodAllowsPro(currentPeriodEnd: string | null): boolean {
  if (!currentPeriodEnd) return true;
  const timestamp = Date.parse(currentPeriodEnd);
  if (Number.isNaN(timestamp)) return false;
  return timestamp > Date.now();
}

function normalizeRpcPlan(plan: string | null, isPro: boolean): 'free' | 'pro' {
  const normalized = plan?.toLowerCase();
  if (isPro && (normalized === 'premium' || normalized === 'pro')) return 'pro';
  return 'free';
}

function getRpcAccessRow(data: unknown): UserAccessStateRow | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return null;
  const record = row as Partial<UserAccessStateRow>;
  if (typeof record.is_pro !== 'boolean') return null;
  if (record.current_period_end != null && typeof record.current_period_end !== 'string') return null;
  if (record.membership_status != null && typeof record.membership_status !== 'string') return null;
  if (record.plan != null && typeof record.plan !== 'string') return null;
  if (record.checked_at != null && typeof record.checked_at !== 'string') return null;
  return {
    is_logged_in: typeof record.is_logged_in === 'boolean' ? record.is_logged_in : true,
    is_pro: record.is_pro,
    plan: record.plan ?? null,
    membership_status: record.membership_status ?? null,
    current_period_end: record.current_period_end ?? null,
    checked_at: record.checked_at ?? null
  };
}

function entitlementFromRpcRow(row: UserAccessStateRow, userId: string): CurrentUserEntitlement {
  const isPro = row.is_pro === true && periodAllowsPro(row.current_period_end);
  return {
    loggedIn: true,
    userId,
    plan: normalizeRpcPlan(row.plan, isPro),
    status: row.membership_status,
    isPro,
    source: 'user_membership_entitlements',
    updatedAt: row.checked_at,
    currentPeriodEnd: row.current_period_end
  };
}

async function getCurrentUserEntitlementFromLegacyTable(
  supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>,
  userId: string
): Promise<CurrentUserEntitlement> {
  const {data, error} = await supabase
    .from('user_membership_entitlements')
    .select('user_id,plan,is_pro,status,current_period_end,updated_at')
    .eq('user_id', userId)
    .maybeSingle<EntitlementRow>();

  if (error) {
    return {
      loggedIn: true,
      userId,
      plan: 'free',
      isPro: false,
      source: 'error',
      error: sanitizeError(error)
    };
  }

  if (!data) {
    return {
      loggedIn: true,
      userId,
      plan: 'free',
      isPro: false,
      source: 'missing_row'
    };
  }

  const rowPlan = data.plan === 'pro' ? 'pro' : 'free';
  const rowSaysPro = rowPlan === 'pro' || data.is_pro === true;
  const isPro = rowSaysPro && statusAllowsPro(data.status) && periodAllowsPro(data.current_period_end);

  return {
    loggedIn: true,
    userId,
    plan: isPro ? 'pro' : 'free',
    status: data.status,
    isPro,
    source: 'user_membership_entitlements',
    updatedAt: data.updated_at,
    currentPeriodEnd: data.current_period_end
  };
}

export async function getCurrentUserEntitlement(): Promise<CurrentUserEntitlement> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return {
      ...FREE_FALLBACK,
      source: 'supabase_unconfigured'
    };
  }

  const sessionResult = await supabase.auth.getSession();
  if (sessionResult.error) {
    return {
      ...FREE_FALLBACK,
      source: 'error',
      error: sanitizeError(sessionResult.error)
    };
  }

  const user = sessionResult.data.session?.user;
  if (!user) return FREE_FALLBACK;

  const rpcResult = await supabase.rpc('get_user_access_state', {p_platform: 'web'});
  if (!rpcResult.error) {
    const rpcRow = getRpcAccessRow(rpcResult.data);
    if (rpcRow) return entitlementFromRpcRow(rpcRow, user.id);
  }

  return getCurrentUserEntitlementFromLegacyTable(supabase, user.id);
}
