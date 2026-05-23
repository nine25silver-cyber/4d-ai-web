import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {AiProviderLogoGrid} from '@/components/AiProviderLogoGrid';
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
  const t = await getTranslations({locale, namespace: 'AI'});
  return buildMetadata({locale, path: `/ai/${region.slug}`, title: t('metaTitle'), description: t('metaDescription')});
}

export default async function AiRegionPage({params}: {params: Promise<{locale: Locale; region: string}>}) {
  const {locale, region: regionSlug} = await params;
  const region = getRegion(regionSlug);
  if (!region) notFound();
  const t = await getTranslations({locale, namespace: 'AI'});
  return (
    <main className="container-shell py-8">
      <section className="border-b border-slate-200 pb-6">
        <p className="text-sm font-bold uppercase text-blue-800">4D AI</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{t('title')}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{t('providerLogoGridText')}</p>
      </section>
      <AiProviderLogoGrid locale={locale} regions={regions} title={t('providerLogoGridTitle')} text={t('providerLogoGridText')} />
    </main>
  );
}
