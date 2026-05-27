export type ProviderResultPayload = {
  provider_code: string;
  draw_date?: string;
  draw_no?: string;
  phase?: string;
  status?: string;
  has_result?: boolean;
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  special_numbers?: string[];
  consolation_numbers?: string[];
  slot_layout?: SlotLayoutPayload;
  updated_at?: string;
  generated_at?: string;
  source_type?: string;
  display_payload?: DisplayPayload;
};

export type SlotLayoutPayload = {
  top3_slots?: Record<string, string>;
  special_slots?: string[];
  consolation_slots?: string[];
};

export type DisplayNumberItem = {
  label?: string;
  key?: string;
  title?: string;
  number?: string;
  slot?: string;
};

export type DisplayPayload = {
  top3?: DisplayNumberItem[];
  special?: DisplayNumberItem[];
  consolation?: DisplayNumberItem[];
};

export type ProviderResultState =
  | {ok: true; providerCode: string; url: string; payload: ProviderResultPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type HistoryIndexEntry = {
  draw_date: string;
  draw_no?: string;
  has_result?: boolean;
  source_type?: string;
};

export type HistoryLatest30Payload = {
  provider_code: string;
  count: number;
  date_min?: string;
  date_max?: string;
  generated_at?: string;
  dates: string[];
  entries: HistoryIndexEntry[];
};

export type HistoryIndexState =
  | {ok: true; providerCode: string; url: string; payload: HistoryLatest30Payload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type HistoryLatest30State = HistoryIndexState;

export type AiHitHistoryMatch = {
  number: string;
  prizeLabel: string;
  activeIndexes: number[];
};

export type AiHitHistoryRecord = {
  id: string;
  drawDate: string;
  aiDigits: string[];
  hitMatches: AiHitHistoryMatch[];
};

export type AiHitHistoryPayload = {
  providerCode: string;
  hitCount: number | null;
  totalPeriods: number | null;
  records: AiHitHistoryRecord[];
  generatedAt?: string;
};

export type AiHitHistoryState =
  | {ok: true; providerCode: string; url: string; payload: AiHitHistoryPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type AiRecommendationPayload = {
  providerCode: string;
  drawDate?: string;
  drawNo?: string;
  coreDigits: string[];
  numbers: string[];
  generatedAt?: string;
};

export type AiRecommendationState =
  | {ok: true; providerCode: string; url: string; payload: AiRecommendationPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

const latestBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL ?? 'https://data.4dai88.com/latest/providers';
const historyBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL ?? 'https://data.4dai88.com/history';
const historyTestBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_TEST_BASE_URL ?? 'https://data.4dai88.com/history_test';
const aiHitHistoryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL ?? 'https://data.4dai88.com/ai_hit_history';
const aiRecommendationBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL && process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL.trim().length > 0
  ? process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL
  : 'https://data.4dai88.com/ai_recommendations';

function parseJsonSafely(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function compactErrorReason(error: unknown): string {
  if (error instanceof Error) {
    const errorWithCause = error as Error & {cause?: unknown};
    if (errorWithCause.cause && typeof errorWithCause.cause === 'object') {
      const causeMap = errorWithCause.cause as Record<string, unknown>;
      const causeCode = String(causeMap.code ?? '').trim();
      const causeMessage = String(causeMap.message ?? '').trim();
      if (causeCode || causeMessage) {
        return [causeCode, causeMessage].filter(Boolean).join(':');
      }
    }
    const message = error.message?.trim();
    if (message) return message;
  }
  return 'request_failed';
}

function buildCandidateUrls(baseUrls: string[], providerCode: string): string[] {
  const urls = new Set<string>();
  for (const raw of baseUrls) {
    const base = raw.trim().replace(/\/$/, '');
    if (!base) continue;
    urls.add(`${base}/${providerCode}.json`);
  }
  return Array.from(urls);
}

function normalizeNumbers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? '').trim()).filter(Boolean);
}

function normalizeAiTopDigitsFromValue(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value.map((item) => String(item ?? ''))
    : typeof value === 'string'
      ? value.split(/[,\s]+/)
      : [];
  const digits = raw
    .flatMap((item) => item.replace(/\D/g, '').split(''))
    .filter((item) => /^\d$/.test(item));
  return Array.from(new Set(digits)).sort((left, right) => left.localeCompare(right)).slice(0, 5);
}

function normalizeAiTopDigitsFromRecord(map: Record<string, unknown>): string[] {
  const sources = [
    map.dynamicAiTopDigits,
    map.dynamic_ai_top_digits,
    map.aiTopDigits,
    map.ai_top_digits,
    map.aiDigits,
    map.ai_digits,
    map.core_digits
  ];
  for (const source of sources) {
    const digits = normalizeAiTopDigitsFromValue(source);
    if (digits.length > 0) return digits;
  }
  return [];
}

function normalizeStringRecord(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, String(item ?? '').trim()]);
  return Object.fromEntries(entries.filter(([, item]) => item.length > 0));
}

