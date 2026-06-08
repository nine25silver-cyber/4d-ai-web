import {NextResponse} from 'next/server';
import {regions} from '@/lib/providers';

type SearchMode = 'exact' | 'boxed';
type PrizeType = 'top3' | 'special' | 'consolation';

type MatchRow = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prize: 'top3' | 'special' | 'consolation';
  label: string;
  number: string;
};

type SearchIndexResult = {
  provider_code?: string;
  draw_date?: string;
  draw_no?: string;
  number?: string;
  position?: number;
  prize_type?: string;
  prize_rank?: number;
  source_type?: string;
};

type SearchIndexPayload = {
  count?: number;
  results?: SearchIndexResult[];
};

const SEARCH_TEST_BASE_URL = 'https://data.4dai88.com/search/v1/4d';
const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 300;
const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));

function normalizeNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function boxedKey(value: string) {
  return value.split('').sort().join('');
}

function resultLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function searchIndexUrl(target: string, mode: SearchMode) {
  const path = mode === 'boxed' ? `boxed/${boxedKey(target)}` : `exact/${target}`;
  return `${SEARCH_TEST_BASE_URL}/${path}.json`;
}

async function fetchSearchIndex(target: string, mode: SearchMode): Promise<SearchIndexPayload> {
  const response = await fetch(searchIndexUrl(target, mode), {
    cache: 'no-store',
    headers: {Accept: 'application/json'}
  });
  if (response.status === 404) return {count: 0, results: []};
  if (!response.ok) throw new Error(`search_index_fetch_failed_${response.status}`);
  const payload = (await response.json()) as SearchIndexPayload;
  return {
    count: typeof payload.count === 'number' ? payload.count : 0,
    results: Array.isArray(payload.results) ? payload.results : []
  };
}

function prizeType(value: string | undefined): PrizeType {
  if (value === 'special') return 'special';
  if (value === 'consolation') return 'consolation';
  return 'top3';
}

function prizeLabel(row: SearchIndexResult) {
  const type = prizeType(row.prize_type);
  const position = typeof row.position === 'number' && Number.isFinite(row.position) ? row.position : 0;
  if (type === 'special') return `S${position || ''}`.trim();
  if (type === 'consolation') return `C${position || ''}`.trim();
  if (row.prize_type === 'second') return '2nd';
  if (row.prize_type === 'third') return '3rd';
  return '1st';
}

function toMatchRow(row: SearchIndexResult): MatchRow | null {
  const providerCode = String(row.provider_code ?? '').trim();
  const provider = providersByCode.get(providerCode);
  const number = normalizeNumber(String(row.number ?? ''));
  if (!provider || number.length !== 4) return null;
  return {
    providerCode,
    providerName: provider.name,
    drawDate: String(row.draw_date ?? '').trim(),
    drawNo: String(row.draw_no ?? '').trim(),
    prize: prizeType(row.prize_type),
    label: prizeLabel(row),
    number
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = normalizeNumber(url.searchParams.get('number') ?? '');
  const mode = url.searchParams.get('mode') === 'boxed' ? 'boxed' : 'exact';
  const limit = resultLimit(url.searchParams.get('limit'));
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));

  if (target.length !== 4) {
    return NextResponse.json({error: 'invalid_number', results: []}, {status: 400});
  }

  const providerFilter = providerCodes.length > 0 ? new Set(providerCodes) : null;
  const payload = await fetchSearchIndex(target, mode);
  const results = (payload.results ?? [])
    .map(toMatchRow)
    .filter((row): row is MatchRow => row !== null)
    .filter((row) => (providerFilter ? providerFilter.has(row.providerCode) : true));

  return NextResponse.json({number: target, mode, count: results.length, results: results.slice(0, limit)}, {headers: {'Cache-Control': 'no-store'}});
}
