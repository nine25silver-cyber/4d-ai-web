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
  | {ok: false; providerCode: string; url: string; reason: string; requestedDate?: string};

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

export type AiExpertHitStats = {
  top3Hits: number | null;
  specialHits: number | null;
  consoHits: number | null;
  totalHits: number | null;
};

export type AiHitHistoryReplayPayload = {
  providerCode: string;
  totalPeriods: number | null;
  allRound: AiExpertHitStats;
  top3Expert: AiExpertHitStats;
  generatedAt?: string;
};

export type AiHitHistoryReplayState =
  | {ok: true; providerCode: string; url: string; payload: AiHitHistoryReplayPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type AiRecommendationPayload = {
  providerCode: string;
  drawDate?: string;
  drawNo?: string;
  coreDigits: string[];
  top3ExpertDigits: string[];
  numbers: string[];
  generatedAt?: string;
};

export type AiRecommendationState =
  | {ok: true; providerCode: string; url: string; payload: AiRecommendationPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type ThreePlusOneAiRecommendationPayload = {
  providerCode: string;
  providerName?: string;
  recommendation4: string[];
  generatedAt?: string;
  sourceDrawDate?: string;
  sourceDrawNo?: string;
  status?: string;
};

export type ThreePlusOneAiRecommendationState =
  | {ok: true; providerCode: string; url: string; payload: ThreePlusOneAiRecommendationPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type ThreePlusOneAiHitHistoryPrize = {
  label: string;
  number: string;
  hit: boolean;
};

export type ThreePlusOneAiHitHistoryRecord = {
  id: string;
  drawDate: string;
  recommendation4: string[];
  prizes: ThreePlusOneAiHitHistoryPrize[];
  hitCount: number;
};

export type ThreePlusOneAiHitHistoryPayload = {
  providerCode: string;
  providerName?: string;
  latestDrawDate?: string;
  totalPeriods: number | null;
  anyHitDraws: number | null;
  totalHits: number | null;
  records: ThreePlusOneAiHitHistoryRecord[];
  generatedAt?: string;
};

export type ThreePlusOneAiHitHistoryState =
  | {ok: true; providerCode: string; url: string; payload: ThreePlusOneAiHitHistoryPayload}
  | {ok: false; providerCode: string; url: string; reason: string};

export type CombinationRankingItem = {
  rank: number;
  key: string;
  count: number;
  lastSeen?: string;
  currentGapDays: number;
  currentGapDraws: number;
  historicalMaxGapDays?: number;
  historicalMaxGapDraws?: number;
  providers: string[];
};

export type CombinationRankingBucket = {
  mode: string;
  rankingType: string;
  prizeScopeKey: string;
  coldSummary: CombinationRankingColdSummary;
  items: CombinationRankingItem[];
};

export type CombinationRankingColdSummary = {
  longestGapDays?: number;
  longestGapDraws?: number;
  combinationKey: string;
  description: string;
};

export type CombinationRankingFeed = {
  sourceType: string;
  window: string;
  scopeType: string;
  scope: string;
  scopeLabel: string;
  generatedAt?: string;
  updatedAt?: string;
  freshnessState: string;
  completeForCurrentCycle: boolean;
  includedProviders: string[];
  pendingProviders: string[];
  missingProviders: string[];
  coldSummary: CombinationRankingColdSummary;
  rankings: CombinationRankingBucket[];
};

export type CombinationRankingState =
  | {ok: true; url: string; payload: CombinationRankingFeed}
  | {ok: false; url: string; reason: string};

const latestBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_LATEST_BASE_URL ?? 'https://data.4dai88.com/latest/providers';
const historyBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_BASE_URL ?? 'https://data.4dai88.com/history_test';
const historyTestBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_HISTORY_TEST_BASE_URL ?? 'https://data.4dai88.com/history_test';
const combinationRankingBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_COMBINATION_RANKING_BASE_URL ?? 'https://data.4dai88.com/latest/combination-ranking';
const aiHitHistoryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_BASE_URL ?? 'https://data.4dai88.com/ai_hit_history';
const aiHitHistoryReplayBaseUrl = (process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL && process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL.trim().length > 0
  ? process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL
  : process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL) ?? 'https://data.4dai88.com/ai_hit_history_replay';
const aiRecommendationBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL && process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL.trim().length > 0
  ? process.env.NEXT_PUBLIC_CLOUDFLARE_AI_RECOMMENDATION_BASE_URL
  : 'https://data.4dai88.com/ai_recommendations';
const threePlusOneAiRecommendationBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_RECOMMENDATION_BASE_URL && process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_RECOMMENDATION_BASE_URL.trim().length > 0
  ? process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_RECOMMENDATION_BASE_URL
  : 'https://data.4dai88.com/three_plus_one_ai_recommendations';
const threePlusOneAiHitHistoryBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_HIT_HISTORY_BASE_URL && process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_HIT_HISTORY_BASE_URL.trim().length > 0
  ? process.env.NEXT_PUBLIC_CLOUDFLARE_THREE_PLUS_ONE_AI_HIT_HISTORY_BASE_URL
  : 'https://data.4dai88.com/three_plus_one_ai_hit_history';

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
  return Array.from(new Set(digits)).slice(0, 5);
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
    hitCount: normalizeRootNumber(map.hit_count ?? map.hitCount),
    totalPeriods: Number.isFinite(Number(map.total_periods ?? map.totalPeriods)) ? Number(map.total_periods ?? map.totalPeriods) : null,
    records,
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined
  };
}

function normalizeRootNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeRootCount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

function sumCounts(parts: Array<number | null>): number | null {
  return parts.every((part): part is number => typeof part === 'number')
    ? parts.reduce((sum, part) => sum + part, 0)
    : null;
}

function normalizeAiExpertHitStats(map: Record<string, unknown>, prefix: 'all_round' | 'top3_expert', camelPrefix: 'allRound' | 'top3Expert'): AiExpertHitStats {
  const top3Hits = normalizeRootCount(map[`${prefix}_top3_total_hits`] ?? map[`${camelPrefix}Top3TotalHits`]);
  const specialHits = normalizeRootCount(map[`${prefix}_special_total_hits`] ?? map[`${camelPrefix}SpecialTotalHits`]);
  const consoHits = normalizeRootCount(map[`${prefix}_conso_total_hits`] ?? map[`${camelPrefix}ConsoTotalHits`]);
  return {
    top3Hits,
    specialHits,
    consoHits,
    totalHits: sumCounts([top3Hits, specialHits, consoHits])
  };
}

function normalizeAiHitHistoryReplay(providerCode: string, raw: unknown): AiHitHistoryReplayPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  return {
    providerCode: String(map.provider_code ?? map.providerCode ?? providerCode),
    totalPeriods: normalizeRootCount(map.total_periods ?? map.totalPeriods),
    allRound: normalizeAiExpertHitStats(map, 'all_round', 'allRound'),
    top3Expert: normalizeAiExpertHitStats(map, 'top3_expert', 'top3Expert'),
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined
  };
}

