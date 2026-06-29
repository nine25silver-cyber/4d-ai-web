'use client';

import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ResultCard, type ResultCardLabels} from '@/components/ResultCard';
import type {ProviderResultState} from '@/lib/cloudflare';
import type {ProviderConfig} from '@/lib/providers';
import {resultCardLabels} from '@/lib/result-labels';

type Props = {
  regionSlug: string;
  refreshRegionSlugs?: string[];
  providers: ProviderConfig[];
  initialResults: ProviderResultState[];
};

type LatestApiResponse = {
  results?: ProviderResultState[];
  updatedAt?: string;
};

function sameResults(previous: ProviderResultState[], next: ProviderResultState[]) {
  return JSON.stringify(previous) === JSON.stringify(next);
}

const POLL_MS_DRAW_WINDOW = 10_000;
const POLL_MS_NORMAL = 30_000;
const DRAW_WINDOW_MINUTES = 75;
const DRAW_MINUTES_OF_DAY = [13 * 60, 16 * 60, 19 * 60, 22 * 60];

function getKlMinutesOfDay(now = new Date()) {
  const kl = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  }).formatToParts(now);
  const hour = Number(kl.find((item) => item.type === 'hour')?.value ?? '0');
  const minute = Number(kl.find((item) => item.type === 'minute')?.value ?? '0');
  return hour * 60 + minute;
}

function isInDrawWindow(now = new Date()) {
  const minutesOfDay = getKlMinutesOfDay(now);
  return DRAW_MINUTES_OF_DAY.some((drawMinute) => Math.abs(minutesOfDay - drawMinute) <= DRAW_WINDOW_MINUTES);
}

function pollIntervalMs(now = new Date()) {
  return isInDrawWindow(now) ? POLL_MS_DRAW_WINDOW : POLL_MS_NORMAL;
}

export function LiveResultsGrid({regionSlug, refreshRegionSlugs, providers, initialResults}: Props) {
  const t = useTranslations('Results');
  const [results, setResults] = useState(initialResults);
  const [lastChecked, setLastChecked] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apiRegionSlugs = useMemo(() => refreshRegionSlugs?.length ? refreshRegionSlugs : [regionSlug], [refreshRegionSlugs, regionSlug]);

  useEffect(() => {
    let cancelled = false;
    let running = false;

    async function refresh() {
      if (running) return;
      running = true;
      setIsRefreshing(true);
      try {
        const responses = await Promise.all(apiRegionSlugs.map((slug) => fetch(`/api/latest/${slug}`, {cache: 'no-store'})));
        const payloads = await Promise.all(responses.filter((response) => response.ok).map((response) => response.json() as Promise<LatestApiResponse>));
        const nextResults = payloads.flatMap((data) => Array.isArray(data.results) ? data.results : []);
        if (cancelled || nextResults.length === 0) return;
        setResults((current) => (sameResults(current, nextResults) ? current : nextResults));
        setLastChecked(payloads.find((data) => data.updatedAt)?.updatedAt ?? new Date().toISOString());
      } finally {
        running = false;
        if (!cancelled) setIsRefreshing(false);
      }
    }

    refresh();
    let timeoutId: number | null = null;
    const loop = async () => {
      await refresh();
      if (cancelled) return;
      timeoutId = window.setTimeout(loop, pollIntervalMs());
    };
    timeoutId = window.setTimeout(loop, pollIntervalMs());
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [apiRegionSlugs]);

  const resultMap = useMemo(() => new Map(results.map((result) => [result.providerCode, result])), [results]);
  const labels: ResultCardLabels = resultCardLabels(t);

  return (
    <section>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {providers.map((provider) => {
          const result = resultMap.get(provider.code) ?? {ok: false as const, providerCode: provider.code, url: '', reason: 'not_requested'};
          return (
            <div key={provider.code} data-result-provider={provider.code}>
              <ResultCard provider={provider} result={result} labels={labels} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
