import {NextResponse} from 'next/server';
import {fetchHistoryDaily, fetchHistoryLatest30, type ProviderResultPayload} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

type HitRow = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prize: string;
  number: string;
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

function candidateRows(payload: ProviderResultPayload): Array<{prize: string; number: string}> {
  return [
    {prize: 'Top3', number: payload.first_prize ?? ''},
    {prize: 'Top3', number: payload.second_prize ?? ''},
    {prize: 'Top3', number: payload.third_prize ?? ''},
    ...(payload.special_numbers ?? []).map((number) => ({prize: 'Special', number})),
    ...(payload.consolation_numbers ?? []).map((number) => ({prize: 'Consolation', number}))
  ]
    .map((row) => ({...row, number: normalizeNumber(row.number)}))
    .filter((row) => row.number.length === 4);
}

function matches(number: string, target: string, mode: 'exact' | 'boxed') {
  if (mode === 'exact') return number.includes(target);
  const sortedTarget = target.split('').sort().join('');
  for (let start = 0; start <= 1; start += 1) {
    const chunk = number.slice(start, start + 3);
    if (chunk.length !== 3) continue;
    if (chunk.split('').sort().join('') === sortedTarget) return true;
  }
  return false;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = String(url.searchParams.get('target') ?? '').replace(/\D/g, '').slice(0, 3);
  const mode: 'exact' = 'exact';
  const range = 'all';
  const fromDate = '';
  const toDate = normalizeDate(url.searchParams.get('to'));
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));
  const selectedProviders = providerCodes.length > 0 ? providerCodes : Array.from(providersByCode.keys());
  const rows: HitRow[] = [];
  let drawCount = 0;

  if (target.length !== 3) {
    return NextResponse.json({target, mode, rows: [], drawCount, error: 'target_must_be_3_digits'}, {headers: {'Cache-Control': 'no-store'}});
  }

  await Promise.all(
    selectedProviders.map(async (providerCode) => {
      const provider = providersByCode.get(providerCode);
      const index = await fetchHistoryLatest30(providerCode);
      if (!index.ok) return;
      const dates = index.payload.dates.filter((date) => inRange(date, fromDate, toDate)).slice(0, 30);
      for (const date of dates) {
        const daily = await fetchHistoryDaily(providerCode, date);
        if (!daily.ok) continue;
        drawCount += 1;
        for (const candidate of candidateRows(daily.payload)) {
          if (!matches(candidate.number, target, mode)) continue;
          rows.push({
            providerCode,
            providerName: provider?.name ?? providerCode,
            drawDate: daily.payload.draw_date ?? '',
            drawNo: daily.payload.draw_no ?? '',
            prize: candidate.prize,
            number: candidate.number
          });
        }
      }
    })
  );

  rows.sort((left, right) => right.drawDate.localeCompare(left.drawDate) || left.providerName.localeCompare(right.providerName));

  return NextResponse.json(
    {
      target,
      mode,
      range,
      from: fromDate,
      to: toDate,
      drawCount,
      resultCount: rows.length,
      rows: rows.slice(0, 300)
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