function normalizeAiRecommendation(providerCode: string, raw: unknown): AiRecommendationPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const coreDigits = normalizeAiTopDigitsFromRecord(map);
  const top3ExpertDigits = normalizeTop3ExpertDigits(map);
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
    top3ExpertDigits,
    numbers,
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined
  };
}

function normalizeCombinationRankingFeed(raw: unknown): CombinationRankingFeed | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const rankingItems = Array.isArray(map.rankings) ? map.rankings : [];
  const rankings = rankingItems
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item) => {
      const rawItems = Array.isArray(item.items) ? item.items : [];
      return {
        mode: String(item.mode ?? '').trim(),
        rankingType: String(item.ranking_type ?? item.rankingType ?? '').trim(),
        prizeScopeKey: String(item.prize_scope_key ?? item.prizeScopeKey ?? '').trim(),
        coldSummary: normalizeCombinationColdSummary(item.cold_summary ?? item.coldSummary),
        items: rawItems
          .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object' && !Array.isArray(row))
          .map((row) => ({
            rank: Number(row.rank ?? 0),
            key: String(row.key ?? '').trim(),
            count: Number(row.count ?? 0),
            lastSeen: String(row.last_seen ?? row.lastSeen ?? '').trim() || undefined,
            currentGapDays: Number(row.current_gap_days ?? row.currentGapDays ?? 0),
            currentGapDraws: Number(row.current_gap_draws ?? row.currentGapDraws ?? 0),
            historicalMaxGapDays: normalizeOptionalNumber(row.historical_max_gap_days ?? row.historicalMaxGapDays),
            historicalMaxGapDraws: normalizeOptionalNumber(row.historical_max_gap_draws ?? row.historicalMaxGapDraws),
            providers: normalizeNumbers(row.providers)
          }))
          .filter((row) => row.key.length > 0)
      };
    })
    .filter((item) => item.mode && item.rankingType && item.prizeScopeKey);

  return {
    sourceType: String(map.source_type ?? map.sourceType ?? '').trim(),
    window: String(map.window ?? '').trim(),
    scopeType: String(map.scope_type ?? map.scopeType ?? '').trim(),
    scope: String(map.scope ?? '').trim(),
    scopeLabel: String(map.scope_label ?? map.scopeLabel ?? '').trim(),
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined,
    updatedAt: String(map.updated_at ?? map.updatedAt ?? '').trim() || undefined,
    freshnessState: String(map.freshness_state ?? map.freshnessState ?? '').trim(),
    completeForCurrentCycle: map.complete_for_current_cycle !== false && map.completeForCurrentCycle !== false,
    includedProviders: normalizeNumbers(map.included_providers ?? map.includedProviders),
    pendingProviders: normalizeNumbers(map.pending_providers ?? map.pendingProviders),
    missingProviders: normalizeNumbers(map.missing_providers ?? map.missingProviders),
    coldSummary: normalizeCombinationColdSummary(map.cold_summary ?? map.coldSummary),
    rankings
  };
}

