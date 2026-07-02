import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound, redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {HistoryAdBanner} from '@/components/HistoryAdBanner';
import {HistoryResultsGrid} from '@/components/HistoryResultsGrid';
import {fetchHistoryDaily, fetchRegionHistoryLatest30} from '@/lib/cloudflare';
import {regions, type ProviderConfig} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const historyMarkets = [
  {
    slug: 'west-malaysia',
    label: 'West Malaysia',
    providerCodes: ['magnum', 'da_ma_cai', 'sports_toto']
  },
  {
    slug: 'east-malaysia',
    label: 'East Malaysia',
    providerCodes: ['sandakan', 'sabah88', 'sarawak']
  },
  {
    slug: 'international',
    label: 'International',
    providerCodes: ['singapore', 'grand_dragon', 'nine_lotto']
  }
] as const;

const historyRegionAliases: Record<string, string> = {
  cambodia: 'international',
  singapore: 'international'
};

function sortDatesNewestFirst(dates: string[]) {
  return Array.from(new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)))).sort((left, right) => right.localeCompare(left));
}

function canonicalHistoryRegionSlug(regionSlug: string) {
  return historyRegionAliases[regionSlug] ?? regionSlug;
}

function getHistoryMarket(regionSlug: string) {
  const canonicalSlug = canonicalHistoryRegionSlug(regionSlug);
  return historyMarkets.find((market) => market.slug === canonicalSlug);
}

function getHistoryProviders(regionSlug: string): ProviderConfig[] {
  const providerByCode = new Map(regions.flatMap((item) => item.providers).map((provider) => [provider.code, provider]));
  const market = getHistoryMarket(regionSlug);
  if (!market) return [];
  return market.providerCodes
    .map((providerCode) => providerByCode.get(providerCode))
    .filter((provider): provider is ProviderConfig => Boolean(provider));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug} = await params;
  const market = getHistoryMarket(regionSlug);
  if (!market) return {};
  return buildMetadata({
    locale,
    path: `/history/${market.slug}`,
    title: `${market.label} 4D history`,
    description: `Browse recent 4D history dates for ${market.label}.`
  });
}

export default async function RegionHistoryPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const market = getHistoryMarket(regionSlug);
  if (!market) notFound();
  if (regionSlug !== market.slug) redirect(`/${locale}/history/${market.slug}`);
  const providers = getHistoryProviders(market.slug);
  if (providers.length === 0) notFound();
  const t = await getTranslations({locale, namespace: 'History'});
  const states = await fetchRegionHistoryLatest30(providers.map((provider) => provider.code));
  const initialResults = await Promise.all(states.map(async (state) => {
    if (!state.ok) {
      return {ok: false as const, providerCode: state.providerCode, url: state.url, reason: state.reason};
    }
    const latestDate = sortDatesNewestFirst(state.payload.dates)[0];
    if (!latestDate) {
      return {ok: false as const, providerCode: state.providerCode, url: state.url, reason: 'no_dates'};
    }
    return fetchHistoryDaily(state.providerCode, latestDate);
  }));
  return (
    <main className="container-shell pt-2 pb-6">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-2">
        <div>
          <h1 className="text-xl font-black text-slate-950 sm:text-2xl">{t('regionTitle', {region: market.label})}</h1>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-md border border-slate-200 bg-white p-1" data-market-tabs>
          {historyMarkets.map((tab) => (
            <Link
              key={tab.slug}
              href={`/${locale}/history/${tab.slug}`}
              data-market-card={tab.slug}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-black transition hover:border-blue-300 ${
                market.slug === tab.slug
                  ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      <HistoryResultsGrid locale={locale} providers={providers} initialIndexes={states} initialResults={initialResults} />
      <HistoryAdBanner />
    </main>
  );
}
