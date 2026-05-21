import {NextResponse} from 'next/server';
import {fetchHistoryDaily, fetchHistoryLatest30, type ProviderResultPayload} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

type Prize = 'top3' | 'special' | 'consolation';

type TrendNumber = {
  number: string;
  count: number;
  providers: string[];
  latestDate: string;
};

type ProviderSummary = {
  providerCode: string;
  providerName: string;
  drawCount: number;
  numberCount: number;
};

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

function normalizeNumber(value: string) {
  const number = value.replace(/\D/g, '').slice(0, 4);
  return number.length === 4 ? number : '';
}

function inRange(date: string, fromDate: string, toDate: string) {
  if (fromDate && date < fromDate) return false;
  if (toDate && date > toDate) return false;
  return true;
}

function candidateRows(payload: ProviderResultPayload): Array<{prize: Prize; number: string}> {
  const top3 = [
    {prize: 'top3' as const, number: payload.first_prize ?? ''},
    {prize: 'top3' as const, number: payload.second_prize ?? ''},
    {prize: 'top3' as const, number: payload.third_prize ?? ''}
  ];
  const special = (payload.special_numbers ?? []).map((number) => ({prize: 'special' as const, number}));
  const consolation = (payload.consolation_numbers ?? []).map((number) => ({prize: 'consolation' as const, number}));
  return [...top3, ...special, ...consolation];
}

function sortedTrendRows(map: Map<string, {count: number; providers: Set<string>; latestDate: string}>, direction: 'hot' | 'cold'): TrendNumber[] {
  return Array.from(map.entries())
    .map(([number, item]) => ({
      number,
      count: item.count,
      providers: Array.from(item.providers).sort(),
      latestDate: item.latestDate
    }))
    .sort((left, right) => {
      const countCompare = direction === 'hot' ? right.count - left.count : left.count - right.count;
      if (countCompare !== 0) return countCompare;
      const dateCompare = direction === 'hot' ? right.latestDate.localeCompare(left.latestDate) : left.latestDate.localeCompare(right.latestDate);
      return dateCompare || left.number.localeCompare(right.number);
    })
    .slice(0, 20);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = String(url.searchParams.get('range') ?? '1y').trim();
  const fromDate = normalizeDate(url.searchParams.get('from')) || rangeToFromDate(range);
  const toDate = normalizeDate(url.searchParams.get('to'));
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));
  const selectedProviders = providerCodes.length > 0 ? providerCodes : Array.from(providersByCode.keys());
  const numberCounts = new Map<string, {count: number; providers: Set<string>; latestDate: string}>();
  const digitCounts = new Map<string, number>(Array.from({length: 10}, (_, index) => [String(index), 0]));
  const providerSummaries: ProviderSummary[] = [];
  let drawCount = 0;
  let scannedNumberCount = 0;

  await Promise.all(
    selectedProviders.map(async (providerCode) => {
      const provider = providersByCode.get(providerCode);
      const index = await fetchHistoryLatest30(providerCode);
      if (!index.ok) {
        providerSummaries.push({providerCode, providerName: provider?.name ?? providerCode, drawCount: 0, numberCount: 0});
        return;
      }

      const dates = index.payload.dates.filter((date) => inRange(date, fromDate, toDate)).slice(0, 30);
      const dailyResults = await Promise.all(dates.map((date) => fetchHistoryDaily(providerCode, date)));
      let providerDrawCount = 0;
      let providerNumberCount = 0;

      for (const daily of dailyResults) {
        if (!daily.ok) continue;
        providerDrawCount += 1;
        drawCount += 1;
        for (const row of candidateRows(daily.payload)) {
          const number = normalizeNumber(row.number);
          if (!number) continue;
          providerNumberCount += 1;
          scannedNumberCount += 1;
          for (const digit of number) digitCounts.set(digit, (digitCounts.get(digit) ?? 0) + 1);
          const current = numberCounts.get(number) ?? {count: 0, providers: new Set<string>(), latestDate: ''};
          current.count += 1;
          current.providers.add(provider?.shortName ?? providerCode);
          if ((daily.payload.draw_date ?? '') > current.latestDate) current.latestDate = daily.payload.draw_date ?? '';
          numberCounts.set(number, current);
        }
      }

      providerSummaries.push({
        providerCode,
        providerName: provider?.name ?? providerCode,
        drawCount: providerDrawCount,
        numberCount: providerNumberCount
      });
    })
  );

  return NextResponse.json(
    {
      from: fromDate,
      to: toDate,
      range,
      providerCount: selectedProviders.length,
      drawCount,
      numberCount: scannedNumberCount,
      hotNumbers: sortedTrendRows(numberCounts, 'hot'),
      coldNumbers: sortedTrendRows(numberCounts, 'cold'),
      digitCounts: Array.from(digitCounts.entries()).map(([digit, count]) => ({digit, count})),
      providerSummaries: providerSummaries.sort((left, right) => left.providerName.localeCompare(right.providerName))
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
