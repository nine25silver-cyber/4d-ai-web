'use client';

export type RewardFeature = 'ad_access_4d' | 'ad_access_3d' | 'ai_full' | 'hot_cold' | 'package_ranking';
export type AdAccessRewardFeature = Extract<RewardFeature, 'ad_access_4d' | 'ad_access_3d'>;

type RewardState = {
  ad_access_4d: number;
  ad_access_3d: number;
  ai_full: number;
  hot_cold: number;
  package_ranking: number;
  unlocked_until_ad_access_4d?: string;
  unlocked_until_ad_access_3d?: string;
  unlocked_until_ai_full?: string;
  unlocked_until_hot_cold?: string;
  unlocked_until_package_ranking?: string;
};

const STORAGE_KEY = 'four_d_ai_reward_unlock_v1';
const EVENT_NAME = 'four-d-ai-reward-unlock-updated';
export const REWARD_AD_ACCESS_MINUTES = 180;

function defaultState(): RewardState {
  return {
    ad_access_4d: 0,
    ad_access_3d: 0,
    ai_full: 0,
    hot_cold: 0,
    package_ranking: 0,
    unlocked_until_ad_access_4d: undefined,
    unlocked_until_ad_access_3d: undefined,
    unlocked_until_ai_full: undefined,
    unlocked_until_hot_cold: undefined,
    unlocked_until_package_ranking: undefined
  };
}

export function readRewardState(): RewardState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<RewardState>;
    return {
      ad_access_4d: Number.isFinite(parsed.ad_access_4d) ? Math.max(0, Number(parsed.ad_access_4d)) : 0,
      ad_access_3d: Number.isFinite(parsed.ad_access_3d) ? Math.max(0, Number(parsed.ad_access_3d)) : 0,
      ai_full: Number.isFinite(parsed.ai_full) ? Math.max(0, Number(parsed.ai_full)) : 0,
      hot_cold: Number.isFinite(parsed.hot_cold) ? Math.max(0, Number(parsed.hot_cold)) : 0,
      package_ranking: Number.isFinite(parsed.package_ranking) ? Math.max(0, Number(parsed.package_ranking)) : 0,
      unlocked_until_ad_access_4d: typeof parsed.unlocked_until_ad_access_4d === 'string' ? parsed.unlocked_until_ad_access_4d : undefined,
      unlocked_until_ad_access_3d: typeof parsed.unlocked_until_ad_access_3d === 'string' ? parsed.unlocked_until_ad_access_3d : undefined,
      unlocked_until_ai_full: typeof parsed.unlocked_until_ai_full === 'string' ? parsed.unlocked_until_ai_full : undefined,
      unlocked_until_hot_cold: typeof parsed.unlocked_until_hot_cold === 'string' ? parsed.unlocked_until_hot_cold : undefined,
      unlocked_until_package_ranking: typeof parsed.unlocked_until_package_ranking === 'string' ? parsed.unlocked_until_package_ranking : undefined
    };
  } catch {
    return defaultState();
  }
}

function writeRewardState(next: RewardState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function addRewardCredit(feature: RewardFeature, amount = 1) {
  const current = readRewardState();
  writeRewardState({
    ...current,
    [feature]: Math.max(0, (current[feature] ?? 0) + amount)
  });
}

export function consumeRewardCredit(feature: RewardFeature, amount = 1): boolean {
  const current = readRewardState();
  const available = current[feature] ?? 0;
  if (available < amount) return false;
  writeRewardState({
    ...current,
    [feature]: available - amount
  });
  return true;
}

function unlockUntilKey(feature: RewardFeature): 'unlocked_until_ad_access_4d' | 'unlocked_until_ad_access_3d' | 'unlocked_until_ai_full' | 'unlocked_until_hot_cold' | 'unlocked_until_package_ranking' {
  if (feature === 'ad_access_4d') return 'unlocked_until_ad_access_4d';
  if (feature === 'ad_access_3d') return 'unlocked_until_ad_access_3d';
  if (feature === 'ai_full') return 'unlocked_until_ai_full';
  if (feature === 'hot_cold') return 'unlocked_until_hot_cold';
  return 'unlocked_until_package_ranking';
}

export function unlockFeatureForMinutes(feature: RewardFeature, minutes: number): string {
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;
  const until = new Date(Date.now() + safeMinutes * 60_000).toISOString();
  const current = readRewardState();
  const key = unlockUntilKey(feature);
  writeRewardState({
    ...current,
    [key]: until
  });
  return until;
}

export function grantRewardedAdAccess(feature: AdAccessRewardFeature): string {
  return unlockFeatureForMinutes(feature, REWARD_AD_ACCESS_MINUTES);
}

export function isFeatureUnlockedNow(feature: RewardFeature): boolean {
  const state = readRewardState();
  const key = unlockUntilKey(feature);
  const raw = state[key];
  if (!raw) return false;
  const ts = Date.parse(raw);
  if (Number.isNaN(ts)) return false;
  return ts > Date.now();
}

export function getFeatureUnlockRemainingMinutes(feature: RewardFeature): number {
  const state = readRewardState();
  const key = unlockUntilKey(feature);
  const raw = state[key];
  if (!raw) return 0;
  const ts = Date.parse(raw);
  if (Number.isNaN(ts)) return 0;
  const diff = ts - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 60_000);
}

export function subscribeRewardState(onChange: (state: RewardState) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => onChange(readRewardState());
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange(readRewardState());
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
