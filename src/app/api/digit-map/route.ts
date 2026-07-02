import {NextResponse} from 'next/server';

type DictionaryTextSection = {
  labelEn: string;
  labelZh: string;
  keywordsZh: string[];
  keywordsEn: string[];
};

type DictionaryEntry = {
  number: string;
  imageUrl: string;
  keywordsZh: string[];
  keywordsEn: string[];
  source: string;
  sections: DictionaryTextSection[];
};

type RemoteDictionaryEntry = {
  number?: string;
  image_url?: string;
  keywords_zh?: unknown[];
  keywords_en?: unknown[];
  source?: string;
  provider_texts?: Record<string, unknown>;
};

type RemoteDictionaryPayload = {
  ok?: boolean;
  entry?: RemoteDictionaryEntry;
  results?: RemoteDictionaryEntry[];
  entries?: RemoteDictionaryEntry[];
};

const dictionaryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DICTIONARY_BASE_URL ?? 'https://data.4dai88.com/dictionary/v1';
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 40;
const sectionOrder = ['magnum', 'toto', 'damacai', 'tpk'];
const brokenDictionaryImageHost = 'assets.4dai88.com';
const legacyDictionaryImageBaseUrl = 'https://4dno.org/images/dictionaries';

function normalizeQuery(value: string | null) {
  return String(value ?? '').trim().slice(0, 32);
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
    : [];
}

function textSectionFromValue(sectionCode: string, value: unknown): DictionaryTextSection {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const row = value as Record<string, unknown>;
    return {
      labelEn: String(row.label_en ?? sectionCode).trim(),
      labelZh: String(row.label_zh ?? sectionCode).trim(),
      keywordsZh: stringList(row.keywords_zh),
      keywordsEn: stringList(row.keywords_en)
    };
  }
  const values = stringList(value);
  const zh = values.filter((item) => /[\u3400-\u9fff]/.test(item));
  const en = values.filter((item) => !/[\u3400-\u9fff]/.test(item));
  return {
    labelEn: en[0] ?? sectionCode,
    labelZh: zh[0] ?? sectionCode,
    keywordsZh: zh.slice(1),
    keywordsEn: en.slice(1)
  };
}

function toDictionaryEntry(row: RemoteDictionaryEntry): DictionaryEntry | null {
  const number = normalizeDigits(String(row.number ?? '')).slice(0, 4);
  if (number.length < 3) return null;
  const sectionMap = new Map(Object.entries(row.provider_texts ?? {}).map(([key, value]) => [key, textSectionFromValue(key, value)]));
  const sections = [
    ...sectionOrder.map((key) => sectionMap.get(key)).filter((item): item is DictionaryTextSection => item !== undefined),
    ...Array.from(sectionMap.entries())
      .filter(([key]) => !sectionOrder.includes(key))
      .map(([, value]) => value)
  ];
  return {
    number,
    imageUrl: normalizeImageUrl(row.image_url),
    keywordsZh: stringList(row.keywords_zh),
    keywordsEn: stringList(row.keywords_en),
    source: String(row.source ?? '').trim(),
    sections
  };
}

function normalizeImageUrl(value: unknown) {
  const imageUrl = String(value ?? '').trim();
  if (!imageUrl) return '';
  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    return imageUrl;
  }
  if (parsed?.hostname !== brokenDictionaryImageHost) return imageUrl;
  // Cloudflare Dictionary owns image_url; this Web display fallback uses a reachable legacy URL when assets.4dai88.com is unavailable, without changing the Dictionary contract.
  const match = /^\/dictionary-images\/v1\/([^/]+)\/([^/.]+)\.(jpg|jpeg|png|webp)$/i.exec(parsed.pathname);
  if (!match) return imageUrl;
  const [, source, number, extension] = match;
  return `${legacyDictionaryImageBaseUrl}/${source}-${number}.${extension.toLowerCase()}`;
}

function rootUrl() {
  return dictionaryBaseUrl.replace(/\/$/, '');
}

function numberUrl(number: string) {
  return `${rootUrl()}/numbers/${encodeURIComponent(number)}.json`;
}

function searchUrl(query: string, limit: number) {
  return `${rootUrl()}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
}

async function fetchDictionaryUrl(url: string): Promise<RemoteDictionaryPayload> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {Accept: 'application/json'}
  });
  if (response.status === 404) return {ok: true, entries: []};
  if (!response.ok) throw new Error(`dictionary_fetch_failed_${response.status}`);
  const payload = (await response.json()) as RemoteDictionaryPayload;
  if (payload.ok === false) return {ok: true, entries: []};
  return payload;
}

function entriesFromPayload(payload: RemoteDictionaryPayload, limit: number) {
  const rows = payload.entry ? [payload.entry] : (payload.results ?? payload.entries ?? []);
  return rows.map(toDictionaryEntry).filter((entry): entry is DictionaryEntry => entry !== null).slice(0, limit);
}

function threeDigitTargets(digits: string) {
  if (digits.length === 3) return [digits];
  if (digits.length !== 4) return [];
  const targets = new Set<string>();
  for (let index = 0; index < digits.length; index += 1) {
    targets.add(digits.slice(0, index) + digits.slice(index + 1));
  }
  return Array.from(targets);
}

async function fetchNumberEntries(digits: string, limit: number) {
  const targets = digits.length === 4 ? [digits, ...threeDigitTargets(digits)] : [digits];
  const entries = (await Promise.all(targets.map(async (target) => entriesFromPayload(await fetchDictionaryUrl(numberUrl(target)), 1)))).flat();
  const byNumber = new Map<string, DictionaryEntry>();
  for (const entry of entries) {
    if (!byNumber.has(entry.number)) byNumber.set(entry.number, entry);
  }
  return Array.from(byNumber.values()).slice(0, limit);
}

async function fetchKeywordEntries(query: string, limit: number) {
  return entriesFromPayload(await fetchDictionaryUrl(searchUrl(query, limit)), limit);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get('query') ?? url.searchParams.get('q'));
  const limit = normalizeLimit(url.searchParams.get('limit'));

  if (!query) {
    return NextResponse.json({query, entries: [], count: 0}, {headers: {'Cache-Control': 'no-store'}});
  }

  const digits = normalizeDigits(query);
  const isNumberQuery = digits.length === query.length && /^\d{1,4}$/.test(digits);
  const entries = isNumberQuery ? await fetchNumberEntries(digits, limit) : await fetchKeywordEntries(query, limit);

  return NextResponse.json(
    {query, entries, count: entries.length},
    {headers: {'Cache-Control': 'no-store'}}
  );
}
