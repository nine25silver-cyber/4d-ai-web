'use client';

import {useEffect, useMemo, useState} from 'react';
import {useTranslations} from 'next-intl';
import {ResultCard, type ResultCardLabels} from '@/components/ResultCard';
import type {HistoryLatest30State, ProviderResultPayload, ProviderResultState} from '@/lib/cloudflare';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import {resultCardLabels} from '@/lib/result-labels';

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
  initialIndexes: HistoryLatest30State[];
  initialResults: ProviderResultState[];
};

type ResultCache = Record<string, ProviderResultState>;

const buttonBase = 'rounded-md border px-2 py-1.5 text-xs font-black transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400';
const publicHistoryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL ?? 'https://data.4dai88.com/history_test';

function cacheKey(providerCode: string, date: string) {
  return `${providerCode}|${date}`;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
}

function normalizeProviderPayload(providerCode: string, raw: unknown): ProviderResultPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  return {
    provider_code: String(map.provider_code ?? providerCode),
    draw_date: String(map.draw_date ?? ''),
    draw_no: String(map.draw_no ?? ''),
    phase: String(map.phase ?? ''),
    status: String(map.status ?? ''),
    has_result: map.has_result === true,
    first_prize: String(map.first_prize ?? ''),
    second_prize: String(map.second_prize ?? ''),
    third_prize: String(map.third_prize ?? ''),
    special_numbers: normalizeStringArray(map.special_numbers),
    consolation_numbers: normalizeStringArray(map.consolation_numbers),
    updated_at: String(map.updated_at ?? ''),
    generated_at: String(map.generated_at ?? ''),
    source_type: String(map.source_type ?? '')
  };
}

