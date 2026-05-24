import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {fetchHistoryLatest30} from '@/lib/cloudflare';
import {getRegion} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  return buildMetadata({
    locale,
    path: `/history/${region.slug}/${provider.code}`,
    title: `${provider.name} 4D history`,
    description: `Browse recent 4D draw history for ${provider.name}.`
  });
}

export default async function ProviderHistoryPage({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}) {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) notFound();
  const t = await getTranslations({locale, namespace: 'History'});
  const state = await fetchHistoryLatest30(provider.code);
  return (
    <main className="container-shell py-8">
      <Link href={`/${locale}/history/${region.slug}`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToRegion')}</Link>
      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-blue-800">{region.label}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{t('providerTitle', {provider: provider.name})}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{t('providerIntro')}</p>
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-black text-slate-950">{t('latest30Title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('jackpotHiddenNote')}</p>
        </div>
        {state.ok ? (
          <div className="divide-y divide-slate-100">
            {(state.payload.entries.length > 0 ? state.payload.entries : state.payload.dates.map((date) => ({draw_date: date, draw_no: undefined, source_type: undefined}))).slice(0, 30).map((entry) => (
              <div key={entry.draw_date} className="grid gap-2 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                <div className="font-bold text-slate-950">{entry.draw_date}</div>
                <div className="text-sm text-slate-600">{t('drawNo')}: {entry.draw_no ?? '-'}</div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-xs font-semibold uppercase text-slate-500">{entry.source_type ?? 'cloudflare_history'}</div>
                  <Link href={`/${locale}/history/${region.slug}/${provider.code}/${entry.draw_date}`} className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-900 hover:bg-blue-100">
                    {t('openDraw')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-sm text-slate-600">{t('historyUnavailable')}: {state.reason}</div>
        )}
      </section>
    </main>
  );
}
