import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {ResultCard} from '@/components/ResultCard';
import {fetchHistoryDaily, fetchHistoryLatest30} from '@/lib/cloudflare';
import {getRegion} from '@/lib/providers';
import {resultCardLabels} from '@/lib/result-labels';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string; date: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode, date} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  const t = await getTranslations({locale, namespace: 'History'});
  return buildMetadata({
    locale,
    path: `/history/${region.slug}/${provider.code}/${date}`,
    title: t('dailyMetaTitle', {provider: provider.name, date}),
    description: t('dailyMetaDescription', {provider: provider.name, date})
  });
}

export default async function HistoryDailyPage({params}: {params: Promise<{locale: Locale; region: string; provider: string; date: string}>}) {
  const {locale, region: regionSlug, provider: providerCode, date} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider || !/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const historyT = await getTranslations({locale, namespace: 'History'});
  const resultsT = await getTranslations({locale, namespace: 'Results'});
  const [daily, index] = await Promise.all([fetchHistoryDaily(provider.code, date), fetchHistoryLatest30(provider.code)]);
  const dates = index.ok ? index.payload.dates : [];
  const currentIndex = dates.indexOf(date);
  const nextDate = currentIndex > 0 ? dates[currentIndex - 1] : undefined;
  const previousDate = currentIndex >= 0 && currentIndex < dates.length - 1 ? dates[currentIndex + 1] : undefined;

  return (
    <main className="container-shell py-8">
      <Link href={`/${locale}/history/${region.slug}/${provider.code}`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{historyT('backToProvider')}</Link>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">{region.label}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{historyT('dailyTitle', {provider: provider.name})}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{date} | {historyT('dailyIntro')}</p>
      </section>

      <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {previousDate ? (
          <Link href={`/${locale}/history/${region.slug}/${provider.code}/${previousDate}`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:border-blue-300">{historyT('previousDraw')}: {previousDate}</Link>
        ) : (
          <span className="text-sm font-semibold text-slate-400">{historyT('noPreviousDraw')}</span>
        )}
        {nextDate ? (
          <Link href={`/${locale}/history/${region.slug}/${provider.code}/${nextDate}`} className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-black text-blue-900 hover:bg-blue-100">{historyT('nextDraw')}: {nextDate}</Link>
        ) : (
          <span className="text-sm font-semibold text-slate-400">{historyT('noNextDraw')}</span>
        )}
      </nav>

      <section className="mt-6 max-w-2xl">
        <ResultCard provider={provider} result={daily} labels={resultCardLabels(resultsT)} />
      </section>
    </main>
  );
}

