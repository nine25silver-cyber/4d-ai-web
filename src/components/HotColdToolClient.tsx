'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
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
import {FeatureAccessStatusBar} from '@/components/FeatureAccessStatusBar';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type TrendNumber = {
  number: string;
  count: number;
  providers: string[];
  latestDate: string;
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
  from: string;
  to: string;
  drawCount: number;
  numberCount: number;
  hotNumbers: TrendNumber[];
  coldNumbers: TrendNumber[];
  digitCounts: DigitCount[];
  providerSummaries: ProviderSummary[];
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
  labels: {
    rangeLabel: string;
    range1y: string;
    range2y: string;
    range3y: string;
    range5y: string;
    range10y: string;
    range15y: string;
    range20y: string;
    range30y: string;
    rangeAll: string;
    providerSelectTitle: string;
    providerSelectText: string;
    selectedProviders: string;
    selectAll: string;
    clearAll: string;
    hotSearchButton: string;
    coldSearchButton: string;
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

type TrendKind = 'hot' | 'cold';
type TrendRange = '1y' | '2y' | '3y' | '5y' | '10y' | '15y' | '20y' | '30y' | 'all';

export function HotColdToolClient({locale, providers, labels}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [rewardCredits, setRewardCredits] = useState(0);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [unlockMinutesLeft, setUnlockMinutesLeft] = useState(0);
  const [range, setRange] = useState<TrendRange>('1y');
  const [trendKind, setTrendKind] = useState<TrendKind>('hot');
  const [selected, setSelected] = useState(() => new Set(providers.map((provider) => provider.code)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );
  const isPro = memberState?.loggedIn === true && memberState.plan === 'pro';
  const canUseTrend = isPro || adUnlocked;

  useEffect(() => {
    initMemberState();
    setMemberState(readMemberState());
    return subscribeMemberState(setMemberState);
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

  function unlockByRewardedAd() {
    addRewardCredit('hot_cold', 1);
    if (consumeRewardCredit('hot_cold', 1)) {
      unlockFeatureForMinutes('hot_cold', 30);
      setAdUnlocked(true);
      setUnlockMinutesLeft(30);
    }
  }

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const ranges: Array<{value: TrendRange; label: string}> = [
    {value: '1y', label: labels.range1y},
    {value: '2y', label: labels.range2y},
    {value: '3y', label: labels.range3y},
    {value: '5y', label: labels.range5y},
    {value: '10y', label: labels.range10y},
    {value: '15y', label: labels.range15y},
    {value: '20y', label: labels.range20y},
    {value: '30y', label: labels.range30y},
    {value: 'all', label: labels.rangeAll}
  ];

  async function calculateTrend(nextKind: TrendKind) {
    if (!canUseTrend) {
      setStatus('idle');
      setTrend(null);
      return;
    }
    setTrendKind(nextKind);
    setStatus('loading');
    const params = new URLSearchParams({
      range,
      providers: Array.from(selected).join(',')
    });
    const response = await fetch(`/api/hot-cold?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setTrend(null);
      return;
    }
    setTrend((await response.json()) as TrendResponse);
    setStatus('done');
  }

  return (
    <section className="mt-8 grid gap-5 xl:grid-cols-[420px_1fr]">
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-800">{labels.providerSelectTitle}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{labels.providerSelectText}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected(new Set(providers.map((provider) => provider.code)))} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                {labels.selectAll}
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                {labels.clearAll}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {providers.map((provider) => {
              const active = selected.has(provider.code);
              return (
                <button key={provider.code} type="button" onClick={() => toggle(provider.code)} aria-pressed={active} className={`min-h-[76px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                  <ProviderLogoBadge provider={provider} active={active} />
                  <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">{labels.selectedProviders}: <span className="text-slate-800">{selectedNames || '-'}</span></p>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => calculateTrend('hot')} disabled={status === 'loading' || !canUseTrend} className={`rounded-md border px-4 py-3 text-sm font-black transition disabled:opacity-60 ${trendKind === 'hot' ? 'border-blue-700 bg-blue-800 text-white shadow-sm' : 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
            {status === 'loading' && trendKind === 'hot' ? labels.calculating : labels.hotSearchButton}
          </button>
          <button type="button" onClick={() => calculateTrend('cold')} disabled={status === 'loading' || !canUseTrend} className={`rounded-md border px-4 py-3 text-sm font-black transition disabled:opacity-60 ${trendKind === 'cold' ? 'border-blue-700 bg-blue-800 text-white shadow-sm' : 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
            {status === 'loading' && trendKind === 'cold' ? labels.calculating : labels.coldSearchButton}
          </button>
        </div>
        {status === 'error' ? <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{labels.trendError}</p> : null}
      </form>

      <section className="grid gap-5">
        <FeatureAccessStatusBar
          locale={locale}
          locked={!canUseTrend}
          credits={rewardCredits}
          minutesLeft={unlockMinutesLeft}
          showLogin={!memberState?.loggedIn}
          onLogin={() => void loginUser(locale)}
          onUnlock={unlockByRewardedAd}
          proHref={`/${locale}/pricing`}
          lockedText={locale === 'zh' ? '热门/冷门走势仅开放给 Pro 会员，或观看广告后临时解锁。' : locale === 'ms' ? 'Trend panas/sejuk hanya untuk Pro atau buka sementara melalui iklan.' : 'Hot/Cold trends are for Pro or temporary ad unlock.'}
        />
        {!canUseTrend ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-bold text-amber-900">
              {locale === 'zh'
                ? '热门/冷门趋势结果仅开放给 Pro 会员。'
                : locale === 'ms'
                  ? 'Keputusan trend panas/sejuk hanya untuk ahli Pro.'
                  : 'Hot/Cold trend results are available for Pro members only.'}
            </p>
            <p className="mt-2 text-xs font-bold text-amber-800">
              {locale === 'zh'
                ? `可用广告解锁次数：${rewardCredits}`
                : locale === 'ms'
                  ? `Kredit buka iklan tersedia: ${rewardCredits}`
                  : `Available rewarded unlock credits: ${rewardCredits}`}
            </p>
            {adUnlocked ? (
              <p className="mt-1 text-xs font-bold text-blue-800">
                {locale === 'zh'
                  ? `本次广告解锁剩余：约 ${unlockMinutesLeft} 分钟`
                  : locale === 'ms'
                    ? `Baki buka kunci iklan: kira-kira ${unlockMinutesLeft} minit`
                    : `Ad unlock remaining: about ${unlockMinutesLeft} minutes`}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {!memberState?.loggedIn ? (
                <button type="button" onClick={() => void loginUser(locale)} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100">
                  {locale === 'zh' ? '立即登录' : locale === 'ms' ? 'Log masuk' : 'Login now'}
                </button>
              ) : null}
              <button type="button" onClick={unlockByRewardedAd} className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-black text-amber-900 hover:bg-amber-100">
                {locale === 'zh' ? '观看广告并解锁30分钟' : locale === 'ms' ? 'Tonton iklan & buka 30 minit' : 'Watch ad and unlock for 30 minutes'}
              </button>
              <Link href={`/${locale}/pricing`} className="rounded-md bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900">
                {locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'}
              </Link>
            </div>
          </div>
        ) : null}
        {status === 'idle' ? <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">{labels.noTrendYet}</div> : null}
        {trend ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard title={labels.summaryTitle} value={`${trend.providerSummaries.length}`} detail={labels.providersLabel} />
              <SummaryCard title={labels.drawsScanned} value={`${trend.drawCount}`} detail={trend.from ? `${trend.from} - ${trend.to || ''}` : labels.rangeAll} />
              <SummaryCard title={labels.numbersScanned} value={`${trend.numberCount}`} detail="4D" />
            </div>

            <TrendList title={trendKind === 'hot' ? labels.hotNumbersTitle : labels.coldNumbersTitle} items={trendKind === 'hot' ? trend.hotNumbers : trend.coldNumbers} labels={labels} emptyText={labels.noTrendResults} />

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

