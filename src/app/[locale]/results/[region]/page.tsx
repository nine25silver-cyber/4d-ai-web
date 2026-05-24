import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {LiveResultsGrid} from '@/components/LiveResultsGrid';
import {RegionNav} from '@/components/RegionNav';
import {StructuredData} from '@/components/StructuredData';
import {fetchRegionLatest} from '@/lib/cloudflare';
import {getRegion} from '@/lib/providers';
import {buildMetadata, siteUrl} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) return {};
  return buildMetadata({
    locale,
    path: `/results/${region.slug}`,
    title: `${region.label} 4D results`,
    description: `View latest 4D results for ${region.label}.`
  });
}

export default async function RegionResultsPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) notFound();
  const t = await getTranslations({locale, namespace: 'Results'});
  const results = await fetchRegionLatest(region.providers.map((provider) => provider.code));
  const jsonLd = results.filter((result) => result.ok).map((result) => ({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${result.payload.provider_code} 4D result`,
    url: siteUrl(`/${locale}/results/${region.slug}`),
    dateModified: result.payload.updated_at || result.payload.generated_at || undefined,
    spatialCoverage: region.label,
    variableMeasured: ['draw_date', 'draw_no', 'first_prize', 'second_prize', 'third_prize'],
    distribution: {'@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: result.url}
  }));
  return (
    <main className="container-shell py-8">
      <StructuredData data={jsonLd} />
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6">
        <div>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{t('title', {region: region.label})}</h1>
        </div>
        <RegionNav locale={locale} active={region.slug} />
      </div>
      <div className="my-6 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm font-semibold text-slate-500">Ad slot placeholder for free users</div>
      <LiveResultsGrid regionSlug={region.slug} providers={region.providers} initialResults={results} />
    </main>
  );
}
