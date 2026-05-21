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
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{locale === 'zh' ? '千字中奖记录' : locale === 'ms' ? 'Rekod Menang 3D' : '3D Winning Records'}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">
              {locale === 'zh'
                ? '支持正千字与包千字两种模式，可同时选择多个 provider。'
                : locale === 'ms'
                  ? 'Sokong mod tepat dan boxed 3D dengan pelbagai provider serentak.'
                  : 'Supports exact and boxed 3-digit matching across multiple providers.'}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{locale === 'zh' ? 'Cloudflare 历史' : locale === 'ms' ? 'Sejarah Cloudflare' : 'Cloudflare history'}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {locale === 'zh'
                ? '基于最新历史索引搜索，不显示假数据。'
                : locale === 'ms'
                  ? 'Carian berdasarkan indeks sejarah terkini tanpa data palsu.'
                  : 'Runs on live history indexes with no fake results.'}
            </p>
          </div>
        </div>
      </section>

      <ThousandHitsToolClient locale={locale} providers={providers} />
    </main>
  );
}


