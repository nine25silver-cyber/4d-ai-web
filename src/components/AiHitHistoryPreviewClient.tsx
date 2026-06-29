'use client';

import {useEffect, useMemo, useState} from 'react';

type Labels = {
  locked: string;
  hitCountPendingValue: string;
  hitRowCountLabel: string;
  hitRecommendedLabel: string;
  hitResultLabel: string;
  hitPrizePlaceholder: string;
  hitExpandLabel: string;
  hitCollapseLabel: string;
  firstPrizeLabel: string;
  secondPrizeLabel: string;
  thirdPrizeLabel: string;
  specialPrizeLabel: string;
  consolationPrizeLabel: string;
};

type Props = {
  providerCode?: string;
  labels: Labels;
  hitCount?: number | null;
  rows?: AiHitHistoryRow[];
  onResolvedCount?: (count: number | null) => void;
  onResolvedPeriods?: (periods: number) => void;
  onDebugTopRows?: (rows: string[]) => void;
  onDebugStatus?: (status: string) => void;
};

export type AiHitHistoryRow = {
  id: string;
  date: string;
  uniqueKey?: string;
  sortKey?: string;
  debugMeta?: string;
  aiDigits: string[];
  hitMatches: AiHitHistoryMatch[];
};

export type AiHitHistoryMatch = {
  number: string;
  prizeLabel: string;
  activeIndexes: number[];
};

const emptyRows: AiHitHistoryRow[] = [];

const previewRows = Array.from({length: 6}, (_, index) => ({
  id: `preview-${index}`,
  date: '----',
  aiDigits: [],
  hitMatches: [
    {number: '----', prizeLabel: '', activeIndexes: [0, 1, 2, 3]},
    {number: '----', prizeLabel: '', activeIndexes: [1, 3, 4]}
  ]
}));
const aiHitHistoryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL ?? 'https://data.4dai88.com/ai_hit_history';

function buildCandidateUrls(providerCode: string): string[] {
  const dedup = new Set<string>();
  const add = (raw: string) => {
    const base = raw.trim().replace(/\/$/, '');
    if (!base) return;
    dedup.add(`${base}/${providerCode}.json`);
  };
  add(aiHitHistoryBaseUrl);
  add('https://data.4dai88.com/ai_hit_history');
  return Array.from(dedup);
}

