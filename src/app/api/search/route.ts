import {NextResponse} from 'next/server';
import {fetchHistoryDaily, fetchHistoryLatest30, type ProviderResultPayload} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

type SearchMode = 'exact' | 'boxed';

type MatchRow = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prize: 'top3' | 'special' | 'consolation';
  label: string;
  number: string;
};

const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));

function normalizeNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function boxedKey(value: string) {
  return value.split('').sort().join('');
}

function isMatch(target: string, candidate: string, mode: SearchMode) {
  const normalized = normalizeNumber(candidate);
  if (normalized.length !== 4) return false;
  return mode === 'boxed' ? boxedKey(normalized) === boxedKey(target) : normalized === target;
}

function candidateRows(payload: ProviderResultPayload): Array<Omit<MatchRow, 'providerCode' | 'providerName' | 'drawDate' | 'drawNo'>> {
  const top3 = [
    {prize: 'top3' as const, label: '1st', number: payload.first_prize ?? ''},
    {prize: 'top3' as const, label: '2nd', number: payload.second_prize ?? ''},
    {prize: 'top3' as const, label: '3rd', number: payload.third_prize ?? ''}
  ];
  const special = (payload.special_numbers ?? []).map((number, index) => ({prize: 'special' as const, label: `S${index + 1}`, number}));
  const consolation = (payload.consolation_numbers ?? []).map((number, index) => ({prize: 'consolation' as const, label: `C${index + 1}`, number}));
  return [...top3, ...special, ...consolation];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = normalizeNumber(url.searchParams.get('number') ?? '');
  const mode = url.searchParams.get('mode') === 'boxed' ? 'boxed' : 'exact';
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));

  if (target.length !== 4) {
    return NextResponse.json({error: 'invalid_number', results: []}, {status: 400});
  }

  const selectedProviders = providerCodes.length > 0 ? providerCodes : Array.from(providersByCode.keys());
  const settled = await Promise.allSettled(
    selectedProviders.map(async (providerCode) => {
      const index = await fetchHistoryLatest30(providerCode);
      if (!index.ok) return [];
      const dates = index.payload.dates.slice(0, 30);
      const dailyResults = await Promise.all(dates.map((date) => fetchHistoryDaily(providerCode, date)));
      const provider = providersByCode.get(providerCode);
      const rows: MatchRow[] = [];
      for (const daily of dailyResults) {
        if (!daily.ok) continue;
        for (const row of candidateRows(daily.payload)) {
          if (!isMatch(target, row.number, mode)) continue;
          rows.push({
            providerCode,
            providerName: provider?.name ?? providerCode,
            drawDate: daily.payload.draw_date ?? '',
            drawNo: daily.payload.draw_no ?? '',
            prize: row.prize,
            label: row.label,
            number: row.number
          });
        }
      }
      return rows;
    })
  );

  const results = settled.flatMap((item) => (item.status === 'fulfilled' ? item.value : []));
  return NextResponse.json({number: target, mode, count: results.length, results: results.slice(0, 300)}, {headers: {'Cache-Control': 'no-store'}});
}
