import Link from 'next/link';
import type {Metadata} from 'next';
import {regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {PackageRankingToolClientV2} from '@/components/PackageRankingToolClientV2';

export const dynamic = 'force-dynamic';

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

      <PackageRankingToolClientV2 locale={locale} providers={providers} />
    </main>
  );
}
