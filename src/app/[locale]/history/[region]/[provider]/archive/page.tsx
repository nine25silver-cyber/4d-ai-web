import Link from 'next/link';
import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import type {Locale} from '@/i18n/routing';
import {getHistoryDiscovery, historyDiscoveryCopy} from '@/lib/history-discovery';
import {getRegion} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';

type Params = Promise<{locale: Locale; region: string; provider: string}>;

export async function generateMetadata({params}: {params: Params}): Promise<Metadata> {
  const {locale, region, provider} = await params;
  const entry = getHistoryDiscovery(region, provider);
  const company = getRegion(region)?.providers.find((item) => item.code === provider);
  if (!entry || !company) return {};
  const copy = historyDiscoveryCopy[locale];
  return buildMetadata({locale, path: `/history/${region}/${provider}/archive`, title: `${company.name} · ${copy.title}`, description: copy.intro});
}

export default async function HistoryArchivePage({params}: {params: Params}) {
  const {locale, region, provider} = await params;
  const entry = getHistoryDiscovery(region, provider);
  const company = getRegion(region)?.providers.find((item) => item.code === provider);
  if (!entry || !company) notFound();
  const copy = historyDiscoveryCopy[locale];
  return <main className="container-shell py-8">
    <Link href={`/${locale}/history/${region}/${provider}`} className="text-sm font-bold text-blue-800">{copy.back}</Link>
    <h1 className="mt-4 text-3xl font-black text-slate-950">{company.name} · {copy.title}</h1>
    <p className="mt-3 max-w-3xl text-slate-600">{copy.intro}</p>
    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entry.dates.map((date) => <li key={date}>
        <Link href={`/${locale}/history/${region}/${provider}/${date}`} className="block rounded-lg border border-slate-200 bg-white p-4 font-bold text-blue-800 hover:border-blue-400">
          <time dateTime={date}>{date}</time> · {copy.open}
        </Link>
      </li>)}
    </ul>
  </main>;
}
