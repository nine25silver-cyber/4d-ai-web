import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {RegionNav} from '@/components/RegionNav';
import {fetchRegionHistoryLatest30} from '@/lib/cloudflare';
import {getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => regions.map((region) => ({locale, region: region.slug})));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) return {};
  const t = await getTranslations({locale, namespace: 'History'});
  return buildMetadata({locale, path: `/history/${region.slug}`, title: t('regionMetaTitle', {region: region.label}), description: t('regionMetaDescription', {region: region.label})});
}

export default async function RegionHistoryPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) notFound();
  const t = await getTranslations({locale, namespace: 'History'});
  const states = await fetchRegionHistoryLatest30(region.providers.map((provider) => provider.code));
  const stateMap = new Map(states.map((state) => [state.providerCode, state]));
  return (
    <main className="container-shell py-8">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-6">
        <div>
          <p className="text-sm font-bold uppercase text-blue-800">{t('eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{t('regionTitle', {region: region.label})}</h1>
          <p className="mt-3 max-w-3xl text-slate-600">{t('regionIntro')}</p>
        </div>
        <RegionNav locale={locale} active={region.slug} />
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {region.providers.map((provider) => {
          const state = stateMap.get(provider.code);
          const latestDate = state?.ok ? state.payload.dates[0] : undefined;
          const entryCount = state?.ok ? state.payload.dates.length : 0;
          return (
            <article key={provider.code} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{provider.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{state?.ok ? t('availableDates', {count: entryCount}) : t('historyUnavailable')}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">latest30</span>
              </div>
              {state?.ok ? (
                <div className="mt-4">
                  <p className="text-sm text-slate-600">{t('latestHistoryDate')}: <strong>{latestDate ?? '-'}</strong></p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {state.payload.dates.slice(0, 8).map((date) => <span key={date} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">{date}</span>)}
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">{state?.reason ?? 'not_requested'}</p>
              )}
              <Link href={`/${locale}/history/${region.slug}/${provider.code}`} className="mt-5 inline-flex rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">
                {t('openProviderHistory')}
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
