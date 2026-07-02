'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {initMemberState, loginUser, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
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

type TrendNumber = {
  number: string;
  count: number;
  rank?: number;
  providers: string[];
  latestDate: string;
  latestDrawNo?: string;
  distanceDays?: number | null;
  distanceDraws?: number | null;
};

type DigitCount = {
  digit: string;
  count: number;
};

type ProviderSummary = {
  providerCode: string;
  providerName: string;
  drawCount: number;
  numberCount: number;
};

type TrendResponse = {
  range: string;
  mode: TrendKind;
  from: string;
  to: string;
  drawCount: number;
  numberCount: number;
  top3Only: boolean;
  hotNumbers: TrendNumber[];
  coldNumbers: TrendNumber[];
  digitCounts: DigitCount[];
  providerSummaries: ProviderSummary[];
};

type TrendKind = 'hot' | 'cold';
type TrendRange = '1y' | '2y' | '3y' | '5y' | '10y' | '15y' | '20y' | 'all';

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
  initialTrendKind: TrendKind;
  labels: {
    rangeLabel: string;
    range1y: string;
    range2y: string;
    range3y: string;
    range5y: string;
    range10y: string;
    range15y: string;
    range20y: string;
    rangeAll: string;
    providerSelectTitle: string;
    providerSelectText: string;
    calculating: string;
    noTrendYet: string;
    trendError: string;
    summaryTitle: string;
    drawsScanned: string;
    numbersScanned: string;
    hotNumbersTitle: string;
    coldNumbersTitle: string;
    digitFrequencyTitle: string;
    providerSummaryTitle: string;
    timesLabel: string;
    latestDateLabel: string;
    providersLabel: string;
    noTrendResults: string;
  };
};