export function AiHitHistoryPreviewClient({providerCode, labels, hitCount, rows, onResolvedCount, onResolvedPeriods, onDebugTopRows, onDebugStatus}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fallbackRows, setFallbackRows] = useState<AiHitHistoryRow[]>([]);
  const [fallbackStateText, setFallbackStateText] = useState<string>('');
  const serverRows = rows ?? emptyRows;

  useEffect(() => {
    async function loadFallback() {
      if (!providerCode) return;
      if (serverRows.length > 0) {
        setFallbackRows([]);
        setFallbackStateText('');
        onDebugStatus?.(`client_bypass=server_rows rows=${serverRows.length}`);
        return;
      }
      setFallbackStateText('Loading latest 100 records...');
      const fromCloudflare = await loadFromCloudflare(providerCode);
      if (fromCloudflare.rows.length > 0) {
        setFallbackRows(fromCloudflare.rows);
        const status = `client_cloudflare=ok rows=${fromCloudflare.rows.length}`;
        setFallbackStateText(`Loaded ${fromCloudflare.rows.length} records (Cloudflare)`);
        onDebugStatus?.(status);
        return;
      }
      onDebugStatus?.(`client_cloudflare=failed reason=${fromCloudflare.reason}`);
      setFallbackRows([]);
      setFallbackStateText('Cloudflare hit history temporarily unavailable');
    }
    void loadFallback();
  }, [providerCode, serverRows.length]);

  const mergedRows = useMemo(() => mergeRows(serverRows, fallbackRows), [fallbackRows, serverRows]);
  const displayRows = useMemo(() => mergedRows.length > 0 ? mergedRows : previewRows, [mergedRows]);
  const serverHitCount = useMemo(() => serverRows.reduce((sum, row) => sum + row.hitMatches.length, 0), [serverRows]);
  useEffect(() => {
    if (!onResolvedPeriods) return;
    onResolvedPeriods(mergedRows.length);
  }, [mergedRows.length, onResolvedPeriods]);
  useEffect(() => {
    if (!onDebugTopRows) return;
    onDebugTopRows(
      mergedRows.slice(0, 5).map((row, index) =>
        `${index + 1}. ${row.debugMeta ?? `draw_date=${row.date}`} | sortKey=${row.sortKey ?? '----'}`
      )
    );
  }, [mergedRows, onDebugTopRows]);
  useEffect(() => {
    if (displayRows.length === 0) {
      setExpandedId(null);
      return;
    }
    const stillExists = displayRows.some((row) => row.id === expandedId);
    if (!stillExists) setExpandedId(displayRows[0].id);
  }, [displayRows, expandedId]);
  const fallbackHitCount = useMemo(() => fallbackRows.reduce((sum, row) => sum + row.hitMatches.length, 0), [fallbackRows]);
  const countText = typeof hitCount === 'number'
    ? `${hitCount}`
    : serverRows.length > 0
      ? `${serverHitCount}`
    : fallbackRows.length > 0
      ? `${fallbackHitCount}`
      : labels.hitCountPendingValue;
  useEffect(() => {
    if (!onResolvedCount) return;
    if (typeof hitCount === 'number') {
      onResolvedCount(hitCount);
      return;
    }
    if (serverRows.length > 0) {
      onResolvedCount(serverHitCount);
      return;
    }
    if (fallbackRows.length > 0) {
      onResolvedCount(fallbackHitCount);
      return;
    }
    onResolvedCount(null);
  }, [fallbackHitCount, fallbackRows.length, hitCount, onResolvedCount, serverHitCount, serverRows.length]);

  return (
    <div className="mt-5 space-y-3">
      {serverRows.length < 100 ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          {fallbackStateText || '等待命中记录数据...'}
        </p>
      ) : null}
      {displayRows.map((row) => {
        const expanded = expandedId === row.id;
        return (
          <article key={row.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? labels.hitCollapseLabel : labels.hitExpandLabel}
              onClick={() => setExpandedId(expanded ? null : row.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
            >
              <span className="text-base font-black text-slate-950">{row.date}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-700">
                  {labels.hitRowCountLabel.replace('{count}', `${row.hitMatches.length}`)}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 border-b-2 border-r-2 border-slate-400 transition ${expanded ? '-rotate-135' : 'rotate-45'}`}
                />
              </span>
            </button>

            {expanded ? <ExpandedHitDetails labels={labels} row={row} /> : null}
          </article>
        );
      })}
      <span className="sr-only">{countText}</span>
    </div>
  );
}

async function loadFromCloudflare(providerCode: string): Promise<{rows: AiHitHistoryRow[]; reason: string}> {
  const candidateUrls = buildCandidateUrls(providerCode);
  let lastReason = 'request_failed';
  const cacheBuster = Math.floor(Date.now() / 10000).toString();
  for (const url of candidateUrls) {
    try {
      const requestUrl = `${url}${url.includes('?') ? '&' : '?'}ts=${cacheBuster}`;
      const response = await fetch(requestUrl, {cache: 'no-store', headers: {accept: 'application/json'}});
      if (!response.ok) {
        lastReason = `status_${response.status}@${requestUrl}`;
        continue;
      }
      const json = await response.json() as Record<string, unknown>;
      const records = Array.isArray(json.records) ? json.records : [];
      const mappedRows = records
        .map((item, index) => toCloudflareRow(item as Record<string, unknown>, index))
        .slice(0, 100);
      if (mappedRows.length === 0) {
        lastReason = `empty_records@${requestUrl}`;
        continue;
      }
      return {
        rows: mappedRows,
        reason: `ok@${requestUrl}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'request_failed';
      lastReason = `${message}@${url}`;
    }
  }
  return {rows: [], reason: lastReason};
}

function toCloudflareRow(item: Record<string, unknown>, index: number): AiHitHistoryRow {
  const drawDate = String(item.draw_date ?? item.drawDate ?? '').trim() || '----';
  const aiDigitsRaw = normalizeDigitsFromRecord(item);
  const aiDigits = [...aiDigitsRaw, '--', '--', '--', '--', '--'].slice(0, 5);
  const rawMatches = Array.isArray(item.hit_matches ?? item.hitMatches) ? (item.hit_matches ?? item.hitMatches) as unknown[] : [];
  const hitMatches: AiHitHistoryMatch[] = rawMatches
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => ({
      number: String(entry.number ?? '').replace(/\D/g, '').slice(0, 4) || '----',
      prizeLabel: String(entry.prize_label ?? entry.prizeLabel ?? '').trim(),
      activeIndexes: Array.isArray(entry.active_indexes ?? entry.activeIndexes)
        ? ((entry.active_indexes ?? entry.activeIndexes) as unknown[])
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value >= 0 && value < 5)
        : []
    }));

  return {
    id: String(item.id ?? `${drawDate}|cf|${index}`),
    date: drawDate,
    uniqueKey: `cf|${drawDate}|${index}|${String(item.id ?? '')}`,
    sortKey: String((item.generated_at ?? item.generatedAt ?? drawDate) || '----'),
    debugMeta: `draw_date=${drawDate} | checked_at=${String(item.generated_at ?? item.generatedAt ?? drawDate).trim() || drawDate} | source=cloudflare`,
    aiDigits,
    hitMatches: hitMatches.length > 0 ? hitMatches : [{number: '----', prizeLabel: '', activeIndexes: []}]
  };
}

function normalizeDigitsFromRecord(item: Record<string, unknown>): string[] {
  const sources = [
    item.dynamicAiTopDigits,
    item.dynamic_ai_top_digits,
    item.aiTopDigits,
    item.ai_top_digits,
    item.aiDigits,
    item.ai_digits,
    item.core_digits
  ];
  for (const source of sources) {
    const digits = normalizeDigits(source);
    if (digits.length > 0) return digits;
  }
  return [];
}

function normalizeDigits(raw: unknown): string[] {
  if (Array.isArray(raw) && raw.length > 0 && /^\d$/.test(String(raw[0] ?? '').trim())) {
    return raw
      .map((item) => String(item ?? '').trim())
      .filter((item) => /^\d$/.test(item));
  }
  if (typeof raw === 'string') {
    return raw.replace(/\D/g, '').split('').slice(0, 5);
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => String(item ?? '').trim())
    .filter((item) => /^\d$/.test(item));
}

function mergeRows(primary: AiHitHistoryRow[], fallback: AiHitHistoryRow[]): AiHitHistoryRow[] {
  const bySignature = new Map<string, AiHitHistoryRow>();
  for (const row of primary) bySignature.set(rowSignature(row), row);
  for (const row of fallback) {
    const signature = rowSignature(row);
    if (!bySignature.has(signature)) bySignature.set(signature, row);
  }
  return Array.from(bySignature.values())
    .sort((left, right) => {
      const byDrawDate = parseDateOnly(right.date) - parseDateOnly(left.date);
      if (byDrawDate !== 0) return byDrawDate;
      const byWithinDay = parseTime(right.sortKey) - parseTime(left.sortKey);
      if (byWithinDay !== 0) return byWithinDay;
      return (right.sortKey ?? '').localeCompare(left.sortKey ?? '');
    })
    .slice(0, 100);
}

function rowSignature(row: AiHitHistoryRow): string {
  const hits = row.hitMatches.map((match) => `${match.number}|${match.prizeLabel}|${match.activeIndexes.join(',')}`).join(';');
  return `${row.uniqueKey ?? row.id}|${row.date}|${row.aiDigits.join(',')}|${hits}`;
}

function parseTime(input?: string): number {
  if (!input) return 0;
  const text = input.trim();
  if (!text) return 0;
  const direct = Date.parse(text);
  if (!Number.isNaN(direct)) return direct;

  // dd/mm/yy or d/m/yy
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]);
    const rawYear = Number(slash[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    const t = Date.UTC(year, month - 1, day);
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function parseDateOnly(input?: string): number {
  if (!input) return 0;
  const text = input.trim();
  if (!text) return 0;
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const day = Number(slash[1]);
    const month = Number(slash[2]);
    const rawYear = Number(slash[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    const t = Date.UTC(year, month - 1, day);
    if (!Number.isNaN(t)) return t;
  }
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const t = Date.UTC(year, month - 1, day);
    if (!Number.isNaN(t)) return t;
  }
  return parseTime(text);
}

function ExpandedHitDetails({labels, row}: {labels: Labels; row: AiHitHistoryRow}) {
  const [activeHitIndex, setActiveHitIndex] = useState(0);
  const hitMatches = row.hitMatches.length > 0 ? row.hitMatches : [{number: '----', prizeLabel: '', activeIndexes: []}];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveHitIndex((current) => (current + 1) % hitMatches.length);
    }, 1250);
    return () => window.clearInterval(timer);
  }, [hitMatches.length]);

  const activeIndexes = new Set(hitMatches[activeHitIndex]?.activeIndexes ?? []);

  return (
    <div className="border-t border-slate-100 px-4 pb-4 pt-3">
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <p className="text-xs font-black uppercase text-slate-500">{labels.hitRecommendedLabel}</p>
          <RecommendationNumbers activeHitIndex={activeHitIndex} activeIndexes={activeIndexes} digits={row.aiDigits} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-slate-500">{labels.hitResultLabel}</p>
          <WinningNumbers activeHitIndex={activeHitIndex} labels={labels} matches={hitMatches} />
        </div>
      </div>
    </div>
  );
}

