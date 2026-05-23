import Link from 'next/link';
import type {Metadata} from 'next';
import {regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';
import {ThousandHitsToolClient} from '@/components/ThousandHitsToolClient';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const title = locale === 'zh' ? '千字中奖记录 - 4D AI' : locale === 'ms' ? 'Rekod Menang 3D - 4D AI' : '3D Winning Records - 4D AI';
  const description = locale === 'zh'
    ? '搜索 3 位数字在历史开奖中的命中记录。'
    : locale === 'ms'
      ? 'Cari rekod padanan 3 digit dalam sejarah keputusan.'
      : 'Search historical winning records by 3-digit target.';
  return buildMetadata({locale, path: '/tools/thousand-hits', title, description});
}

export default async function ThousandHitsPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const providers = regions.flatMap((region) => region.providers);

  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">
        {locale === 'zh' ? '返回工具' : locale === 'ms' ? 'Kembali ke alat' : 'Back to tools'}
      </Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">{locale === 'zh' ? '千字搜索' : locale === 'ms' ? 'Carian 3D' : '3D search'}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{locale === 'zh' ? '千字中奖记录' : locale === 'ms' ? 'Rekod Menang 3D' : '3D Winning Records'}</h1>
      </section>

      <ThousandHitsToolClient locale={locale} providers={providers} />
    </main>
  );
}
