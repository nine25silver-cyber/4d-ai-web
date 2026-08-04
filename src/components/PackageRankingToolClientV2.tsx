'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {canAccessAiCore, getCurrentUserEntitlement, isPaidProEntitlement, isTrialEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {
  addRewardCredit,
  consumeRewardCredit,
  getFeatureUnlockRemainingMinutes,
  isFeatureUnlockedNow,
  readRewardState,
  subscribeRewardState,
  unlockFeatureForMinutes
} from '@/lib/reward-unlock';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type RankingRow = {
  rank?: number;
  boxed: string;
  count: number;
  latestDate: string;
  sampleNumbers: string[];
  providers: string[];
  groupType: '24' | '12' | '6' | '4';
  currentGapDays: number;
  currentGapDraws?: number;
  historicalMaxGapDays?: number;
  historicalMaxGapDraws?: number;
};

type RankingResponse = {
  drawCount: number;
  numberCount: number;
  rankings: RankingRow[];
  coldSummary?: {
    longestGapDays?: number;
    longestGapDraws?: number;
    combinationKey: string;
    description: string;
  };
};

type RankingLabels = {
  occurrences: string;
  occurrenceUnit: string;
  currentGap: string;
  historicalMaxGap: string;
  days: string;
  draws: string;
  latestSeen: string;
  viewDetails: string;
  hideDetails: string;
  prizeWinsTitle: string;
  coldSummaryTitle: string;
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
};

type PrizeFilter = 'top' | 'special' | 'consolation';
type TrendMode = 'hot' | 'cold';
type RangeValue = '6m' | '1y' | 'all';
type ScopeMode = 'region' | 'provider';
type PackageType = 'ABCD' | 'AABC' | 'AABB' | 'AAAB';

const regionGroups = [
  {id: 'west', zh: '西马', ms: 'Malaysia Barat', en: 'West Malaysia', providerCodes: ['magnum', 'sports_toto', 'da_ma_cai']},
  {id: 'east', zh: '东马', ms: 'Malaysia Timur', en: 'East Malaysia', providerCodes: ['sabah88', 'sarawak', 'sandakan']},
  {id: 'cambodia', zh: '柬埔寨', ms: 'Kemboja', en: 'Cambodia', providerCodes: ['grand_dragon', 'nine_lotto']},
  {id: 'singapore', zh: '新加坡', ms: 'Singapura', en: 'Singapore', providerCodes: ['singapore']}
] as const;