function normalizeSlotLayout(value: unknown): SlotLayoutPayload | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const map = value as Record<string, unknown>;
  return {
    top3_slots: normalizeStringRecord(map.top3_slots),
    special_slots: normalizeNumbers(map.special_slots),
    consolation_slots: normalizeNumbers(map.consolation_slots)
  };
}

function normalizeDisplayItems(value: unknown): DisplayNumberItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      label: String(item.label ?? '').trim() || undefined,
      key: String(item.key ?? '').trim() || undefined,
      title: String(item.title ?? '').trim() || undefined,
      number: String(item.number ?? '').trim() || undefined,
      slot: String(item.slot ?? '').trim() || undefined
    }))
    .filter((item) => item.number || item.label || item.title || item.slot);
  return items.length > 0 ? items : undefined;
}

function normalizeDisplayPayload(value: unknown): DisplayPayload | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const map = value as Record<string, unknown>;
  return {
    top3: normalizeDisplayItems(map.top3),
    special: normalizeDisplayItems(map.special),
    consolation: normalizeDisplayItems(map.consolation)
  };
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
    special_numbers: normalizeNumbers(map.special_numbers),
    consolation_numbers: normalizeNumbers(map.consolation_numbers),
    slot_layout: normalizeSlotLayout(map.slot_layout),
    updated_at: String(map.updated_at ?? ''),
    generated_at: String(map.generated_at ?? ''),
    source_type: String(map.source_type ?? ''),
    display_payload: normalizeDisplayPayload(map.display_payload)
  };
}

function normalizeHistoryIndex(providerCode: string, raw: unknown): HistoryLatest30Payload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const rawDates = Array.isArray(map.dates) ? map.dates : [];
  const rawEntries = Array.isArray(map.entries) ? map.entries : [];
  const dates = rawDates.map((item) => String(item ?? '').trim()).filter(Boolean);
  const entries = rawEntries
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      draw_date: String(item.draw_date ?? '').trim(),
      draw_no: String(item.draw_no ?? '').trim() || undefined,
      has_result: item.has_result === true,
      source_type: String(item.source_type ?? '').trim() || undefined
    }))
    .filter((item) => item.draw_date.length > 0);
  return {
    provider_code: String(map.provider_code ?? providerCode),
    count: Number(map.count ?? dates.length),
    date_min: String(map.date_min ?? '').trim() || undefined,
    date_max: String(map.date_max ?? '').trim() || undefined,
    generated_at: String(map.generated_at ?? '').trim() || undefined,
    dates,
    entries
  };
}

function normalizeActiveIndexes(value: unknown, activeDigits: string[], aiDigits: string[]): number[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 0 && item < 5);
  }
  const normalizedDigits = new Set(activeDigits.map((digit) => String(digit ?? '').trim()).filter(Boolean));
  if (normalizedDigits.size === 0) return [];
  return aiDigits
    .map((digit, index) => ({digit, index}))
    .filter((item) => normalizedDigits.has(item.digit))
    .map((item) => item.index);
}

function normalizeAiHitHistory(providerCode: string, raw: unknown): AiHitHistoryPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const rawRecords = Array.isArray(map.records) ? map.records : [];
  const records = rawRecords
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item, recordIndex) => {
      const aiDigits = normalizeAiTopDigitsFromRecord(item).slice(0, 5);
      const rawMatches = Array.isArray(item.hit_matches ?? item.hitMatches) ? (item.hit_matches ?? item.hitMatches) as unknown[] : [];
      const hitMatches = rawMatches
        .filter((match): match is Record<string, unknown> => Boolean(match) && typeof match === 'object' && !Array.isArray(match))
        .map((match) => {
          const activeDigits = normalizeNumbers(match.active_digits ?? match.activeDigits);
          return {
            number: String(match.number ?? '').trim(),
            prizeLabel: String(match.prize_label ?? match.prizeLabel ?? '').trim(),
            activeIndexes: normalizeActiveIndexes(match.active_indexes ?? match.activeIndexes, activeDigits, aiDigits)
          };
        })
        .filter((match) => match.number.length > 0);
      return {
        id: String(item.id ?? item.draw_date ?? item.drawDate ?? `record-${recordIndex}`),
        drawDate: String(item.draw_date ?? item.drawDate ?? '').trim() || '----',
        aiDigits,
        hitMatches
      };
    })
    .filter((record) => record.aiDigits.length > 0 || record.hitMatches.length > 0);
  return {
    providerCode: String(map.provider_code ?? map.providerCode ?? providerCode),
    hitCount: Number.isFinite(Number(map.hit_count ?? map.hitCount)) ? Number(map.hit_count ?? map.hitCount) : null,
    totalPeriods: Number.isFinite(Number(map.total_periods ?? map.totalPeriods)) ? Number(map.total_periods ?? map.totalPeriods) : null,
    records,
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined
  };
}

