import {NextResponse} from 'next/server';
import {fetchHistoryDaily, fetchHistoryLatest30, type ProviderResultPayload} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

type ProviderSummary = {
  providerCode: string;
  providerName: string;
  drawCount: number;
};

type RankingRow = {
  boxed: string;
  count: number;
  latestDate: string;
  sampleNumbers: string[];
  providers: string[];
  groupType: '24' | '12' | '6' | '4';
};
type PrizeFilter = 'all' | 'top3' | 'special' | 'consolation';
type TrendMode = 'hot' | 'cold';

const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));
const rangeYears = new Map([
  ['1y', 1],
  ['2y', 2],
  ['3y', 3],
  ['5y', 5],
  ['10y', 10],
  ['15y', 15],
  ['20y', 20],
  ['30y', 30]
]);

function normalizeDate(value: string | null) {
  const date = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '';
}

function dateYearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

function rangeToFromDate(range: string) {
  const years = rangeYears.get(range);
  return years ? dateYearsAgo(years) : '';
}

function inRange(date: string, fromDate: string, toDate: string) {
  if (fromDate && date < fromDate) return false;
  if (toDate && date > toDate) return false;
  return true;
}

function normalizeNumber(value: string) {
  const number = value.replace(/\D/g, '').slice(0, 4);
  return number.length === 4 ? number : '';
}

function candidateNumbers(payload: ProviderResultPayload, prize: PrizeFilter) {
  const rows = [
    {prize: 'top3' as const, value: payload.first_prize ?? ''},
    {prize: 'top3' as const, value: payload.second_prize ?? ''},
    {prize: 'top3' as const, value: payload.third_prize ?? ''},
    ...(payload.special_numbers ?? []).map((value) => ({prize: 'special' as const, value})),
    ...(payload.consolation_numbers ?? []).map((value) => ({prize: 'consolation' as const, value}))
  ];
  return rows
    .filter((row) => prize === 'all' || row.prize === prize)
    .map((row) => normalizeNumber(row.value))
    .filter((value) => value.length === 4);
}

function boxedSignature(number: string) {
  return number.split('').sort().join('');
}

function boxedType(signature: string): RankingRow['groupType'] {
  const set = new Set(signature.split(''));
  if (set.size === 4) return '24';
  if (set.size === 3) return '12';
  if (set.size === 2) return signature[0] === signature[3] ? '4' : '6';
  return '4';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode: TrendMode = url.searchParams.get('mode') === 'cold' ? 'cold' : 'hot';
  const prize: PrizeFilter = url.searchParams.get('prize') === 'top3'
    ? 'top3'
    : url.searchParams.get('prize') === 'special'
      ? 'special'
      : url.searchParams.get('prize') === 'consolation'
        ? 'consolation'
        : 'all';
  const range = String(url.searchParams.get('range') ?? '1y').trim();
  const fromDate = normalizeDate(url.searchParams.get('from')) || rangeToFromDate(range);
  const toDate = normalizeDate(url.searchParams.get('to'));
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));
  const selectedProviders = providerCodes.length > 0 ? providerCodes : Array.from(providersByCode.keys());

  const ranking = new Map<string, {count: number; latestDate: string; samples: Set<string>; providers: Set<string>}>();
  const providerSummaries: ProviderSummary[] = [];
  let drawCount = 0;
  let numberCount = 0;

  await Promise.all(
    selectedProviders.map(async (providerCode) => {
      const provider = providersByCode.get(providerCode);
      const index = await fetchHistoryLatest30(providerCode);
      if (!index.ok) {
        providerSummaries.push({providerCode, providerName: provider?.name ?? providerCode, drawCount: 0});
        return;
      }
      const dates = index.payload.dates.filter((date) => inRange(date, fromDate, toDate)).slice(0, 30);
      let providerDrawCount = 0;
      for (const date of dates) {
        const daily = await fetchHistoryDaily(providerCode, date);
        if (!daily.ok) continue;
        providerDrawCount += 1;
        drawCount += 1;
        const numbers = candidateNumbers(daily.payload, prize);
        numberCount += numbers.length;
        for (const number of numbers) {
          const signature = boxedSignature(number);
          const existing = ranking.get(signature) ?? {count: 0, latestDate: '', samples: new Set<string>(), providers: new Set<string>()};
          existing.count += 1;
          existing.providers.add(provider?.shortName ?? providerCode);
          if (existing.samples.size < 5) existing.samples.add(number);
          if ((daily.payload.draw_date ?? '') > existing.latestDate) existing.latestDate = daily.payload.draw_date ?? '';
          ranking.set(signature, existing);
        }
      }
      providerSummaries.push({providerCode, providerName: provider?.name ?? providerCode, drawCount: providerDrawCount});
    })
  );

  const rows: RankingRow[] = Array.from(ranking.entries())
    .map(([boxed, row]) => ({
      boxed,
      count: row.count,
      latestDate: row.latestDate,
      sampleNumbers: Array.from(row.samples).sort(),
      providers: Array.from(row.providers).sort(),
      groupType: boxedType(boxed)
    }))
    .sort((left, right) => {
      const countDiff = mode === 'hot' ? right.count - left.count : left.count - right.count;
      if (countDiff !== 0) return countDiff;
      const dateDiff = mode === 'hot' ? right.latestDate.localeCompare(left.latestDate) : left.latestDate.localeCompare(right.latestDate);
      return dateDiff || left.boxed.localeCompare(right.boxed);
    })
    .slice(0, 100);

  return NextResponse.json(
    {
      range,
      mode,
      prize,
      from: fromDate,
      to: toDate,
      providerCount: selectedProviders.length,
      drawCount,
      numberCount,
      rankings: rows,
      providerSummaries: providerSummaries.sort((left, right) => left.providerName.localeCompare(right.providerName))
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
