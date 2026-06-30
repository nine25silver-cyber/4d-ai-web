import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
import {LiveResultsGrid} from '@/components/LiveResultsGrid';
import {StructuredData} from '@/components/StructuredData';
import {fetchRegionLatest} from '@/lib/cloudflare';
import {getRegion, regions, type ProviderConfig} from '@/lib/providers';
import {buildMetadata, siteUrl} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const latestResultMarkets = [
  {
    id: 'west-malaysia',
    label: 'West Malaysia',
    hrefRegion: 'west-malaysia',
    activeRegions: ['west-malaysia'],
    providerCodes: ['magnum', 'da_ma_cai', 'sports_toto'],
    refreshRegions: ['west-malaysia']
  },
  {
    id: 'east-malaysia',
    label: 'East Malaysia',
    hrefRegion: 'east-malaysia',
    activeRegions: ['east-malaysia'],
    providerCodes: ['sandakan', 'sabah88', 'sarawak'],
    refreshRegions: ['east-malaysia']
  },
  {
    id: 'international',
    label: 'International',
    hrefRegion: 'cambodia',
    activeRegions: ['cambodia', 'singapore'],
    providerCodes: ['singapore', 'grand_dragon', 'nine_lotto'],
    refreshRegions: ['singapore', 'cambodia']
  }
] as const;

function getMarketForRegion(regionSlug: string) {
  return latestResultMarkets.find((market) => (market.activeRegions as readonly string[]).includes(regionSlug));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) return {};
  const market = getMarketForRegion(region.slug);
  return buildMetadata({
    locale,
    path: `/results/${region.slug}`,
    title: `${market?.label ?? region.label} Latest 4D Results`,
    description: `View latest 4D results for ${market?.label ?? region.label}.`
  });
}

export default async function RegionResultsPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) notFound();
  const activeMarket = getMarketForRegion(region.slug);
  if (!activeMarket) notFound();
  const t = await getTranslations({locale, namespace: 'Results'});
  const providerByCode = new Map(regions.flatMap((item) => item.providers).map((provider) => [provider.code, provider]));
  const providers = activeMarket.providerCodes
    .map((providerCode) => providerByCode.get(providerCode))
    .filter((provider): provider is ProviderConfig => Boolean(provider));
  const results = await fetchRegionLatest([...activeMarket.providerCodes]);
  const jsonLd = results.filter((result) => result.ok).map((result) => ({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${result.payload.provider_code} 4D result`,
    url: siteUrl(`/${locale}/results/${region.slug}`),
    dateModified: result.payload.updated_at || result.payload.generated_at || undefined,
    spatialCoverage: activeMarket.label,
    variableMeasured: ['draw_date', 'draw_no', 'first_prize', 'second_prize', 'third_prize'],
    distribution: {'@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: result.url}
  }));
  return (
    <main className="container-shell pt-2 pb-6">
      <StructuredData data={jsonLd} />
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-2">
        <div>
          <h1 className="mt-0.5 text-xl font-black text-slate-950 sm:text-2xl">{t('title', {region: activeMarket.label})}</h1>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-md border border-slate-200 bg-white p-1" data-market-tabs>
          {latestResultMarkets.map((market) => (
            <Link
              key={market.id}
              href={`/${locale}/results/${market.hrefRegion}`}
              data-market-card={market.id}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-black transition hover:border-blue-300 ${
                activeMarket.id === market.id
                  ? 'border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-blue-50'
              }`}
            >
              {market.label}
            </Link>
          ))}
        </div>
      </div>
      <LiveResultsGrid regionSlug={region.slug} refreshRegionSlugs={[...activeMarket.refreshRegions]} providers={providers} initialResults={results} />
      <div className="my-4 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-500">Ad slot placeholder for free users</div>
    </main>
  );
}
