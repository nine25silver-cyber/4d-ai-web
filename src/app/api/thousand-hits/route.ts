import {NextResponse} from 'next/server';
import {regions} from '@/lib/providers';

type HitRow = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prizeType: PrizeType;
  prize: string;
  number: string;
};

type SearchMode = 'exact' | 'boxed';
type PrizeType = 'first' | 'second' | 'third' | 'special' | 'consolation';

type SearchIndexResult = {
  provider_code?: string;
  draw_date?: string;
  draw_no?: string;
  matched_last3?: string;
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

const searchBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_SEARCH_BASE_URL ?? 'https://data.4dai88.com/search/v1';
const DEFAULT_LIMIT = 300;
const MAX_LIMIT = 300;
const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));

function normalizeNumber(value: string) {
  const number = value.replace(/\D/g, '').slice(0, 4);
  return number.length === 4 ? number : '';
}

function normalizeTarget(value: string | null) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 3);
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
  const pathMode = mode === 'boxed' ? 'boxed' : 'exact';
  const key = mode === 'boxed' ? boxedKey(target) : target;
  return `${searchBaseUrl.replace(/\/$/, '')}/3d/${pathMode}/${encodeURIComponent(key)}.json`;
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

function prizeType(row: SearchIndexResult): PrizeType {
  const rawPrizeType = String(row.prize_type ?? '').trim();
  if (rawPrizeType === 'special') return 'special';
  if (rawPrizeType === 'consolation') return 'consolation';
  if (rawPrizeType === 'second') return 'second';
  if (rawPrizeType === 'third') return 'third';
  return 'first';
}

function prizeLabel(value: PrizeType) {
  if (value === 'special') return 'Special';
  if (value === 'consolation') return 'Consolation';
  if (value === 'second') return '2nd';
  if (value === 'third') return '3rd';
  return '1st';
}

function toHitRow(row: SearchIndexResult): HitRow | null {
  const providerCode = String(row.provider_code ?? '').trim();
  const provider = providersByCode.get(providerCode);
  const number = normalizeNumber(String(row.number ?? ''));
  if (!provider || number.length !== 4) return null;
  const type = prizeType(row);
  return {
    providerCode,
    providerName: provider.name,
    drawDate: String(row.draw_date ?? '').trim(),
    drawNo: String(row.draw_no ?? '').trim(),
    prizeType: type,
    prize: prizeLabel(type),
    number
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = normalizeTarget(url.searchParams.get('target'));
  const mode: SearchMode = url.searchParams.get('mode') === 'boxed' ? 'boxed' : 'exact';
  const limit = resultLimit(url.searchParams.get('limit'));
  const providerCodes = (url.searchParams.get('providers') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => providersByCode.has(item));

  if (target.length !== 3) {
    return NextResponse.json({target, mode, rows: [], drawCount: 0, error: 'target_must_be_3_digits'}, {headers: {'Cache-Control': 'no-store'}});
  }

  const providerFilter = providerCodes.length > 0 ? new Set(providerCodes) : null;
  const payload = await fetchSearchIndex(target, mode);
  const rows = (payload.results ?? [])
    .map(toHitRow)
    .filter((row): row is HitRow => row !== null)
    .filter((row) => (providerFilter ? providerFilter.has(row.providerCode) : true))
    .sort((left, right) => right.drawDate.localeCompare(left.drawDate) || left.providerName.localeCompare(right.providerName));

  return NextResponse.json(
    {
      target,
      mode,
      drawCount: rows.length,
      resultCount: rows.length,
      rows: rows.slice(0, limit)
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