async function fetchHistoryDailyFromPublicJson(providerCode: string, date: string): Promise<ProviderResultState> {
  const safeDate = date.trim();
  const base = publicHistoryBaseUrl.replace(/\/$/, '');
  const url = `${base}/${encodeURIComponent(providerCode)}/${encodeURIComponent(safeDate)}.json`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return {ok: false, providerCode, url, reason: 'invalid_date', requestedDate: safeDate};
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`, requestedDate: safeDate};
    const decoded = await response.json().catch(() => null);
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json', requestedDate: safeDate};
    const payload = normalizeProviderPayload(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape', requestedDate: safeDate};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed', requestedDate: safeDate};
  }
}

function sortDatesNewestFirst(dates: string[]) {
  return Array.from(new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))).sort((left, right) => right.localeCompare(left));
}

function initialSelectedDates(indexes: HistoryLatest30State[], results: ProviderResultState[]) {
  const selected: Record<string, string> = {};
  for (const state of indexes) {
    if (state.ok) {
      const latestDate = sortDatesNewestFirst(state.payload.dates)[0];
      if (latestDate) selected[state.providerCode] = latestDate;
    }
  }
  for (const result of results) {
    if (result.ok && result.payload.draw_date && !selected[result.providerCode]) selected[result.providerCode] = result.payload.draw_date;
  }
  return selected;
}

function initialResultCache(results: ProviderResultState[]) {
  const cache: ResultCache = {};
  for (const result of results) {
    const date = result.ok ? result.payload.draw_date : result.requestedDate;
    if (date) cache[cacheKey(result.providerCode, date)] = result;
  }
  return cache;
}

function copyWith<T>(record: Record<string, T>, key: string, value: T) {
  return {...record, [key]: value};
}

function fallbackText(locale: Locale, key: 'chooseDate' | 'close' | 'datePickerTitle') {
  const labels = {
    en: {
      chooseDate: 'Choose date',
      close: 'Close',
      datePickerTitle: 'Choose result date'
    },
    ms: {
      chooseDate: 'Pilih tarikh',
      close: 'Tutup',
      datePickerTitle: 'Pilih tarikh keputusan'
    },
    zh: {
      chooseDate: '选择日期',
      close: '关闭',
      datePickerTitle: '选择开奖记录日期'
    }
  } as const;
  return labels[locale]?.[key] ?? labels.en[key];
}

export function HistoryResultsGrid({locale, providers, initialIndexes, initialResults}: Props) {
  const historyT = useTranslations('History');
  const resultsT = useTranslations('Results');
  const labels: ResultCardLabels = resultCardLabels(resultsT);
  const indexMap = useMemo(() => new Map(initialIndexes.map((state) => [state.providerCode, state])), [initialIndexes]);
  const [selectedDateByProvider, setSelectedDateByProvider] = useState(() => initialSelectedDates(initialIndexes, initialResults));
  const [resultCache, setResultCache] = useState<ResultCache>(() => initialResultCache(initialResults));
  const [loadingKeys, setLoadingKeys] = useState<Record<string, true>>({});
  const [dialogProviderCode, setDialogProviderCode] = useState<string | null>(null);

  function selectDate(providerCode: string, date: string) {
    if (!date) return;
    setSelectedDateByProvider((current) => copyWith(current, providerCode, date));
    setDialogProviderCode(null);
  }

  const dialogProvider = dialogProviderCode ? providers.find((provider) => provider.code === dialogProviderCode) : undefined;
  const dialogIndex = dialogProviderCode ? indexMap.get(dialogProviderCode) : undefined;
  const dialogDates = dialogIndex?.ok ? sortDatesNewestFirst(dialogIndex.payload.dates).slice(0, 30) : [];

  useEffect(() => {
    providers.forEach((provider) => {
      const selectedDate = selectedDateByProvider[provider.code];
      if (!selectedDate) return;
      const key = cacheKey(provider.code, selectedDate);
      if (resultCache[key] || loadingKeys[key]) return;
      setLoadingKeys((current) => ({...current, [key]: true}));
      void fetchHistoryDailyFromPublicJson(provider.code, selectedDate).then((result) => {
        setResultCache((current) => ({...current, [key]: result}));
      }).finally(() => {
        setLoadingKeys((current) => {
          const next = {...current};
          delete next[key];
          return next;
        });
      });
    });
  }, [loadingKeys, providers, resultCache, selectedDateByProvider]);

  return (
    <section className="mt-2">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-4">
        {providers.map((provider) => {
          const indexState = indexMap.get(provider.code);
          const dates = indexState?.ok ? sortDatesNewestFirst(indexState.payload.dates).slice(0, 30) : [];
          const selectedDate = selectedDateByProvider[provider.code] ?? dates[0] ?? '';
          const selectedIndex = selectedDate ? dates.indexOf(selectedDate) : -1;
          const previousDate = selectedIndex >= 0 && selectedIndex < dates.length - 1 ? dates[selectedIndex + 1] : undefined;
          const nextDate = selectedIndex > 0 ? dates[selectedIndex - 1] : undefined;
          const selectedKey = selectedDate ? cacheKey(provider.code, selectedDate) : '';
          const result = selectedDate
            ? resultCache[selectedKey] ?? {ok: false as const, providerCode: provider.code, url: '', reason: loadingKeys[selectedKey] ? 'loading_history_result' : 'history_result_pending', requestedDate: selectedDate}
            : {ok: false as const, providerCode: provider.code, url: indexState?.url ?? '', reason: indexState?.ok ? 'no_dates' : indexState?.reason ?? 'not_requested'};

          return (
            <div key={provider.code} data-history-provider={provider.code}>
              <div className="mb-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 rounded-md border border-slate-200 bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  disabled={!previousDate}
                  onClick={() => previousDate ? selectDate(provider.code, previousDate) : undefined}
                  className={`${buttonBase} border-slate-300 bg-white text-slate-800 hover:border-blue-300`}
                >
                  {historyT('previousDraw')}
                </button>
                <button
                  type="button"
                  disabled={dates.length === 0}
                  onClick={() => setDialogProviderCode(provider.code)}
                  className={`${buttonBase} min-w-28 border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100`}
                  aria-label={`${fallbackText(locale, 'chooseDate')} ${provider.name}`}
                >
                  <span className="block text-[10px] font-bold uppercase leading-3 text-blue-700">{fallbackText(locale, 'chooseDate')}</span>
                  <span className="block">{selectedDate || '-'}</span>
                </button>
                <button
                  type="button"
                  disabled={!nextDate}
                  onClick={() => nextDate ? selectDate(provider.code, nextDate) : undefined}
                  className={`${buttonBase} border-slate-300 bg-white text-slate-800 hover:border-blue-300`}
                >
                  {historyT('nextDraw')}
                </button>
              </div>
              <ResultCard provider={provider} result={result} labels={labels} compact />
            </div>
          );
        })}
      </div>

      {dialogProvider ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-labelledby="history-date-dialog-title">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="history-date-dialog-title" className="text-lg font-black text-slate-950">{fallbackText(locale, 'datePickerTitle')}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">{dialogProvider.name}</p>
              </div>
              <button type="button" onClick={() => setDialogProviderCode(null)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-black text-slate-700 hover:border-blue-300">
                {fallbackText(locale, 'close')}
              </button>
            </div>
            <div className="mt-4 grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {dialogDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => dialogProviderCode ? selectDate(dialogProviderCode, date) : undefined}
                  className={`rounded-md border px-3 py-2 text-sm font-black ${
                    selectedDateByProvider[dialogProvider.code] === date
                      ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
