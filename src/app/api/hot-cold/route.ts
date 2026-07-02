import {NextResponse} from 'next/server';
import {regions} from '@/lib/providers';

type TrendDirection = 'hot' | 'cold';
type TrendRange = '1y' | '2y' | '3y' | '5y' | '10y' | '15y' | '20y' | 'all';

type TrendNumber = {
  number: string;
  count: number;
  rank: number;
  providers: string[];
  latestDate: string;
  latestDrawNo: string;
  distanceDays: number | null;
  distanceDraws: number | null;
};

type ProviderSummary = {
  providerCode: string;
  providerName: string;
  drawCount: number;
  numberCount: number;
};

type CloudflareTrendRow = {
  rank?: unknown;
  number_key?: unknown;
  occurrence_count?: unknown;
  latest_hit_date?: unknown;
  latest_draw_no?: unknown;
  distance_days?: unknown;
  distance_draws?: unknown;
  sample_size?: unknown;
};

const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));
const hotColdStatsBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HOT_COLD_4D_BASE_URL ?? 'https://data.4dai88.com/stats/hot-cold-4d';
const rangeToPeriodKey: Record<Exclude<TrendRange, 'all'>, string> = {
  '1y': '1',
  '2y': '2',
  '3y': '3',
  '5y': '5',
  '10y': '10',
  '15y': '15',
  '20y': '20'
};

function parseJsonSafely(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asRows(value: unknown): CloudflareTrendRow[] {
  return Array.isArray(value)
    ? value.filter((item): item is CloudflareTrendRow => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : [];
}

function numberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function textValue(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeNumber(value: unknown): string {
  const number = textValue(value).replace(/\D/g, '').slice(0, 4);
  return number.length === 4 ? number : '';
}

function normalizeRange(value: string): TrendRange {
  return ['1y', '2y', '3y', '5y', '10y', '15y', '20y', 'all'].includes(value) ? value as TrendRange : '1y';
}

function normalizeTop3Only(value: string | null): boolean {
  return value === '1' || value === 'true';
}

function normalizeMode(value: string | null): TrendDirection {
  return value === 'cold' ? 'cold' : 'hot';
}

async function fetchHotColdStats(providerCode: string) {
  const url = `${hotColdStatsBaseUrl.replace(/\/$/, '')}/${providerCode}.json?ts=${Date.now()}`;
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json', 'cache-control': 'no-store', pragma: 'no-cache'}});
    if (!response.ok) return {ok: false as const, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false as const, url, reason: 'invalid_json'};
    const payload = asRecord(decoded);
    if (textValue(payload.provider_code) !== providerCode) return {ok: false as const, url, reason: 'provider_mismatch'};
    return {ok: true as const, url, payload};
  } catch (error) {
    return {ok: false as const, url, reason: error instanceof Error ? error.message : 'request_failed'};
  }
}

function longestPeriodKey(periods: Record<string, unknown>): string {
  const keys = Object.keys(periods)
    .map((key) => Number.parseInt(key, 10))
    .filter((key) => Number.isFinite(key))
    .sort((left, right) => right - left);
  return keys[0]?.toString() ?? '';
}

function periodKeyForRange(periods: Record<string, unknown>, range: TrendRange): string {
  return range === 'all' ? longestPeriodKey(periods) : rangeToPeriodKey[range];
}

function rowsFor(payload: Record<string, unknown>, range: TrendRange, top3Only: boolean, direction: TrendDirection): CloudflareTrendRow[] {
  const periods = asRecord(payload.periods);
  const period = asRecord(periods[periodKeyForRange(periods, range)]);
  const prizeScope = asRecord(period[top3Only ? 'top3_only' : 'all_prizes']);
  return asRows(prizeScope[direction]);
}

function toTrendNumbers(rows: CloudflareTrendRow[], providerLabel: string): TrendNumber[] {
  return rows
    .map((row) => ({
      number: normalizeNumber(row.number_key),
      count: numberValue(row.occurrence_count),
      rank: numberValue(row.rank),
      providers: [providerLabel],
      latestDate: textValue(row.latest_hit_date),
      latestDrawNo: textValue(row.latest_draw_no),
      distanceDays: row.distance_days == null ? null : numberValue(row.distance_days),
      distanceDraws: row.distance_draws == null ? null : numberValue(row.distance_draws)
    }))
    .filter((row) => row.number.length > 0)
    .slice(0, 20);
}

function sampleSizeFrom(rows: CloudflareTrendRow[]): number {
  for (const row of rows) {
    const sampleSize = numberValue(row.sample_size);
    if (sampleSize > 0) return sampleSize;
  }
  return 0;
}

function digitCountsFrom(rows: TrendNumber[]) {
  const digitCounts = new Map<string, number>(Array.from({length: 10}, (_, index) => [String(index), 0]));
  for (const row of rows) {
    for (const digit of row.number) digitCounts.set(digit, (digitCounts.get(digit) ?? 0) + row.count);
  }
  return Array.from(digitCounts.entries()).map(([digit, count]) => ({digit, count}));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = normalizeRange(String(url.searchParams.get('range') ?? '1y').trim());
  const mode = normalizeMode(url.searchParams.get('mode'));
  const requestedProvider = String(url.searchParams.get('provider') ?? 'magnum').trim();
  const selectedProvider = providersByCode.has(requestedProvider) ? requestedProvider : 'magnum';
  const top3Only = normalizeTop3Only(url.searchParams.get('top3Only'));
  const provider = providersByCode.get(selectedProvider);
  const providerName = provider?.name ?? selectedProvider;
  const providerLabel = provider?.shortName ?? selectedProvider;
  const state = await fetchHotColdStats(selectedProvider);

  if (!state.ok) {
    return NextResponse.json({error: state.reason, url: state.url}, {status: 502, headers: {'Cache-Control': 'no-store'}});
  }

  const hotRows = rowsFor(state.payload, range, top3Only, 'hot');
  const coldRows = rowsFor(state.payload, range, top3Only, 'cold');
  const hotNumbers = toTrendNumbers(hotRows, providerLabel);
  const coldNumbers = toTrendNumbers(coldRows, providerLabel);
  const sampleSize = Math.max(sampleSizeFrom(hotRows), sampleSizeFrom(coldRows));
  const visibleNumbers = [...hotNumbers, ...coldNumbers];

  return NextResponse.json(
    {
      from: '',
      to: '',
      range,
      mode,
      providerCount: 1,
      top3Only,
      drawCount: sampleSize,
      numberCount: sampleSize,
      hotNumbers,
      coldNumbers,
      digitCounts: digitCountsFrom(visibleNumbers),
      providerSummaries: [{providerCode: selectedProvider, providerName, drawCount: sampleSize, numberCount: sampleSize}] satisfies ProviderSummary[],
      source: state.url
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
