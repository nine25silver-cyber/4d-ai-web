import {NextResponse} from 'next/server';
import {fetchCombinationRanking, type CombinationRankingBucket, type CombinationRankingItem} from '@/lib/cloudflare';
import {regions} from '@/lib/providers';

type RankingRow = {
  rank: number;
  boxed: string;
  count: number;
  latestDate: string;
  sampleNumbers: string[];
  providers: string[];
  groupType: '24' | '12' | '6' | '4';
  currentGapDays: number;
  currentGapDraws?: number;
  historicalMaxGapDays?: number;
  historicalMaxGapDraws?: number;
};

type TrendMode = 'hot' | 'cold';
type PackageType = 'ABCD' | 'AABC' | 'AABB' | 'AAAB';
type ScopeType = 'provider' | 'group';

const providersByCode = new Map(regions.flatMap((region) => region.providers).map((provider) => [provider.code, provider]));
const supportedProviders = new Set(providersByCode.keys());
const supportedGroupScopes = new Set([
  'west',
  'east',
  'cambodia',
  'singapore',
  'west_east',
  'west_cambodia',
  'west_singapore',
  'east_cambodia',
  'east_singapore',
  'cambodia_singapore',
  'west_east_cambodia',
  'west_east_singapore',
  'west_cambodia_singapore',
  'east_cambodia_singapore',
  'west_east_cambodia_singapore'
]);

// Product-confirmed canonical draw-sequence rule for region-group draw counts.
const canonicalDrawProviderByGroupScope: Partial<Record<string, string>> = {
  west: 'magnum',
  east: 'sabah88',
  singapore: 'singapore'
};
const dailyDrawsEqualDaysGroupScopes = new Set(['cambodia']);

type DrawGapFields = {
  currentGapDraws?: number;
  historicalMaxGapDraws?: number;
};

function normalizeWindow(value: string) {
  if (value === '365d') return '1y';
  if (value === '180d') return '6m';
  if (value === '1y' || value === 'all') return value;
  return '6m';
}

function normalizePrizeScope(value: string) {
  const requested = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const ordered = [
    requested.includes('top') || requested.includes('top3') ? 'top' : '',
    requested.includes('special') ? 'special' : '',
    requested.includes('consolation') ? 'consolation' : ''
  ].filter(Boolean);
  return ordered.length > 0 ? ordered.join('_') : 'top';
}

function normalizePackageType(value: string): PackageType {
  if (value === 'AABC' || value === 'AABB' || value === 'AAAB') return value;
  if (value === '12' || value === '12X') return 'AABC';
  if (value === '6' || value === '6X') return 'AABB';
  if (value === '4' || value === '4X') return 'AAAB';
  return 'ABCD';
}

function normalizeGroupType(mode: string): RankingRow['groupType'] {
  if (mode === 'ABCD') return '24';
  if (mode === 'AABC') return '12';
  if (mode === 'AABB') return '6';
  return '4';
}

function normalizeScope(url: URL): {scopeType: ScopeType; scope: string} {
  const scopeType: ScopeType = url.searchParams.get('scopeType') === 'provider' ? 'provider' : 'group';
  const rawScope = String(url.searchParams.get('scope') ?? '').trim();
  if (scopeType === 'provider') {
    return supportedProviders.has(rawScope) ? {scopeType, scope: rawScope} : {scopeType, scope: 'magnum'};
  }
  return supportedGroupScopes.has(rawScope) ? {scopeType, scope: rawScope} : {scopeType, scope: 'west'};
}

function providerLabel(providerCode: string) {
  return providersByCode.get(providerCode)?.shortName ?? providerCode;
}

function findRankingBucket(buckets: CombinationRankingBucket[], packageType: PackageType, rankingType: TrendMode, prizeScopeKey: string): CombinationRankingBucket | undefined {
  return buckets.find((item) =>
    item.mode === packageType &&
    item.rankingType === rankingType &&
    item.prizeScopeKey === prizeScopeKey
  );
}

function drawGapFieldsFromItem(item: CombinationRankingItem | undefined): DrawGapFields {
  if (!item) return {};
  return {
    currentGapDraws: item.currentGapDraws,
    historicalMaxGapDraws: item.historicalMaxGapDraws
  };
}

function dailyDrawGapFieldsFromItem(item: CombinationRankingItem): DrawGapFields {
  return {
    currentGapDraws: item.currentGapDays,
    historicalMaxGapDraws: item.historicalMaxGapDays
  };
}