export function HotColdToolClient({locale, providers, initialTrendKind, labels}: Props) {
  const defaultProvider = providers.find((provider) => provider.code === 'magnum') ?? providers[0];
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [rewardCredits, setRewardCredits] = useState(0);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [range, setRange] = useState<TrendRange>('all');
  const [selectedProviderCode, setSelectedProviderCode] = useState(defaultProvider?.code ?? '');
  const [top3Only, setTop3Only] = useState(false);
  const [providerMenuOpen, setProviderMenuOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.code === selectedProviderCode) ?? defaultProvider,
    [defaultProvider, providers, selectedProviderCode]
  );
  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;
  const canUseTrend = isFormalPro || adUnlocked;
  const unlockedAccessText = locale === 'zh'
    ? '当前已解锁，可直接使用'
    : locale === 'ms'
      ? 'Akses sudah dibuka dan sedia digunakan'
      : 'Currently unlocked and ready to use';
  const accessBadgeText = isFormalPro
    ? (locale === 'zh' ? 'Pro 已激活' : locale === 'ms' ? 'Pro aktif' : 'Pro active')
    : (locale === 'zh' ? '广告临时解锁' : locale === 'ms' ? 'Buka sementara melalui iklan' : 'Temporary ad unlock');
  const rewardCreditsText = locale === 'zh'
    ? `可用广告解锁次数：${rewardCredits}`
    : locale === 'ms'
      ? `Kredit buka iklan tersedia: ${rewardCredits}`
      : `Available rewarded unlock credits: ${rewardCredits}`;
  const adUnlockRemainingText = locale === 'zh'
    ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟`
    : locale === 'ms'
      ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit`
      : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`;
  const compactLockedAccessText = entitlementLoading
    ? (locale === 'zh' ? '正在确认会员权限；也可通过广告临时解锁。' : locale === 'ms' ? 'Sedang menyemak akses ahli; iklan masih boleh membuka akses sementara.' : 'Checking membership access; ad unlock remains available.')
    : (locale === 'zh' ? '热门/冷门走势开放给 Pro 会员，或观看广告后临时解锁。' : locale === 'ms' ? 'Trend panas/sejuk untuk ahli Pro, atau buka sementara melalui iklan.' : 'Hot/Cold trends are for Pro, or temporary ad unlock.');
  const top3ToggleLabel = locale === 'zh' ? '只显示第一、二、三奖' : locale === 'ms' ? 'Hanya hadiah pertama, kedua dan ketiga' : 'First, second and third prize only';
  const top3OffText = locale === 'zh' ? '关闭：包含特别奖与安慰奖' : locale === 'ms' ? 'Tutup: termasuk hadiah khas dan saguhati' : 'Off: includes special and consolation prizes';
  const top3OnText = locale === 'zh' ? '开启：只统计头奖、二奖、三奖' : locale === 'ms' ? 'Buka: kira hadiah pertama, kedua dan ketiga sahaja' : 'On: counts first, second and third prize only';
  const rangeSummaryLabel = locale === 'zh' ? '范围说明' : locale === 'ms' ? 'Ringkasan julat' : 'Range summary';

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
    setMemberState(readMemberState());
    void refreshEntitlement();
    const unsubscribe = subscribeMemberState((next) => {
      setMemberState(next);
      void refreshEntitlement();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setRewardCredits(readRewardState().hot_cold ?? 0);
      const active = isFeatureUnlockedNow('hot_cold');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('hot_cold'));
    };
    update();
    return subscribeRewardState((state) => {
      setRewardCredits(state.hot_cold ?? 0);
      const active = isFeatureUnlockedNow('hot_cold');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('hot_cold'));
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const active = isFeatureUnlockedNow('hot_cold');
      setAdUnlocked(active);
      setUnlockMinutesLeft(getFeatureUnlockRemainingMinutes('hot_cold'));
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canUseTrend || !selectedProviderCode) {
      setStatus('idle');
      setTrend(null);
      return;
    }

    const controller = new AbortController();
    const calculateTrend = async () => {
      setStatus('loading');
      const params = new URLSearchParams({
        mode: initialTrendKind,
        range,
        provider: selectedProviderCode,
        top3Only: String(top3Only)
      });
      try {
        const response = await fetch(`/api/hot-cold?${params.toString()}`, {cache: 'no-store', signal: controller.signal});
        if (!response.ok) {
          setStatus('error');
          setTrend(null);
          return;
        }
        setTrend((await response.json()) as TrendResponse);
        setStatus('done');
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus('error');
          setTrend(null);
        }
      }
    };

    void calculateTrend();
    return () => controller.abort();
  }, [canUseTrend, initialTrendKind, range, selectedProviderCode, top3Only]);

  function unlockByRewardedAd() {
    addRewardCredit('hot_cold', 1);
    if (consumeRewardCredit('hot_cold', 1)) {
      unlockFeatureForMinutes('hot_cold', 30);
      setAdUnlocked(true);
      setUnlockMinutesLeft(30);
    }
  }

  const ranges: Array<{value: TrendRange; label: string}> = [
    {value: '1y', label: labels.range1y},
    {value: '2y', label: labels.range2y},
    {value: '3y', label: labels.range3y},
    {value: '5y', label: labels.range5y},
    {value: '10y', label: labels.range10y},
    {value: '15y', label: labels.range15y},
    {value: '20y', label: labels.range20y},
    {value: 'all', label: labels.rangeAll}
  ];
  const rangeLabel = ranges.find((item) => item.value === range)?.label ?? range;
  const prizeScopeText = top3Only ? top3OnText : top3OffText;
  const resultTitle = initialTrendKind === 'hot' ? labels.hotNumbersTitle : labels.coldNumbersTitle;
  const resultItems = trend ? (initialTrendKind === 'hot' ? trend.hotNumbers : trend.coldNumbers) : [];

  return (
    <section className="mt-8 grid items-start gap-5 xl:grid-cols-[420px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <section>
          <h2 className="text-sm font-black text-slate-800">{labels.rangeLabel}</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {ranges.map((item) => {
              const active = range === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRange(item.value)}
                  aria-pressed={active}
                  disabled={!canUseTrend}
                  className={`min-h-[42px] rounded-md border px-2 py-2 text-sm font-black transition ${
                    active ? 'border-blue-700 bg-blue-800 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5">
          <h2 className="text-sm font-black text-slate-800">{labels.providerSelectTitle}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">{labels.providerSelectText}</p>
          <div className="relative mt-3">
            <button
              type="button"
              onClick={() => setProviderMenuOpen((open) => !open)}
              disabled={!canUseTrend}
              aria-expanded={providerMenuOpen}
              className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 text-left transition hover:border-blue-400 disabled:opacity-60"
            >
              <span className="flex min-w-0 items-center gap-3">
                {selectedProvider ? <ProviderLogoBadge provider={selectedProvider} active sizeClassName="size-10" /> : null}
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-950">{selectedProvider?.name ?? '-'}</span>
                  <span className="block text-xs font-bold text-slate-500">{selectedProvider?.shortName ?? ''}</span>
                </span>
              </span>
              <span className="text-lg font-black text-slate-500" aria-hidden="true">⌄</span>
            </button>
            {providerMenuOpen ? (
              <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg">
                {providers.map((provider) => {
                  const active = provider.code === selectedProviderCode;
                  return (
                    <button
                      key={provider.code}
                      type="button"
                      onClick={() => {
                        setSelectedProviderCode(provider.code);
                        setProviderMenuOpen(false);
                      }}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left transition ${active ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50'}`}
                    >
                      <ProviderLogoBadge provider={provider} active={active} sizeClassName="size-9" />
                      <span className="min-w-0">
                        <span className="block text-sm font-black">{provider.name}</span>
                        <span className="block text-xs font-bold text-slate-500">{provider.shortName}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900">{top3ToggleLabel}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{prizeScopeText}</p>
            </div>
            <button
              type="button"
              onClick={() => setTop3Only((value) => !value)}
              disabled={!canUseTrend}
              aria-pressed={top3Only}
              className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-60 ${top3Only ? 'border-blue-800 bg-blue-800' : 'border-slate-300 bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${top3Only ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </section>

        {status === 'error' ? <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{labels.trendError}</p> : null}
      </form>

      <section className="grid self-start content-start gap-5">
        <div className={`self-start rounded-lg border px-4 py-3 shadow-sm ${canUseTrend ? 'border-blue-200 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-sm font-bold ${canUseTrend ? 'text-blue-900' : 'text-amber-900'}`}>
                {canUseTrend ? unlockedAccessText : compactLockedAccessText}
              </p>
              <div className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold ${canUseTrend ? 'text-blue-800' : 'text-amber-800'}`}>
                {canUseTrend ? <span>{accessBadgeText}</span> : null}
                <span>{rewardCreditsText}</span>
                {unlockMinutesLeft > 0 ? <span>{adUnlockRemainingText}</span> : null}
              </div>
            </div>
            {!canUseTrend ? (
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
        {status === 'idle' ? <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">{labels.noTrendYet}</div> : null}
        {trend ? (
          <>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black text-slate-950">{rangeSummaryLabel}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                {selectedProvider?.name ?? '-'} | {rangeLabel} | {prizeScopeText} | {labels.drawsScanned}: {trend.drawCount} | {labels.numbersScanned}: {trend.numberCount}
              </p>
            </section>

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard title={labels.summaryTitle} value={`${trend.providerSummaries.length}`} detail={labels.providersLabel} />
              <SummaryCard title={labels.drawsScanned} value={`${trend.drawCount}`} detail={rangeLabel} />
              <SummaryCard title={labels.numbersScanned} value={`${trend.numberCount}`} detail="4D" />
            </div>

            {status === 'loading' ? <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900">{labels.calculating}</p> : null}
            <TrendList title={resultTitle} items={resultItems} labels={labels} emptyText={labels.noTrendResults} />

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{labels.digitFrequencyTitle}</h2>
              <div className="mt-4 grid grid-cols-5 gap-2 md:grid-cols-10">
                {trend.digitCounts.map((item) => (
                  <div key={item.digit} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-center">
                    <div className="text-xl font-black text-slate-950">{item.digit}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{item.count}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{labels.providerSummaryTitle}</h2>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {trend.providerSummaries.map((provider) => (
                  <div key={provider.providerCode} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="font-black text-slate-950">{provider.providerName}</div>
                    <div className="mt-1 text-xs font-bold text-slate-500">{labels.drawsScanned}: {provider.drawCount} | {labels.numbersScanned}: {provider.numberCount}</div>
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

function SummaryCard({title, value, detail}: {title: string; value: string; detail: string}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase text-blue-800">{title}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-bold text-slate-500">{detail}</div>
    </div>
  );
}

function TrendList({title, items, labels, emptyText}: {title: string; items: TrendNumber[]; labels: Props['labels']; emptyText: string}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {items.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">{emptyText}</p> : null}
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={`${title}-${item.number}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xl font-black tracking-[0.18em] text-slate-950">{item.number}</div>
              <div className="rounded bg-blue-100 px-2 py-1 text-xs font-black text-blue-800">{item.count} {labels.timesLabel}</div>
            </div>
            <div className="mt-2 text-xs font-bold text-slate-500">{labels.latestDateLabel}: {item.latestDate || '-'}</div>
            <div className="mt-1 text-xs font-bold text-slate-500">{labels.providersLabel}: {item.providers.join(', ') || '-'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