function normalizeCombinationColdSummary(raw: unknown): CombinationRankingColdSummary {
  const map = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  return {
    longestGapDays: normalizeOptionalNumber(map.longest_gap_days ?? map.longestGapDays),
    longestGapDraws: normalizeOptionalNumber(map.longest_gap_draws ?? map.longestGapDraws),
    combinationKey: String(map.combination_key ?? map.combinationKey ?? '').trim(),
    description: String(map.description ?? '').trim()
  };
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeTop3ExpertDigits(map: Record<string, unknown>): string[] {
  const strategies = Array.isArray(map.experimentalStrategies ?? map.experimental_strategies)
    ? (map.experimentalStrategies ?? map.experimental_strategies) as unknown[]
    : [];
  const strategy = strategies.find((item): item is Record<string, unknown> =>
    Boolean(item) &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    String((item as Record<string, unknown>).id ?? '').trim() === 'top3_expert'
  );
  return strategy ? normalizeAiTopDigitsFromValue(strategy.digits) : [];
}

function normalizeThreePlusOneRecommendation4(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value.map((item) => String(item ?? ''))
    : typeof value === 'string'
      ? value.split(/[,\s]+/)
      : [];
  return raw
    .flatMap((item) => item.replace(/\D/g, '').split(''))
    .filter((item) => /^\d$/.test(item))
    .slice(0, 4);
}

function normalizeThreeDigitValue(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.slice(-3).padStart(3, '0');
}

function normalizeBooleanHit(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || String(value ?? '').toLowerCase() === 'true';
}

function normalizeThreePlusOneAiRecommendation(providerCode: string, raw: unknown): ThreePlusOneAiRecommendationPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const recommendation4 = normalizeThreePlusOneRecommendation4(map.recommendation4 ?? map.recommendation_4);
  if (recommendation4.length !== 4) return null;
  return {
    providerCode: String(map.provider_code ?? map.providerCode ?? providerCode),
    providerName: String(map.provider_name ?? map.providerName ?? '').trim() || undefined,
    recommendation4,
    generatedAt: String(map.generated_at ?? map.generatedAt ?? '').trim() || undefined,
    sourceDrawDate: String(map.source_draw_date ?? map.sourceDrawDate ?? '').trim() || undefined,
    sourceDrawNo: String(map.source_draw_no ?? map.sourceDrawNo ?? '').trim() || undefined,
    status: String(map.status ?? '').trim() || undefined
  };
}

