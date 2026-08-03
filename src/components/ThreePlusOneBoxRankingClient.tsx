'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';
import type {
  ThreePlusOneBoxColdSummary,
  ThreePlusOneBoxMode,
  ThreePlusOneBoxRange,
  ThreePlusOneBoxRankingBucket,
  ThreePlusOneBoxRankingFeed,
  ThreePlusOneBoxRankingItem,
  ThreePlusOneBoxRankingType
} from '@/lib/cloudflare';

type Labels = {
  updatedAt: string;
  generatedAt: string;
  hotTitle: string;
  coldTitle: string;
  coldSummaryTitle: string;
  modeTitle: string;
  hotRangeTitle: string;
  range6m: string;
  range1y: string;
  rangeAll: string;
  occurrences: string;
  occurrenceUnit: string;
  currentGap: string;
  historicalMaxGap: string;
  days: string;
  draws: string;
  noData: string;
  loading: string;
  loadFailed: string;
  retry: string;
  latestSeen: string;
  viewDetails: string;
  hideDetails: string;
  prizeWinsTitle: string;
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
};

type Props = {
  locale: Locale;
  provider: ProviderConfig;
  providerName: string;
  labels: Labels;
};

const modes: ThreePlusOneBoxMode[] = ['AAA', 'AAB', 'ABC'];
const ranges: ThreePlusOneBoxRange[] = ['6m', '1y', 'all'];

export function ThreePlusOneBoxRankingClient({locale, provider, providerName, labels}: Props) {
  const [mode, setMode] = useState<ThreePlusOneBoxMode>('ABC');
  const [range, setRange] = useState<ThreePlusOneBoxRange>('6m');
  const [hotFeed, setHotFeed] = useState<ThreePlusOneBoxRankingFeed | null>(null);
  const [coldFeed, setColdFeed] = useState<ThreePlusOneBoxRankingFeed | null>(null);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [requestKey, setRequestKey] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const load = useCallback(async (signal: AbortSignal) => {
    setStatus('loading');
    const hotParams = new URLSearchParams({provider: provider.code, range});
    const coldParams = new URLSearchParams({provider: provider.code, range: 'all'});
    const [hotResponse, coldResponse] = await Promise.all([
      fetch(`/api/three-plus-one-box-ranking?${hotParams.toString()}`, {cache: 'no-store', signal}),
      fetch(`/api/three-plus-one-box-ranking?${coldParams.toString()}`, {cache: 'no-store', signal})
    ]);
    if (!hotResponse.ok || !coldResponse.ok) {
      throw new Error('ranking_unavailable');
    }
    const [nextHotFeed, nextColdFeed] = await Promise.all([
      hotResponse.json() as Promise<ThreePlusOneBoxRankingFeed>,
      coldResponse.json() as Promise<ThreePlusOneBoxRankingFeed>
    ]);
    setHotFeed(nextHotFeed);
    setColdFeed(nextColdFeed);
    setStatus('done');
  }, [provider.code, range]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).catch((error) => {
      if (controller.signal.aborted) return;
      setStatus('error');
    });
    return () => controller.abort();
  }, [load, requestKey]);

  useEffect(() => {
    setExpandedItems(new Set());
  }, [mode, provider.code, range]);

  const toggleExpandedItem = useCallback((itemKey: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  }, []);

  const hotBucket = useMemo(() => findBucket(hotFeed, mode, 'hot'), [hotFeed, mode]);
  const coldBucket = useMemo(() => findBucket(coldFeed, mode, 'cold'), [coldFeed, mode]);
  const timestamp = hotFeed?.updatedAt ?? hotFeed?.generatedAt ?? coldFeed?.updatedAt ?? coldFeed?.generatedAt;

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <ProviderLogoBadge provider={provider} active sizeClassName="size-12" />
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1e3a8a]">3D BOX</p>
            <h2 className="truncate text-lg font-black text-slate-950">{providerName}</h2>
            {timestamp ? (
              <p className="mt-0.5 text-xs font-bold text-slate-500">
                {hotFeed?.updatedAt ? labels.updatedAt : labels.generatedAt}: {formatTimestamp(timestamp, locale)}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">{labels.modeTitle}</p>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-md px-3 py-2 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
                  mode === item ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={mode === item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="rounded-md bg-[#1e3a8a] px-3 py-2.5 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#d4af37] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-950">HOT</span>
                <p className="text-sm font-black text-white">{labels.hotTitle}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ranges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRange(item)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] ${
                      range === item ? 'bg-[#d4af37] text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    aria-pressed={range === item}
                  >
                    {rangeLabel(item, labels)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <RankingPanel
            status={status}
            items={hotBucket?.items ?? []}
            mode={mode}
            rankingType="hot"
            labels={labels}
            emptyLabel={labels.noData}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpandedItem}
            onRetry={() => setRequestKey((current) => current + 1)}
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="rounded-md bg-[#1e3a8a] px-3 py-2.5 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0f2f5f]">COLD</span>
                <p className="text-sm font-black text-white">{labels.coldTitle}</p>
              </div>
              <span className="w-fit rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-black text-white">{labels.rangeAll}</span>
            </div>
          </div>
          <ColdSummary summary={coldBucket?.coldSummary} labels={labels} />
          <RankingPanel
            status={status}
            items={coldBucket?.items ?? []}
            mode={mode}
            rankingType="cold"
            labels={labels}
            emptyLabel={labels.noData}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpandedItem}
            onRetry={() => setRequestKey((current) => current + 1)}
          />
        </div>
      </div>
    </section>
  );
}