export function PackageRankingToolClientV2({locale, providers}: Props) {
  const t = useTranslations('PackageRanking');
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [rewardCredits, setRewardCredits] = useState(0);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [range, setRange] = useState<RangeValue>('6m');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('region');
  const [selectedGroup, setSelectedGroup] = useState('west');
  const [selectedProvider, setSelectedProvider] = useState(() => providers[0]?.code ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<RankingResponse | null>(null);
  const [packageType, setPackageType] = useState<PackageType>('ABCD');
  const [trendMode, setTrendMode] = useState<TrendMode>('hot');
  const [prizeScope, setPrizeScope] = useState<Set<PrizeFilter>>(() => new Set(['top']));
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const requestIdRef = useRef(0);

  const providerCodes = useMemo(() => new Set(providers.map((provider) => provider.code)), [providers]);
  const providerByCode = useMemo(() => new Map(providers.map((provider) => [provider.code, provider])), [providers]);
  const activeProviderCodes = useMemo(() => {
    if (scopeMode === 'provider') return selectedProvider && providerCodes.has(selectedProvider) ? [selectedProvider] : [];
    const group = regionGroups.find((item) => item.id === selectedGroup);
    return group ? group.providerCodes.filter((code) => providerCodes.has(code)) : [];
  }, [providerCodes, scopeMode, selectedGroup, selectedProvider]);
  const activeScope = useMemo(() => {
    if (scopeMode === 'provider') return selectedProvider && providerCodes.has(selectedProvider) ? selectedProvider : '';
    return regionGroups.some((group) => group.id === selectedGroup) ? selectedGroup : 'west';
  }, [providerCodes, scopeMode, selectedGroup, selectedProvider]);

  const isFormalPro = isPaidProEntitlement(entitlement);
  const isTrial = isTrialEntitlement(entitlement);
  const canUseRanking = canAccessAiCore(entitlement) || adUnlocked;

  const selectedNames = useMemo(() => {
    if (scopeMode === 'provider') return providerByCode.get(selectedProvider)?.shortName ?? '-';
    const group = regionGroups.find((item) => item.id === selectedGroup);
    return group ? groupLabel(group, locale) : '-';
  }, [locale, providerByCode, scopeMode, selectedGroup, selectedProvider]);

  const rangeOptions: Array<{value: RangeValue; label: string}> = [
    {value: '6m', label: t('range6m')},
    {value: '1y', label: t('range1y')},
    {value: 'all', label: t('rangeAll')}
  ];

  const prizeOptions: Array<{value: PrizeFilter; label: string}> = [
    {value: 'top', label: t('prizeTop')},
    {value: 'special', label: t('prizeSpecial')},
    {value: 'consolation', label: t('prizeConsolation')}
  ];
  const packageOptions: Array<{value: PackageType; label: string}> = [
    {value: 'ABCD', label: '24X'},
    {value: 'AABC', label: '12X'},
    {value: 'AABB', label: '6X'},
    {value: 'AAAB', label: '4X'}
  ];
  const prizeScopeParam = useMemo(() => {
    const ordered: PrizeFilter[] = ['top', 'special', 'consolation'];
    return ordered.filter((item) => prizeScope.has(item)).join(',');
  }, [prizeScope]);

  const runRanking = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    if (!canUseRanking || activeProviderCodes.length === 0 || !activeScope) {
      setStatus('idle');
      setData(null);
      return;
    }
    setStatus('loading');
    setData(null);
    const params = new URLSearchParams({
      mode: trendMode,
      prizeScope: prizeScopeParam,
      packageType,
      range,
      scopeType: scopeMode === 'provider' ? 'provider' : 'group',
      scope: activeScope
    });
    const response = await fetch(`/api/package-ranking?${params.toString()}`, {cache: 'no-store'});
    if (requestId !== requestIdRef.current) return;
    if (!response.ok) {
      setStatus('error');
      setData(null);
      return;
    }
    const payload = (await response.json()) as RankingResponse;
    if (requestId !== requestIdRef.current) return;
    setData(payload);
    setStatus('done');
    setHasLoadedOnce(true);
  }, [activeProviderCodes.length, activeScope, canUseRanking, packageType, prizeScopeParam, range, scopeMode, trendMode]);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    void runRanking();
  }, [hasLoadedOnce, packageType, prizeScopeParam, range, runRanking, scopeMode, selectedGroup, selectedProvider, trendMode]);

  useEffect(() => {
    setExpandedItems(new Set());
  }, [packageType, prizeScopeParam, range, scopeMode, selectedGroup, selectedProvider, trendMode]);

  useEffect(() => {
    initMemberState();
    setMemberState(readMemberState());
    return subscribeMemberState(setMemberState);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadEntitlement = async () => {
      setEntitlementLoading(true);
      const next = await getCurrentUserEntitlement();
      if (!cancelled) {
        setEntitlement(next);
        setEntitlementLoading(false);
      }
    };
    void loadEntitlement();
    const unsubscribe = subscribeMemberState(() => {
      void loadEntitlement();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setRewardCredits(readRewardState().package_ranking ?? 0);
      const active = isFeatureUnlockedNow('package_ranking');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('package_ranking'));
    };
    update();
    return subscribeRewardState((state) => {
      setRewardCredits(state.package_ranking ?? 0);
      const active = isFeatureUnlockedNow('package_ranking');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('package_ranking'));
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const active = isFeatureUnlockedNow('package_ranking');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('package_ranking'));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  function unlockByRewardedAd() {
    addRewardCredit('package_ranking', 1);
    if (consumeRewardCredit('package_ranking', 1)) {
      unlockFeatureForMinutes('package_ranking', 30);
      setAdUnlocked(true);
      setUnlockMinutesLeft(30);
    }
  }

  function selectGroup(groupId: string) {
    if (!regionGroups.some((group) => group.id === groupId)) return;
    requestIdRef.current += 1;
    setSelectedGroup(groupId);
    setData(null);
  }

  function togglePrizeScope(value: PrizeFilter) {
    setPrizeScope((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        if (next.size === 1) return current;
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function selectTrendMode(nextMode: TrendMode) {
    requestIdRef.current += 1;
    setTrendMode(nextMode);
    if (nextMode === 'cold') {
      setRange('all');
    }
    setData(null);
  }

  function selectRange(nextRange: RangeValue) {
    if (trendMode === 'cold' && nextRange !== 'all') return;
    requestIdRef.current += 1;
    setRange(nextRange);
    setData(null);
  }

  function toggleExpandedItem(itemKey: string) {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  }

  const unlockedAccessText = locale === 'zh' ? '当前已解锁，可直接使用' : locale === 'ms' ? 'Akses sudah dibuka dan sedia digunakan' : 'Currently unlocked and ready to use';
  const accessBadgeText = isFormalPro
    ? (locale === 'zh' ? 'Pro 已激活' : locale === 'ms' ? 'Pro aktif' : 'Pro active')
    : isTrial
      ? (locale === 'zh' ? 'Trial 已激活' : locale === 'ms' ? 'Trial aktif' : 'Trial active')
      : (locale === 'zh' ? '广告临时解锁' : locale === 'ms' ? 'Buka sementara melalui iklan' : 'Temporary ad unlock');
  const lockedAccessText = locale === 'zh' ? '包字排行榜开放给 Pro 会员，或观看广告后临时解锁。' : locale === 'ms' ? 'Ranking boxed untuk Pro, atau buka sementara melalui iklan.' : 'Package ranking is for Pro, or temporary ad unlock.';
  const rewardCreditsText = locale === 'zh' ? `可用广告解锁次数：${rewardCredits}` : locale === 'ms' ? `Kredit buka iklan tersedia: ${rewardCredits}` : `Available rewarded unlock credits: ${rewardCredits}`;
  const adUnlockRemainingText = locale === 'zh' ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟` : locale === 'ms' ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit` : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`;
  const noProviderText = locale === 'zh' ? '请选择至少一个统计范围。' : locale === 'ms' ? 'Pilih sekurang-kurangnya satu skop.' : 'Choose at least one scope.';
  const isColdMode = trendMode === 'cold';
  const resultLabels = rankingLabels(t);

  return (
    <section className="mt-8 grid items-start gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <h2 className="text-sm font-black text-slate-800">{t('packageTypeLabel')}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {packageOptions.map((item) => {
                const active = packageType === item.value;
                return (
                  <button key={item.value} type="button" disabled={!canUseRanking} onClick={() => setPackageType(item.value)} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${active ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>{item.label}</button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <h2 className="text-sm font-black text-slate-800">{t('trendModeLabel')}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={!canUseRanking} onClick={() => selectTrendMode('hot')} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${trendMode === 'hot' ? 'border-red-700 bg-red-700 text-white' : 'border-red-200 bg-white text-red-800 hover:bg-red-50'}`}>{t('hotMode')}</button>
              <button type="button" disabled={!canUseRanking} onClick={() => selectTrendMode('cold')} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${trendMode === 'cold' ? 'border-blue-700 bg-blue-800 text-white' : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50'}`}>{t('coldMode')}</button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-black text-slate-800">{t('prizeRangeLabel')}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {prizeOptions.map((item) => {
              const active = prizeScope.has(item.value);
              const activeClass = item.value === 'top'
                ? 'border-red-700 bg-red-700 text-white'
                : 'border-blue-600 bg-blue-100 text-blue-900';
              const idleClass = item.value === 'top'
                ? 'border-red-200 bg-white text-red-800 hover:bg-red-50'
                : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50';
              return (
                <button key={item.value} type="button" disabled={!canUseRanking} onClick={() => togglePrizeScope(item.value)} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${active ? activeClass : idleClass}`}>{item.label}</button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-black text-slate-800">{t('statisticsRangeLabel')}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setScopeMode('region')} className={`rounded-md border px-3 py-2 text-xs font-black ${scopeMode === 'region' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
              {t('scopeRegionGroups')}
            </button>
            <button type="button" onClick={() => setScopeMode('provider')} className={`rounded-md border px-3 py-2 text-xs font-black ${scopeMode === 'provider' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
              {t('scopeSingleProvider')}
            </button>
          </div>

          {scopeMode === 'region' ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {regionGroups.map((group) => {
                const active = selectedGroup === group.id;
                return (
                  <button key={group.id} type="button" onClick={() => selectGroup(group.id)} aria-pressed={active} className={`min-h-[64px] rounded-lg border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                    <span className="block text-sm font-black text-slate-950">{groupLabel(group, locale)}</span>
                    <span className="mt-1 block text-[11px] font-bold leading-4 text-slate-500">{group.providerCodes.filter((code) => providerCodes.has(code)).map((code) => providerByCode.get(code)?.shortName ?? code).join(' + ')}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {providers.map((provider) => {
                const active = selectedProvider === provider.code;
                return (
                  <button key={provider.code} type="button" onClick={() => setSelectedProvider(provider.code)} aria-pressed={active} className={`min-h-[76px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                    <ProviderLogoBadge provider={provider} active={active} />
                    <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs font-semibold text-slate-500">{t('selectedLabel')}: <span className="text-slate-800">{selectedNames || '-'}</span></p>
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-black text-slate-800">{t('timeRangeLabel')}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {rangeOptions.map((item) => {
              const disabled = isColdMode && item.value !== 'all';
              return (
                <button
                  key={item.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectRange(item.value)}
                  className={`rounded-md border px-3 py-2 text-xs font-black disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${
                    range === item.value ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'
                  }`}
                  aria-disabled={disabled}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          {isColdMode ? <p className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">{t('coldAllHistoryNote')}</p> : null}
        </section>

        <button type="button" disabled={!canUseRanking || activeProviderCodes.length === 0 || !activeScope} onClick={() => void runRanking()} className="mt-5 w-full rounded-md border border-blue-700 bg-blue-800 px-4 py-3 text-sm font-black text-white hover:bg-blue-900 disabled:opacity-60">
          {status === 'loading' ? (locale === 'zh' ? '统计中...' : locale === 'ms' ? 'Sedang kira...' : 'Calculating...') : (locale === 'zh' ? '统计包字排行榜' : locale === 'ms' ? 'Kira ranking boxed' : 'Calculate boxed ranking')}
        </button>
      </section>

      <section className="grid self-start content-start gap-5">
        <div className={`self-start rounded-lg border px-4 py-3 shadow-sm ${canUseRanking ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-bold ${canUseRanking ? 'text-blue-900' : 'text-amber-900'}`}>{canUseRanking ? unlockedAccessText : lockedAccessText}</p>
              <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${canUseRanking ? 'text-blue-800' : 'text-amber-800'}`}>
                {canUseRanking ? <span>{accessBadgeText}</span> : null}
                {!canUseRanking && entitlementLoading ? <span>{locale === 'zh' ? '正在确认会员权限' : locale === 'ms' ? 'Sedang semak akses ahli' : 'Checking membership access'}</span> : null}
                <span>{rewardCreditsText}</span>
                {unlockMinutesLeft > 0 ? <span>{adUnlockRemainingText}</span> : null}
              </div>
            </div>
            {!canUseRanking ? (
              <div className="flex flex-wrap gap-2">
                {!memberState?.loggedIn ? (
                  <button type="button" onClick={() => void loginUser(locale)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100">
                    {locale === 'zh' ? '立即登录' : locale === 'ms' ? 'Log masuk' : 'Login now'}
                  </button>
                ) : null}
                <button type="button" onClick={unlockByRewardedAd} className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-black text-amber-900 hover:bg-amber-100">
                  {locale === 'zh' ? '观看广告并解锁30分钟' : locale === 'ms' ? 'Tonton iklan & buka 30 minit' : 'Watch ad and unlock for 30 minutes'}
                </button>
                <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900">
                  {locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'}
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {!canUseRanking ? (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
            <p>{locale === 'zh' ? '包字排行榜需要 Pro，或观看广告解锁后使用。' : locale === 'ms' ? 'Ranking boxed memerlukan Pro atau buka kunci melalui iklan.' : 'Package ranking requires Pro or ad unlock.'}</p>
            <p className="mt-1">{locale === 'zh' ? '观看一次广告可解锁 30 分钟。' : locale === 'ms' ? 'Satu iklan membuka akses selama 30 minit.' : 'One rewarded ad unlocks access for 30 minutes.'}</p>
          </div>
        ) : null}

        {activeProviderCodes.length === 0 || !activeScope ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{noProviderText}</div> : null}
        {status === 'idle' && activeProviderCodes.length > 0 && activeScope ? <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">{locale === 'zh' ? '选择时间范围与统计范围后开始统计。' : locale === 'ms' ? 'Pilih julat masa dan skop, kemudian mula kira.' : 'Choose a date range and scope, then start calculation.'}</div> : null}
        {status === 'error' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{locale === 'zh' ? '包字排行榜暂时不可用。' : locale === 'ms' ? 'Ranking boxed belum tersedia.' : 'Boxed ranking is unavailable right now.'}</div> : null}

        {data ? (
          <>
            <section className="rounded-lg bg-slate-50 p-3">
              <div className="rounded-md bg-[#1e3a8a] px-3 py-2.5 text-white">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] ${trendMode === 'cold' ? 'bg-sky-200 text-[#0f2f5f]' : 'bg-[#d4af37] text-slate-950'}`}>
                      {trendMode === 'cold' ? 'COLD' : 'HOT'}
                    </span>
                    <p className="text-sm font-black text-white">{trendMode === 'cold' ? t('coldSectionTitle') : t('hotSectionTitle')}</p>
                  </div>
                  {trendMode === 'cold' ? (
                    <span className="w-fit rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-black text-white">{t('rangeAll')}</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {rangeOptions.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => selectRange(item.value)}
                          className={`rounded-md px-2.5 py-1.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
                            range === item.value ? 'bg-[#d4af37] text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                          aria-pressed={range === item.value}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {trendMode === 'cold' && data.coldSummary ? <ColdSummary summary={data.coldSummary} labels={resultLabels} /> : null}
              <RankingPanel
                rows={data.rankings}
                rankingType={trendMode}
                labels={resultLabels}
                expandedItems={expandedItems}
                onToggleExpanded={toggleExpandedItem}
              />
            </section>
          </>
        ) : null}
      </section>
    </section>
  );
}

function groupLabel(group: (typeof regionGroups)[number], locale: Locale) {
  if (locale === 'zh') return group.zh;
  if (locale === 'ms') return group.ms;
  return group.en;
}

function RankingPanel({rows, rankingType, labels, expandedItems, onToggleExpanded}: {
  rows: RankingRow[];
  rankingType: TrendMode;
  labels: RankingLabels;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
}) {
  return (
    <div className="mt-3 grid gap-2">
      {rows.slice(0, 50).map((row, index) => {
        const rank = row.rank ?? index + 1;
        const itemKey = `${rankingType}-${row.boxed}-${rank}`;
        const expanded = expandedItems.has(itemKey);
        return (
          <article key={itemKey} className="overflow-hidden rounded-md bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? labels.hideDetails : labels.viewDetails}
              onClick={() => onToggleExpanded(itemKey)}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#1e3a8a] text-xs font-black text-white">#{rank}</span>
                <span className="font-mono text-3xl font-black leading-none tracking-normal text-slate-950">{row.boxed}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <CompactMetric row={row} rankingType={rankingType} labels={labels} />
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 border-b-2 border-r-2 border-slate-400 transition ${expanded ? '-rotate-135' : 'rotate-45'}`}
                />
              </span>
            </button>

            {expanded ? (
              <div className="border-t border-slate-100 bg-slate-50/70 px-3 pb-3 pt-3">
                <RankingItemDetails row={row} rankingType={rankingType} labels={labels} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function CompactMetric({row, rankingType, labels}: {row: RankingRow; rankingType: TrendMode; labels: RankingLabels}) {
  if (rankingType === 'cold') {
    return (
      <span className="flex flex-wrap justify-end gap-1.5 text-xs font-black">
        <span className="rounded-md bg-blue-50 px-2 py-1 text-[#1e3a8a]">{formatNumber(row.currentGapDays)} {labels.days}</span>
        {hasNumber(row.currentGapDraws) ? <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{formatNumber(row.currentGapDraws)} {labels.draws}</span> : null}
      </span>
    );
  }
  return (
    <span className="text-right">
      <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.occurrences}</span>
      <span className="text-base font-black text-[#9f7b12]">{formatNumber(row.count)} {labels.occurrenceUnit}</span>
    </span>
  );
}

function RankingItemDetails({row, rankingType, labels}: {row: RankingRow; rankingType: TrendMode; labels: RankingLabels}) {
  return (
    <div className="grid gap-2 text-xs font-bold text-slate-600">
      {rankingType === 'cold' ? (
        <div className="rounded-md bg-white px-2.5 py-2">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.occurrences}</p>
          <p className="mt-0.5 text-sm font-black text-slate-900">{formatNumber(row.count)} {labels.occurrenceUnit}</p>
        </div>
      ) : (
        <Metric label={labels.currentGap} days={row.currentGapDays} draws={row.currentGapDraws} labels={labels} />
      )}
      <Metric label={labels.historicalMaxGap} days={row.historicalMaxGapDays} draws={row.historicalMaxGapDraws} labels={labels} />
      <div className="rounded-md bg-white px-2.5 py-2">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.prizeWinsTitle}</p>
        <p className="mt-0.5 text-sm font-black text-slate-900">{formatNumber(row.count)} {labels.occurrenceUnit}</p>
      </div>
      <p className="text-xs font-bold text-slate-500">
        {labels.latestSeen}: {row.latestDate || '-'}
      </p>
    </div>
  );
}

function Metric({label, days, draws, labels}: {label: string; days?: number; draws?: number; labels: RankingLabels}) {
  return (
    <div className="rounded-md bg-white px-2.5 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-black text-slate-900">
        {formatNumber(days)} {labels.days}{hasNumber(draws) ? ` / ${formatNumber(draws)} ${labels.draws}` : ''}
      </p>
    </div>
  );
}

function ColdSummary({summary, labels}: {summary: NonNullable<RankingResponse['coldSummary']>; labels: RankingLabels}) {
  if (!summary.combinationKey) return null;
  return (
    <div className="mt-3 rounded-md bg-[#1e3a8a] p-3 text-white">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/70">{labels.coldSummaryTitle}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="font-mono text-3xl font-black tracking-normal">{summary.combinationKey}</span>
        <span className="text-right text-sm font-black">
          {formatNumber(summary.longestGapDays)} {labels.days}
          {hasNumber(summary.longestGapDraws) ? <span className="block text-xs text-white/70">{formatNumber(summary.longestGapDraws)} {labels.draws}</span> : null}
        </span>
      </div>
    </div>
  );
}

function rankingLabels(t: (key: string) => string): RankingLabels {
  return {
    occurrences: t('occurrences'),
    occurrenceUnit: t('occurrenceUnit'),
    currentGap: t('currentGap'),
    historicalMaxGap: t('historicalMaxGap'),
    days: t('days'),
    draws: t('draws'),
    latestSeen: t('latestSeen'),
    viewDetails: t('viewDetails'),
    hideDetails: t('hideDetails'),
    prizeWinsTitle: t('prizeWinsTitle'),
    coldSummaryTitle: t('coldSummaryTitle')
  };
}

function formatNumber(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '-';
}

function hasNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
