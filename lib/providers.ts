export const PROVIDERS = [
  'magnum',
  'sports_toto',
  'da_ma_cai',
  'sabah88',
  'sarawak',
  'sandakan',
  'grand_dragon',
  'nine_lotto',
  'singapore',
] as const;

export type Provider = (typeof PROVIDERS)[number];

export type ProviderResult = {
  draw_date?: string;
  draw_number?: string;
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  special_numbers?: string[];
  consolation_numbers?: string[];
  phase?: string;
  status?: string;
};

const BASE_URL = 'https://data.4dai88.com/latest';

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str.length ? str : undefined;
}

export function normalizeProviderResult(payload: any): ProviderResult {
  const latest = payload?.latest_result ?? payload?.result ?? payload;
  return {
    draw_date: asString(latest?.draw_date ?? latest?.date),
    draw_number: asString(latest?.draw_number ?? latest?.draw_no),
    first_prize: asString(latest?.first_prize ?? latest?.top1),
    second_prize: asString(latest?.second_prize ?? latest?.top2),
    third_prize: asString(latest?.third_prize ?? latest?.top3),
    special_numbers: toArray(latest?.special_numbers ?? latest?.special),
    consolation_numbers: toArray(latest?.consolation_numbers ?? latest?.consolation),
    phase: asString(latest?.phase),
    status: asString(latest?.status),
  };
}

export async function fetchHome(): Promise<any> {
  const res = await fetch(`${BASE_URL}/home.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch home feed');
  return res.json();
}

export async function fetchProvider(provider: Provider): Promise<ProviderResult> {
  const res = await fetch(`${BASE_URL}/providers/${provider}.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${provider} feed`);
  const data = await res.json();
  return normalizeProviderResult(data);
}
