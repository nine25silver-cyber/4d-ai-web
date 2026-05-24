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

export default async function HotColdToolPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});
  const providers = regions.flatMap((region) => region.providers);
  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToTools')}</Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">{t('hotColdEyebrow')}</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('hotColdPageTitle')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('hotColdPageIntro')}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{t('hotColdDateRangeTitle')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('hotColdDateRangeText')}</p>
          </div>
        </div>
      </section>
        <HotColdToolClient
          locale={locale}
          providers={providers}
          labels={{
            rangeLabel: t('rangeLabel'),
            range1y: t('range1y'),
            range2y: t('range2y'),
            range3y: t('range3y'),
            range5y: t('range5y'),
            range10y: t('range10y'),
            range15y: t('range15y'),
            range20y: t('range20y'),
            range30y: t('range30y'),
            rangeAll: t('rangeAll'),
            providerSelectTitle: t('providerSelectTitle'),
            providerSelectText: t('providerSelectText'),
            selectedProviders: t('selectedProviders'),
            selectAll: t('selectAll'),
            clearAll: t('clearAll'),
            hotSearchButton: t('hotSearchButton'),
            coldSearchButton: t('coldSearchButton'),
            calculating: t('calculatingTrend'),
            noTrendYet: t('noTrendYet'),
            trendError: t('trendError'),
            summaryTitle: t('summaryTitle'),
            drawsScanned: t('drawsScanned'),
            numbersScanned: t('numbersScanned'),
            hotNumbersTitle: t('hotNumbersTitle'),
            coldNumbersTitle: t('coldNumbersTitle'),
            digitFrequencyTitle: t('digitFrequencyTitle'),
            providerSummaryTitle: t('providerSummaryTitle'),
            timesLabel: t('timesLabel'),
            latestDateLabel: t('latestDateLabel'),
            providersLabel: t('providersLabel'),
            noTrendResults: t('noTrendResults')
          }}
        />
    </main>
  );
}