function buildRows(items: CombinationRankingItem[], packageType: PackageType, drawGapsByKey: Map<string, DrawGapFields>): RankingRow[] {
  return items
    .filter((item) => item.key !== '----')
    .map((item) => {
      const drawGaps = drawGapsByKey.get(item.key) ?? {};
      return {
        rank: item.rank,
        boxed: item.key,
        count: item.count,
        latestDate: item.lastSeen ?? '',
        sampleNumbers: [],
        providers: item.providers.map(providerLabel).sort(),
        groupType: normalizeGroupType(packageType),
        currentGapDays: item.currentGapDays,
        currentGapDraws: drawGaps.currentGapDraws,
        historicalMaxGapDays: item.historicalMaxGapDays,
        historicalMaxGapDraws: drawGaps.historicalMaxGapDraws
      };
    });
}

async function buildDrawGapsByKey({
  scopeType,
  scope,
  window,
  packageType,
  rankingType,
  prizeScopeKey,
  groupItems
}: {
  scopeType: ScopeType;
  scope: string;
  window: string;
  packageType: PackageType;
  rankingType: TrendMode;
  prizeScopeKey: string;
  groupItems: CombinationRankingItem[];
}): Promise<Map<string, DrawGapFields>> {
  if (scopeType === 'provider') {
    return new Map(groupItems.map((item) => [item.key, drawGapFieldsFromItem(item)]));
  }

  if (dailyDrawsEqualDaysGroupScopes.has(scope)) {
    return new Map(groupItems.map((item) => [item.key, dailyDrawGapFieldsFromItem(item)]));
  }

  const canonicalProvider = canonicalDrawProviderByGroupScope[scope];
  if (!canonicalProvider) return new Map();

  const canonicalFeed = await fetchCombinationRanking(window, 'provider', canonicalProvider);
  if (!canonicalFeed.ok) return new Map();

  const canonicalBucket = findRankingBucket(canonicalFeed.payload.rankings, packageType, rankingType, prizeScopeKey);
  if (!canonicalBucket) return new Map();

  return new Map(
    canonicalBucket.items
      .filter((item) => item.key !== '----')
      .map((item) => [item.key, drawGapFieldsFromItem(item)])
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode: TrendMode = url.searchParams.get('mode') === 'cold' ? 'cold' : 'hot';
  const prizeScopeKey = normalizePrizeScope(String(url.searchParams.get('prizeScope') ?? url.searchParams.get('prize') ?? 'top').trim());
  const packageType = normalizePackageType(String(url.searchParams.get('packageType') ?? 'ABCD').trim());
  const window = normalizeWindow(String(url.searchParams.get('range') ?? url.searchParams.get('window') ?? '6m').trim());
  const {scopeType, scope} = normalizeScope(url);
  const feed = await fetchCombinationRanking(window, scopeType, scope);

  if (!feed.ok) {
    return NextResponse.json(
      {error: 'combination_ranking_unavailable', reason: feed.reason, url: feed.url},
      {status: 502, headers: {'Cache-Control': 'no-store'}}
    );
  }

  const rankingType = mode === 'cold' ? 'cold' : 'hot';
  const bucket = findRankingBucket(feed.payload.rankings, packageType, rankingType, prizeScopeKey);
  const bucketItems = bucket?.items ?? [];
  const drawGapsByKey = await buildDrawGapsByKey({
    scopeType,
    scope,
    window,
    packageType,
    rankingType,
    prizeScopeKey,
    groupItems: bucketItems
  });
  const rows = buildRows(bucketItems, packageType, drawGapsByKey);

  const numberCount = rows.reduce((sum, row) => sum + row.count, 0);
  const upstreamColdSummary = bucket?.coldSummary ?? feed.payload.coldSummary;
  const coldSummary = upstreamColdSummary
    ? {
        ...upstreamColdSummary,
        longestGapDraws: scopeType === 'provider'
          ? upstreamColdSummary.longestGapDraws
          : dailyDrawsEqualDaysGroupScopes.has(scope)
            ? upstreamColdSummary.longestGapDays
            : undefined
      }
    : upstreamColdSummary;

  return NextResponse.json(
    {
      range: window,
      mode,
      prizeScopeKey,
      packageType,
      sourceType: feed.payload.sourceType,
      scopeType: feed.payload.scopeType,
      scope: feed.payload.scope,
      scopeLabel: feed.payload.scopeLabel,
      generatedAt: feed.payload.generatedAt,
      updatedAt: feed.payload.updatedAt,
      freshnessState: feed.payload.freshnessState,
      completeForCurrentCycle: feed.payload.completeForCurrentCycle,
      providerCount: feed.payload.includedProviders.length,
      drawCount: 0,
      numberCount,
      coldSummary,
      rankings: rows,
      providerSummaries: feed.payload.includedProviders.map((providerCode) => ({
        providerCode,
        providerName: providersByCode.get(providerCode)?.name ?? providerCode,
        drawCount: 0
      }))
    },
    {headers: {'Cache-Control': 'no-store'}}
  );
}
