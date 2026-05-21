import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {SearchToolClient} from '@/components/SearchToolClient';
import {regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});
  return buildMetadata({locale, path: '/tools/search', title: t('searchMetaTitle'), description: t('searchMetaDescription')});
}

export default async function SearchToolPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});
  const providers = regions.flatMap((region) => region.providers);
  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToTools')}</Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">{t('numberSearchEyebrow')}</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('searchTitle')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('searchIntro')}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-black uppercase text-amber-800">{t('searchStatus')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('comingResultText')}</p>
          </div>
        </div>
      </section>
        <SearchToolClient
          locale={locale}
          providers={providers}
          labels={{
            numberLabel: t('numberLabel'),
            numberPlaceholder: t('numberPlaceholder'),
            modeLabel: t('modeLabel'),
            exactMode: t('exactMode'),
            boxedMode: t('boxedMode'),
            providerSelectTitle: t('providerSelectTitle'),
            providerSelectText: t('providerSelectText'),
            selectedProviders: t('selectedProviders'),
            selectAll: t('selectAll'),
            clearAll: t('clearAll'),
            dateRangeLabel: t('dateRangeLabel'),
            latest30: t('latest30'),
            allHistory: t('allHistory'),
            searchButton: t('searchButton'),
            searching: t('searching'),
            inputError: t('inputError'),
            noSearchYet: t('noSearchYet'),
            resultCount: t('resultCount', {count: '{count}'}),
            noResults: t('noResults'),
            resultProvider: t('resultProvider'),
            resultDate: t('resultDate'),
            resultDraw: t('resultDraw'),
            resultPrize: t('resultPrize'),
            openResult: t('openResult'),
            top3Prize: t('top3Prize'),
            specialPrizeResult: t('specialPrizeResult'),
            consolationPrizeResult: t('consolationPrizeResult')
          }}
        />

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">{t('searchRuleTitle')}</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          <li>{t('searchRule1')}</li>
          <li>{t('searchRule2')}</li>
          <li>{t('searchRule3')}</li>
        </ul>
      </section>
    </main>
  );
}


