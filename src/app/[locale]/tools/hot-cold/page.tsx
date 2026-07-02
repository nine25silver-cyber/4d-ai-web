import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {HotColdToolClient} from '@/components/HotColdToolClient';
import type {Locale} from '@/i18n/routing';
import {regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  return buildMetadata({
    locale,
    path: '/tools/hot-cold',
    title: 'Hot and cold 4D numbers',
    description: 'Analyze hot and cold 4D number trends by provider and date range.'
  });
}

type TrendKind = 'hot' | 'cold';

function hotColdPageCopy(locale: Locale, mode: TrendKind) {
  if (locale === 'zh') {
    return {
      title: mode === 'hot' ? '热门4D' : '冷门4D'
    };
  }
  if (locale === 'ms') {
    return {
      title: mode === 'hot' ? '4D Panas' : '4D Sejuk'
    };
  }
  return {
    title: mode === 'hot' ? 'Hot 4D' : 'Cold 4D'
  };
}

export default async function HotColdToolPage({params, searchParams}: {params: Promise<{locale: Locale}>; searchParams?: Promise<{mode?: string}>}) {
  const {locale} = await params;
  const query = await searchParams;
  const mode: TrendKind = query?.mode === 'cold' ? 'cold' : 'hot';
  const pageCopy = hotColdPageCopy(locale, mode);
  const t = await getTranslations({locale, namespace: 'Tools'});
  const providers = regions.flatMap((region) => region.providers);
  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToTools')}</Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{pageCopy.title}</h1>
      </section>
        <HotColdToolClient
          locale={locale}
          providers={providers}
          initialTrendKind={mode}
          labels={{
            rangeLabel: t('rangeLabel'),
            range1y: t('range1y'),
            range2y: t('range2y'),
            range3y: t('range3y'),
            range5y: t('range5y'),
            range10y: t('range10y'),
            range15y: t('range15y'),
            range20y: t('range20y'),
            rangeAll: t('rangeAll'),
            providerSelectTitle: t('providerSelectTitle'),
            calculating: t('calculatingTrend'),
            noTrendYet: t('noTrendYet'),
            trendError: t('trendError'),
            hotNumbersTitle: t('hotNumbersTitle'),
            coldNumbersTitle: t('coldNumbersTitle'),
            timesLabel: t('timesLabel'),
            noTrendResults: t('noTrendResults')
          }}
        />
    </main>
  );
}