function RecommendationNumbers({activeHitIndex, activeIndexes, digits}: {activeHitIndex: number; activeIndexes: Set<number>; digits: string[]}) {
  const normalized = Array.from({length: 5}, (_, index) => digits[index] ?? '--');
  return (
    <div className="mt-2 flex gap-1.5">
      {normalized.map((digit, index) => (
        <span
          key={`${activeHitIndex}-${index}`}
          className={`flex h-9 w-10 items-center justify-center rounded-lg border text-sm font-black ${
            activeIndexes.has(index)
              ? 'ai-hit-sequence-flash border-amber-300 bg-amber-50 text-amber-950'
              : 'border-slate-200 bg-slate-50 text-slate-400'
          }`}
        >
          {digit}
        </span>
      ))}
    </div>
  );
}

function WinningNumbers({activeHitIndex, labels, matches}: {activeHitIndex: number; labels: Labels; matches: AiHitHistoryMatch[]}) {
  if (matches.length === 1 && matches[0]?.number === '----' && !matches[0]?.prizeLabel) {
    return (
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
        很遗憾，这期没有中奖
      </div>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {matches.map((match, index) => {
        const prize = localizePrizeLabel(match.prizeLabel, labels);
        return (
          <span
            key={index}
            className={`rounded-lg border px-3 py-2 text-sm font-black ${
              activeHitIndex === index
                ? 'ai-hit-sequence-flash border-amber-300 bg-amber-50 text-amber-950'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            {`${match.number || '----'} ${prize.label}`}
          </span>
        );
      })}
    </div>
  );
}

function localizePrizeLabel(rawLabel: string, labels: Labels): {label: string; kind: 'first' | 'second' | 'third' | 'special' | 'consolation' | 'unknown'} {
  const normalized = rawLabel.trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (/^(first|1st)(\s+prize)?$/.test(normalized) || normalized.includes('头奖') || normalized.includes('hadiah pertama')) {
    return {label: labels.firstPrizeLabel, kind: 'first'};
  }
  if (/^(second|2nd)(\s+prize)?$/.test(normalized) || normalized.includes('二奖') || normalized.includes('hadiah kedua')) {
    return {label: labels.secondPrizeLabel, kind: 'second'};
  }
  if (/^(third|3rd)(\s+prize)?$/.test(normalized) || normalized.includes('三奖') || normalized.includes('hadiah ketiga')) {
    return {label: labels.thirdPrizeLabel, kind: 'third'};
  }
  if (normalized.startsWith('special') || normalized.includes('special numbers') || normalized.includes('特别奖') || normalized.includes('hadiah khas')) {
    return {label: labels.specialPrizeLabel, kind: 'special'};
  }
  if (normalized.startsWith('consolation') || normalized.includes('consolation numbers') || normalized.includes('安慰奖') || normalized.includes('hadiah saguhati')) {
    return {label: labels.consolationPrizeLabel, kind: 'consolation'};
  }
  return {label: rawLabel.trim() || labels.hitPrizePlaceholder, kind: 'unknown'};
}
