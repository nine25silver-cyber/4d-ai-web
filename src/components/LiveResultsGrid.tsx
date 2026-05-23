'use client';

import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ResultCard, type ResultCardLabels} from '@/components/ResultCard';
import type {ProviderResultState} from '@/lib/cloudflare';
import type {ProviderConfig} from '@/lib/providers';
import {resultCardLabels} from '@/lib/result-labels';

type Props = {
  regionSlug: string;
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

export function LiveResultsGrid({regionSlug, providers, initialResults}: Props) {
  const t = useTranslations('Results');
  const [results, setResults] = useState(initialResults);
  const [lastChecked, setLastChecked] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let running = false;

    async function refresh() {
      if (running) return;
      running = true;
      setIsRefreshing(true);
      try {
        const response = await fetch(`/api/latest/${regionSlug}`, {cache: 'no-store'});
        if (!response.ok) return;
        const data = (await response.json()) as LatestApiResponse;
        if (cancelled || !Array.isArray(data.results)) return;
        setResults((current) => (sameResults(current, data.results ?? []) ? current : data.results ?? current));
        setLastChecked(data.updatedAt ?? new Date().toISOString());
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
  }, [regionSlug]);

  const resultMap = useMemo(() => new Map(results.map((result) => [result.providerCode, result])), [results]);
  const labels: ResultCardLabels = resultCardLabels(t);

  return (
    <section>
      <div className="grid gap-5 lg:grid-cols-2">
        {providers.map((provider) => {
          const result = resultMap.get(provider.code) ?? {ok: false as const, providerCode: provider.code, url: '', reason: 'not_requested'};
          return <ResultCard key={provider.code} provider={provider} result={result} labels={labels} />;
        })}
      </div>
    </section>
  );
}
