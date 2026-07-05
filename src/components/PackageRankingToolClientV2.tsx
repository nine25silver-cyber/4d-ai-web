'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import Link from 'next/link';
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
  boxed: string;
  count: number;
  latestDate: string;
  sampleNumbers: string[];
  providers: string[];
  groupType: '24' | '12' | '6' | '4';
  currentGapDays: number;
  historicalMaxGapDays?: number;
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
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [rewardCredits, setRewardCredits] = useState(0);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [range, setRange] = useState<RangeValue>('6m');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('region');
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(() => new Set(['west']));
  const [selectedProvider, setSelectedProvider] = useState(() => providers[0]?.code ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<RankingResponse | null>(null);
  const [packageType, setPackageType] = useState<PackageType>('ABCD');
  const [trendMode, setTrendMode] = useState<TrendMode>('hot');
  const [prizeScope, setPrizeScope] = useState<Set<PrizeFilter>>(() => new Set(['top']));
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const providerCodes = useMemo(() => new Set(providers.map((provider) => provider.code)), [providers]);
  const providerByCode = useMemo(() => new Map(providers.map((provider) => [provider.code, provider])), [providers]);
  const activeProviderCodes = useMemo(() => {
    if (scopeMode === 'provider') return selectedProvider && providerCodes.has(selectedProvider) ? [selectedProvider] : [];
    return regionGroups
      .filter((group) => selectedGroups.has(group.id))
      .flatMap((group) => group.providerCodes)
      .filter((code) => providerCodes.has(code));
  }, [providerCodes, scopeMode, selectedGroups, selectedProvider]);
  const activeScope = useMemo(() => {
    if (scopeMode === 'provider') return selectedProvider && providerCodes.has(selectedProvider) ? selectedProvider : '';
    return regionGroups.map((group) => group.id).filter((groupId) => selectedGroups.has(groupId)).join('_');
  }, [providerCodes, scopeMode, selectedGroups, selectedProvider]);

  const isFormalPro = isPaidProEntitlement(entitlement);
  const isTrial = isTrialEntitlement(entitlement);
  const canUseRanking = canAccessAiCore(entitlement) || adUnlocked;

  const selectedNames = useMemo(() => {
    if (scopeMode === 'provider') return providerByCode.get(selectedProvider)?.shortName ?? '-';
    return regionGroups
      .filter((group) => selectedGroups.has(group.id))
      .map((group) => groupLabel(group, locale))
      .join(', ');
  }, [locale, providerByCode, scopeMode, selectedGroups, selectedProvider]);

  const rangeOptions: Array<{value: RangeValue; label: string}> = [
    {value: '6m', label: locale === 'zh' ? '最近 6 个月' : locale === 'ms' ? '6 bulan terkini' : 'Last 6 months'},
    {value: '1y', label: locale === 'zh' ? '最近 1 年' : locale === 'ms' ? '1 tahun terkini' : 'Last 1 year'},
    {value: 'all', label: locale === 'zh' ? '全历史' : locale === 'ms' ? 'Semua sejarah' : 'All history'}
  ];

  const prizeOptions: Array<{value: PrizeFilter; label: string}> = [
    {value: 'top', label: locale === 'zh' ? '头二三奖' : locale === 'ms' ? 'Top 3 hadiah' : 'Top 3'},
    {value: 'special', label: locale === 'zh' ? '特别奖' : locale === 'ms' ? 'Hadiah khas' : 'Special'},
    {value: 'consolation', label: locale === 'zh' ? '安慰奖' : locale === 'ms' ? 'Hadiah saguhati' : 'Consolation'}
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
    if (!canUseRanking || activeProviderCodes.length === 0 || !activeScope) {
      setStatus('idle');
      setData(null);
      return;
    }
    setStatus('loading');
    const params = new URLSearchParams({
      mode: trendMode,
      prizeScope: prizeScopeParam,
      packageType,
      range,
      scopeType: scopeMode === 'provider' ? 'provider' : 'group',
      scope: activeScope
    });
    const response = await fetch(`/api/package-ranking?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setData(null);
      return;
    }
    setData((await response.json()) as RankingResponse);
    setStatus('done');
    setHasLoadedOnce(true);
  }, [activeProviderCodes.length, activeScope, canUseRanking, packageType, prizeScopeParam, range, scopeMode, trendMode]);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    void runRanking();
  }, [hasLoadedOnce, packageType, prizeScopeParam, range, runRanking, scopeMode, selectedGroups, selectedProvider, trendMode]);

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

  function toggleGroup(groupId: string) {
    setSelectedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
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
  const coldSummaryText = trendMode === 'cold' && data?.coldSummary?.longestGapDays
    ? coldSummaryLabel(locale, data.coldSummary.longestGapDays)
    : '';

  return (
    <section className="mt-8 grid items-start gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '时间范围' : locale === 'ms' ? 'Julat masa' : 'Date range'}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {rangeOptions.map((item) => (
            <button key={item.value} type="button" onClick={() => setRange(item.value)} className={`rounded-md border px-3 py-2 text-xs font-black ${range === item.value ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <section className="mt-5">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '统计范围' : locale === 'ms' ? 'Skop statistik' : 'Statistics scope'}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setScopeMode('region')} className={`rounded-md border px-3 py-2 text-xs font-black ${scopeMode === 'region' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
              {locale === 'zh' ? '地区组合' : locale === 'ms' ? 'Gabungan kawasan' : 'Region groups'}
            </button>
            <button type="button" onClick={() => setScopeMode('provider')} className={`rounded-md border px-3 py-2 text-xs font-black ${scopeMode === 'provider' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>
              {locale === 'zh' ? '单家公司' : locale === 'ms' ? 'Satu syarikat' : 'Single company'}
            </button>
          </div>

          {scopeMode === 'region' ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {regionGroups.map((group) => {
                const active = selectedGroups.has(group.id);
                return (
                  <button key={group.id} type="button" onClick={() => toggleGroup(group.id)} aria-pressed={active} className={`min-h-[64px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
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
          <p className="mt-3 text-xs font-semibold text-slate-500">{locale === 'zh' ? '已选择' : locale === 'ms' ? 'Dipilih' : 'Selected'}: <span className="text-slate-800">{selectedNames || '-'}</span></p>
        </section>

        <section className="mt-5">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '冷热模式' : locale === 'ms' ? 'Mod trend' : 'Trend mode'}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={!canUseRanking} onClick={() => setTrendMode('hot')} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${trendMode === 'hot' ? 'border-red-700 bg-red-700 text-white' : 'border-red-200 bg-white text-red-800 hover:bg-red-50'}`}>{locale === 'zh' ? '最热门' : locale === 'ms' ? 'Paling panas' : 'Hottest'}</button>
            <button type="button" disabled={!canUseRanking} onClick={() => setTrendMode('cold')} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${trendMode === 'cold' ? 'border-blue-700 bg-blue-800 text-white' : 'border-blue-200 bg-white text-blue-800 hover:bg-blue-50'}`}>{locale === 'zh' ? '最冷门' : locale === 'ms' ? 'Paling sejuk' : 'Coldest'}</button>
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '奖项范围' : locale === 'ms' ? 'Skop hadiah' : 'Prize scope'}</h2>
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

        <section className="mt-4">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '包字类型' : locale === 'ms' ? 'Jenis boxed' : 'Boxed type'}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {packageOptions.map((item) => {
              const active = packageType === item.value;
              return (
                <button key={item.value} type="button" disabled={!canUseRanking} onClick={() => setPackageType(item.value)} className={`rounded-md border px-3 py-1.5 text-xs font-black disabled:opacity-60 ${active ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}>{item.label}</button>
              );
            })}
          </div>
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
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard title={locale === 'zh' ? '已扫描期数' : locale === 'ms' ? 'Cabutan discan' : 'Draws scanned'} value={`${data.drawCount}`} />
              <SummaryCard title={locale === 'zh' ? '已扫描号码' : locale === 'ms' ? 'Nombor discan' : 'Numbers scanned'} value={`${data.numberCount}`} />
              <SummaryCard title={locale === 'zh' ? '包字条目' : locale === 'ms' ? 'Entri boxed' : 'Boxed entries'} value={`${data.rankings.length}`} />
            </div>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? '包字排行榜（Top 50）' : locale === 'ms' ? 'Ranking Boxed (Top 50)' : 'Boxed Ranking (Top 50)'}</h2>
              {coldSummaryText ? <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">{coldSummaryText}</p> : null}
              <div className="mt-4 space-y-2">
                {data.rankings.map((row, index) => (
                  <div key={`${row.boxed}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-lg font-black text-slate-950">#{index + 1} {row.boxed}</div>
                      <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">{locale === 'zh' ? `${row.groupType}包` : locale === 'ms' ? `Kumpulan ${row.groupType}` : `${row.groupType}-group`}</div>
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-700">{locale === 'zh' ? `出现 ${row.count} 次` : locale === 'ms' ? `${row.count} kali` : `${row.count} hits`}</div>
                    <div className="mt-1 text-xs text-slate-500">{locale === 'zh' ? `最近日期: ${row.latestDate || '-'}` : locale === 'ms' ? `Tarikh terkini: ${row.latestDate || '-'}` : `Latest date: ${row.latestDate || '-'}`}</div>
                    {trendMode === 'cold' ? <div className="mt-1 text-xs font-bold text-blue-700">{locale === 'zh' ? `当前间隔: ${row.currentGapDays} 天` : locale === 'ms' ? `Jarak semasa: ${row.currentGapDays} hari` : `Current gap: ${row.currentGapDays} days`}</div> : null}
                    {row.sampleNumbers.length > 0 ? (
                      <div className="mt-1 text-xs text-slate-500">{locale === 'zh' ? `样本号码: ${row.sampleNumbers.join(', ')}` : locale === 'ms' ? `Contoh nombor: ${row.sampleNumbers.join(', ')}` : `Sample numbers: ${row.sampleNumbers.join(', ')}`}</div>
                    ) : null}
                  </div>
                ))}
              </div>
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

function coldSummaryLabel(locale: Locale, days: number) {
  if (locale === 'zh') return `此类型组合最久曾经 ${days} 天才开出`;
  if (locale === 'ms') return `Jenis kombinasi ini pernah mengambil masa ${days} hari untuk keluar.`;
  return `This combination type once took ${days} days to appear.`;
}

function SummaryCard({title, value}: {title: string; value: string}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase text-blue-800">{title}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}