function normalizeThreePlusOneAiHitHistory(providerCode: string, raw: unknown): ThreePlusOneAiHitHistoryPayload | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const map = raw as Record<string, unknown>;
  const rawRecords = Array.isArray(map.records) ? map.records : [];
  const records = rawRecords
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item, recordIndex) => {
      const recommendation4 = normalizeThreePlusOneRecommendation4(item.recommendation4 ?? item.recommendation_4);
      const prizes: ThreePlusOneAiHitHistoryPrize[] = [
        {label: 'Top 1', number: normalizeThreeDigitValue(item.actual_top1_last3), hit: normalizeBooleanHit(item.top1_hit)},
        {label: 'Top 2', number: normalizeThreeDigitValue(item.actual_top2_last3), hit: normalizeBooleanHit(item.top2_hit)},
        {label: 'Top 3', number: normalizeThreeDigitValue(item.actual_top3_last3), hit: normalizeBooleanHit(item.top3_hit)}
      ].filter((prize) => prize.number.length > 0);
      return {
        id: String(item.id ?? item.target_draw_date ?? item.targetDrawDate ?? `record-${recordIndex}`),
        drawDate: String(item.target_draw_date ?? item.targetDrawDate ?? '').trim() || '----',
        recommendation4,
        prizes,
        hitCount: normalizeRootCount(item.hit_count ?? item.hitCount) ?? 0
      };
    })
    .filter((record) => record.recommendation4.length === 4 || record.prizes.length > 0)
    .sort((a, b) => b.drawDate.localeCompare(a.drawDate))
    .slice(0, 100);
  return {
    providerCode: String(map.provider_code ?? map.providerCode ?? providerCode),
    providerName: String(map.provider_name ?? map.providerName ?? '').trim() || undefined,
    latestDrawDate: String(map.latest_draw_date ?? map.latestDrawDate ?? '').trim() || undefined,
    totalPeriods: normalizeRootCount(map.window_size ?? map.total_periods ?? map.totalPeriods),
    anyHitDraws: normalizeRootCount(map.summary && typeof map.summary === 'object' && !Array.isArray(map.summary) ? (map.summary as Record<string, unknown>).any_hit_draws : map.any_hit_draws),
    totalHits: normalizeRootCount(map.summary && typeof map.summary === 'object' && !Array.isArray(map.summary) ? (map.summary as Record<string, unknown>).total_hits : map.total_hits),
    records,
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return {ok: false, providerCode, url, reason: 'invalid_date', requestedDate: safeDate};
    const response = await fetch(url, {next: {revalidate: 300}, headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`, requestedDate: safeDate};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json', requestedDate: safeDate};
    const payload = normalizeProviderPayload(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape', requestedDate: safeDate};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: error instanceof Error ? error.message : 'request_failed', requestedDate: safeDate};
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

export async function fetchAiHitHistoryReplay(providerCode: string): Promise<AiHitHistoryReplayState> {
  const candidates = buildCandidateUrls([
    process.env.CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL ?? '',
    process.env.NEXT_PUBLIC_CLOUDFLARE_AI_HIT_HISTORY_REPLAY_BASE_URL ?? '',
    aiHitHistoryReplayBaseUrl
  ], providerCode);
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
      const payload = normalizeAiHitHistoryReplay(providerCode, decoded);
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

export async function fetchThreePlusOneAiRecommendation(providerCode: string): Promise<ThreePlusOneAiRecommendationState> {
  if (!threePlusOneAiRecommendationBaseUrl.trim()) {
    return {ok: false, providerCode, url: '', reason: 'not_configured'};
  }
  const url = `${threePlusOneAiRecommendationBaseUrl.replace(/\/$/, '')}/${providerCode}.json`;
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeThreePlusOneAiRecommendation(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: compactErrorReason(error)};
  }
}

export async function fetchThreePlusOneAiHitHistory(providerCode: string): Promise<ThreePlusOneAiHitHistoryState> {
  if (!threePlusOneAiHitHistoryBaseUrl.trim()) {
    return {ok: false, providerCode, url: '', reason: 'not_configured'};
  }
  const url = `${threePlusOneAiHitHistoryBaseUrl.replace(/\/$/, '')}/${providerCode}.json`;
  try {
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, providerCode, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, providerCode, url, reason: 'invalid_json'};
    const payload = normalizeThreePlusOneAiHitHistory(providerCode, decoded);
    if (!payload) return {ok: false, providerCode, url, reason: 'invalid_json_shape'};
    return {ok: true, providerCode, url, payload};
  } catch (error) {
    return {ok: false, providerCode, url, reason: compactErrorReason(error)};
  }
}

export async function fetchCombinationRanking(window: string, scopeType: string, scope: string): Promise<CombinationRankingState> {
  const safeWindow = window.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeScopeType = scopeType.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, '');
  const url = `${combinationRankingBaseUrl.replace(/\/$/, '')}/${safeWindow}/${safeScopeType}/${safeScope}.json`;
  try {
    if (!safeWindow || !safeScopeType || !safeScope) return {ok: false, url, reason: 'invalid_params'};
    const response = await fetch(url, {cache: 'no-store', headers: {accept: 'application/json'}});
    if (!response.ok) return {ok: false, url, reason: `status_${response.status}`};
    const decoded = parseJsonSafely(await response.text());
    if (!decoded) return {ok: false, url, reason: 'invalid_json'};
    const payload = normalizeCombinationRankingFeed(decoded);
    if (!payload) return {ok: false, url, reason: 'invalid_json_shape'};
    return {ok: true, url, payload};
  } catch (error) {
    return {ok: false, url, reason: compactErrorReason(error)};
  }
}