function findBucket(feed: ThreePlusOneBoxRankingFeed | null, mode: ThreePlusOneBoxMode, rankingType: 'hot' | 'cold'): ThreePlusOneBoxRankingBucket | undefined {
  return feed?.rankings.find((bucket) => bucket.mode === mode && bucket.rankingType === rankingType && bucket.prizeScopeKey === 'top3');
}

function RankingPanel({status, items, mode, rankingType, labels, emptyLabel, expandedItems, onToggleExpanded, onRetry}: {
  status: 'loading' | 'done' | 'error';
  items: ThreePlusOneBoxRankingItem[];
  mode: ThreePlusOneBoxMode;
  rankingType: ThreePlusOneBoxRankingType;
  labels: Labels;
  emptyLabel: string;
  expandedItems: Set<string>;
  onToggleExpanded: (itemKey: string) => void;
  onRetry: () => void;
}) {
  if (status === 'loading') {
    return <p className="mt-3 rounded-md bg-white px-3 py-6 text-center text-sm font-black text-slate-500">{labels.loading}</p>;
  }
  if (status === 'error') {
    return (
      <div className="mt-3 rounded-md bg-white px-3 py-6 text-center">
        <p className="text-sm font-black text-slate-800">{labels.loadFailed}</p>
        <button type="button" onClick={onRetry} className="mt-3 rounded-md bg-[#1e3a8a] px-4 py-2 text-xs font-black text-white hover:bg-[#152d6c]">
          {labels.retry}
        </button>
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="mt-3 rounded-md bg-white px-3 py-6 text-center text-sm font-black text-slate-500">{emptyLabel}</p>;
  }
  return (
    <div className="mt-3 grid gap-2">
      {items.slice(0, 10).map((item) => {
        const itemKey = `${mode}-${rankingType}-${item.key3d}-${item.rank}`;
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
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#1e3a8a] text-xs font-black text-white">#{item.rank}</span>
                <span className="font-mono text-3xl font-black leading-none tracking-normal text-slate-950">{item.key3d}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <CompactMetric item={item} rankingType={rankingType} labels={labels} />
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 border-b-2 border-r-2 border-slate-400 transition ${expanded ? '-rotate-135' : 'rotate-45'}`}
                />
              </span>
            </button>

            {expanded ? (
              <div className="border-t border-slate-100 bg-slate-50/70 px-3 pb-3 pt-3">
                <RankingItemDetails item={item} rankingType={rankingType} labels={labels} />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function CompactMetric({item, rankingType, labels}: {item: ThreePlusOneBoxRankingItem; rankingType: ThreePlusOneBoxRankingType; labels: Labels}) {
  if (rankingType === 'cold') {
    return (
      <span className="flex flex-wrap justify-end gap-1.5 text-xs font-black">
        <span className="rounded-md bg-blue-50 px-2 py-1 text-[#1e3a8a]">{formatNumber(item.currentGapDays)} {labels.days}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{formatNumber(item.currentGapDraws)} {labels.draws}</span>
      </span>
    );
  }
  return (
    <span className="text-right">
      <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.occurrences}</span>
      <span className="text-base font-black text-[#9f7b12]">{item.totalCount} {labels.occurrenceUnit}</span>
    </span>
  );
}

function RankingItemDetails({item, rankingType, labels}: {item: ThreePlusOneBoxRankingItem; rankingType: ThreePlusOneBoxRankingType; labels: Labels}) {
  return (
    <div className="grid gap-2 text-xs font-bold text-slate-600">
      {rankingType === 'cold' ? (
        <div className="rounded-md bg-white px-2.5 py-2">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.occurrences}</p>
          <p className="mt-0.5 text-sm font-black text-slate-900">{item.totalCount} {labels.occurrenceUnit}</p>
        </div>
      ) : (
        <Metric label={labels.currentGap} days={item.currentGapDays} draws={item.currentGapDraws} labels={labels} />
      )}
      <Metric label={labels.historicalMaxGap} days={item.historicalMaxGapDays} draws={item.historicalMaxGapDraws} labels={labels} />
      <div className="rounded-md bg-white px-2.5 py-2">
        <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{labels.prizeWinsTitle}</p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-black text-slate-500">
          <span className="rounded bg-slate-50 px-2 py-1">{labels.firstPrize}: {item.firstCount}</span>
          <span className="rounded bg-slate-50 px-2 py-1">{labels.secondPrize}: {item.secondCount}</span>
          <span className="rounded bg-slate-50 px-2 py-1">{labels.thirdPrize}: {item.thirdCount}</span>
        </div>
      </div>
      {item.lastSeenDrawDate ? (
        <p className="text-xs font-bold text-slate-500">
          {labels.latestSeen}: {item.lastSeenDrawDate}
        </p>
      ) : null}
    </div>
  );
}
function Metric({label, days, draws, labels}: {label: string; days?: number; draws?: number; labels: Labels}) {
  return (
    <div className="rounded-md bg-slate-50 px-2.5 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-black text-slate-900">
        {formatNumber(days)} {labels.days} / {formatNumber(draws)} {labels.draws}
      </p>
    </div>
  );
}

function ColdSummary({summary, labels}: {summary?: ThreePlusOneBoxColdSummary; labels: Labels}) {
  if (!summary?.key3d) return null;
  return (
    <div className="mt-3 rounded-md bg-[#1e3a8a] p-3 text-white">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/70">{labels.coldSummaryTitle}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <span className="font-mono text-3xl font-black tracking-normal">{summary.key3d}</span>
        <span className="text-right text-sm font-black">
          {formatNumber(summary.longestGapDays)} {labels.days}
          <span className="block text-xs text-white/70">{formatNumber(summary.longestGapDraws)} {labels.draws}</span>
        </span>
      </div>
    </div>
  );
}

function rangeLabel(range: ThreePlusOneBoxRange, labels: Labels): string {
  if (range === '1y') return labels.range1y;
  if (range === 'all') return labels.rangeAll;
  return labels.range6m;
}

function formatNumber(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '-';
}

function formatTimestamp(value: string, locale: Locale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-MY' : locale === 'ms' ? 'ms-MY' : 'en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kuala_Lumpur'
  }).format(date);
}
