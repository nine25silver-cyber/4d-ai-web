import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {RegionNav} from '@/components/RegionNav';
import {StructuredData} from '@/components/StructuredData';
import {routing, type Locale} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {buildMetadata, siteUrl} from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'History'});
  return buildMetadata({locale, path: '/history', title: t('metaTitle'), description: t('metaDescription')});
}

export default async function HistoryPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'History'});
  return (
    <main className="container-shell py-10">
      <StructuredData data={{'@context': 'https://schema.org', '@type': 'CollectionPage', name: t('title'), url: siteUrl(`/${locale}/history`)}} />
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">{t('intro')}</p>
        <div className="mt-6"><RegionNav locale={locale} /></div>
      </section>
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {regions.map((region) => (
          <Link key={region.slug} href={`/${locale}/history/${region.slug}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300">
            <h2 className="text-xl font-black text-slate-950">{region.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('regionCard', {region: region.label, count: region.providers.length})}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
              {region.providers.map((provider) => <span key={provider.code} className="rounded bg-slate-100 px-2 py-1">{provider.shortName}</span>)}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