function normalizeAiRecommendation(providerCode: string, raw: unknown): AiRecommendationPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const coreDigits = normalizeAiTopDigitsFromRecord(map);
  const candidates: unknown[] = [];
  if (Array.isArray(map.recommendations)) candidates.push(...map.recommendations);
  if (Array.isArray(map.numbers)) candidates.push(...map.numbers);
  if (Array.isArray(map.sets)) candidates.push(...map.sets);
  if (Array.isArray(map.recommended_numbers)) candidates.push(...map.recommended_numbers);
  const numbers = candidates
    .map((item) => String(item ?? '').replace(/\D/g, '').slice(0, 4))
    .filter((item) => item.length === 4)
    .slice(0, 5);
  return {
    providerCode: String(map.provider_code ?? map.providerCode ?? providerCode),
    drawDate: String(map.draw_date ?? map.drawDate ?? '').trim() || undefined,
    drawNo: String(map.draw_no ?? map.drawNo ?? '').trim() || undefined,
    coreDigits,
    numbers,
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined
  };
}

export async function fetchProviderLatest(providerCode: string, options?: {cache?: 'revalidate' | 'no-store'}): Promise<ProviderResultState> {
  const url = `${latestBaseUrl.replace(/\/$/, '')}/${providerCode}.json`;
  try {
    const response = await fetch(url, options?.cache === 'no-store' ? {cache: 'no-store', headers: {accept: 'application/json'}} : {next: {revalidate: 60}, headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeProviderPayload(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed'};
  }
}

export async function fetchRegionLatest(providerCodes: string[], options?: {cache?: 'revalidate' | 'no-store'}): Promise<ProviderResultState[]> {
  return Promise.all(providerCodes.map((providerCode) => fetchProviderLatest(providerCode, options)));
}

export async function fetchHistoryIndex(providerCode: string, indexName: string): Promise<HistoryIndexState> {
  const safeIndexName = indexName.replace(/[^a-zA-Z0-9_-]/g, '');
  const url = `${historyBaseUrl.replace(/\/$/, '')}/${providerCode}/index/${safeIndexName}.json`;
  try {
    const response = await fetch(url, {next: {revalidate: 300}, headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeHistoryIndex(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed'};
  }
}

export async function fetchHistoryLatest30(providerCode: string): Promise<HistoryLatest30State> {
  return fetchHistoryIndex(providerCode, 'latest30');
}

export async function fetchBestAvailableHistoryIndex(providerCode: string): Promise<HistoryIndexState> {
  const latest100 = await fetchHistoryIndex(providerCode, 'latest100');
  if (latest100.ok) return latest100;
  const latest30 = await fetchHistoryLatest30(providerCode);
  if (latest30.ok) return latest30;

  const fallbackUrl = `${historyTestBaseUrl.replace(/\/$/, '')}/${providerCode}/index/latest30.json`;
  try {
    const response = await fetch(fallbackUrl, {next: {revalidate: 300}, headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url: fallbackUrl, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url: fallbackUrl, reason: 'invalid_json'};
    const payload = normalizeHistoryIndex(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url: fallbackUrl, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url: fallbackUrl, payload};
  } catch (error) {
    return {ok: false, providerCode, url: fallbackUrl, reason: compactErrorReason(error)};
  }
}

export async function fetchRegionHistoryLatest30(providerCodes: string[]): Promise<HistoryLatest30State[]> {
  return Promise.all(providerCodes.map((providerCode) => fetchHistoryLatest30(providerCode)));
}

export async function fetchHistoryDaily(providerCode: string, date: string): Promise<ProviderResultState> {
  const safeDate = date.trim();
  const url = `${historyBaseUrl.replace(/\/$/, '')}/${providerCode}/${safeDate}.json`;
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return {ok: false, providerCode, url, reason: 'invalid_date'};
    const response = await fetch(url, {next: {revalidate: 300}, headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeProviderPayload(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed'};
  }
}

export async function fetchAiHitHistory(providerCode: string): Promise<AiHitHistoryState> {
  const candidates = buildCandidateUrls(
    [
      process.env.CLOUDFLARE_AI_HIT_HISTORY_BASE_URL ?? '',
      process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL ?? '',
      aiHitHistoryBaseUrl
    ],
    providerCode
  );

  if (candidates.length === 0) {
    return {ok: false, providerCode, url: '', reason: 'not_configured'};
  }

  let lastUrl = candidates[0] ?? '';
  let lastReason = 'request_failed';
  for (const url of candidates) {
    lastUrl = url;
    try {
      const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
      if (!response.ok) {
        lastReason = `status_${response.status}`;
        continue;
      }
      const decoded = parseJsonSafely(await response.text());
      if (!decoded) {
        lastReason = 'invalid_json';
        continue;
      }
      const payload = normalizeAiHitHistory(providerCode, decoded);
      if (!payload) {
        lastReason = 'invalid_json_shape';
        continue;
      }
      return {ok: true, providerCode, url, payload};
    } catch (error) {
      lastReason = compactErrorReason(error);
    }
  }
  return {ok: false, providerCode, url: lastUrl, reason: lastReason};
}

export async function fetchAiRecommendation(providerCode: string): Promise<AiRecommendationState> {
  if (!aiRecommendationBaseUrl.trim()) {
    return {ok: false, providerCode, url: '', reason: 'not_configured'};
  }
  const url = `${aiRecommendationBaseUrl.replace(/\/$/, '')}/${providerCode}.json`;
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeAiRecommendation(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed'};
  }
}
