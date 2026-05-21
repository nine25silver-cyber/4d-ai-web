import Link from 'next/link';
import type {Metadata} from 'next';
import {regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';
import {PackageRankingToolClientV2} from '@/components/PackageRankingToolClientV2';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const title = locale === 'zh' ? '包字排行榜 - 4D AI' : locale === 'ms' ? 'Ranking Boxed - 4D AI' : 'Boxed Ranking - 4D AI';
  const description = locale === 'zh'
    ? '按 provider 与时间范围统计 4D 包字出现次数。'
    : locale === 'ms'
      ? 'Kira kekerapan boxed 4D mengikut provider dan julat masa.'
      : 'Analyze 4D boxed frequency by provider and date range.';
  return buildMetadata({locale, path: '/tools/package-ranking', title, description});
}

export default async function PackageRankingPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const providers = regions.flatMap((region) => region.providers);

  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">
        {locale === 'zh' ? '返回工具' : locale === 'ms' ? 'Kembali ke alat' : 'Back to tools'}
      </Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">{locale === 'zh' ? '包字分析' : locale === 'ms' ? 'Analisis Boxed' : 'Boxed analysis'}</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{locale === 'zh' ? '包字排行榜' : locale === 'ms' ? 'Ranking Boxed' : 'Boxed Ranking'}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">
              {locale === 'zh'
                ? '按时间范围与 provider 统计高频包字，帮助用户快速筛选重点号码组合。'
                : locale === 'ms'
                  ? 'Kira boxed paling kerap mengikut julat masa dan provider untuk tapis kombinasi utama dengan cepat.'
                  : 'Rank the most frequent boxed combinations by range and providers for quick filtering.'}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{locale === 'zh' ? 'Cloudflare 数据' : locale === 'ms' ? 'Data Cloudflare' : 'Cloudflare data'}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {locale === 'zh'
                ? '基于 Cloudflare 历史开奖记录统计，支持多 provider 同时计算。'
                : locale === 'ms'
                  ? 'Dikira daripada sejarah Cloudflare, menyokong pelbagai provider serentak.'
                  : 'Calculated from Cloudflare history with multi-provider support.'}
            </p>
          </div>
        </div>
      </section>

      <PackageRankingToolClientV2 locale={locale} providers={providers} />
    </main>
  );
}

